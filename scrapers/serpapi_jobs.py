import os
import requests
import dotenv
from pymongo import MongoClient
from datetime import datetime
from bs4 import BeautifulSoup

# Import shared utils
import utils

# Optional retry support — install with: pip install tenacity
try:
    from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
    _HAS_TENACITY = True
except ImportError:
    _HAS_TENACITY = False

# Load env variables
dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

SERPAPI_KEY = os.getenv('SERPAPI_KEY')
MONGO_URI = ((os.getenv('MONGODB_URI') or "").strip() or "mongodb://localhost:27017/skillhire" or "").strip()

def _get_logo(company_name):
    """Generate a custom static avatar for non-extractable companies."""
    if not company_name:
        return None
    import urllib.parse
    encoded = urllib.parse.quote(company_name)
    return f"https://ui-avatars.com/api/?name={encoded}&background=random&color=fff&size=128"

def _do_request(params):
    """Make the SerpAPI HTTP call with optional exponential-backoff retry."""
    if _HAS_TENACITY:
        @retry(
            reraise=True,
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=8),
            retry=retry_if_exception_type((requests.RequestException, ValueError))
        )
        def _fetch():
            r = requests.get("https://serpapi.com/search", params=params, timeout=15)
            r.raise_for_status()
            return r.json()
        return _fetch()
    else:
        # No tenacity — plain single request
        r = requests.get("https://serpapi.com/search", params=params, timeout=15)
        r.raise_for_status()
        return r.json()

def fetch_google_jobs(location="India"):
    if not SERPAPI_KEY:
        print("Error: SERPAPI_KEY not found in .env.local")
        return

    QUERIES = [
        "entry level software developer jobs in India", 
        "software engineer intern jobs in India", 
        "data analyst fresher jobs India"
    ]

    import random
    # RATE LIMIT PROTECTION: Select only 1 random query per run. 
    # Running 3x a day = 90 searches/month (stays under 100 free limit).
    QUERIES = [random.choice(QUERIES)]

    for smart_query in QUERIES:
        params = {
            "engine": "google_jobs",
            "q": smart_query,
            "location": location,
            "google_domain": "google.co.in",
            "hl": "en", 
            "gl": "in",
            "tbs": "qdr:d", # Past 24 hours
            "api_key": SERPAPI_KEY
        }

        print(f"Fetching Google Jobs via SerpApi for '{smart_query}' in '{location}'...")
        try:
            data = _do_request(params)

            # Check for error
            if "error" in data:
                print(f"SerpApi Error: {data['error']}")
                continue

            jobs = data.get("jobs_results", [])
            print(f"Found {len(jobs)} jobs for query '{smart_query}'.")
            
            save_to_db(jobs)
            
        except Exception as e:
            print(f"SerpApi request failed for '{smart_query}': {e}")

def save_to_db(jobs):
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    jobs_collection = db.jobs
    
    count = 0
    for job in jobs:
        try:
            title = job.get("title")
            company = job.get("company_name")
            location = job.get("location") or "India"
            raw_desc = job.get("description", "")
            clean_desc = BeautifulSoup(raw_desc, "html.parser").get_text(separator="\n").strip() if raw_desc else ""
            
            # Apply options
            apply_options = job.get("apply_options", [])
            apply_link = None
            if apply_options:
                apply_link = apply_options[0].get("link")
                for opt in apply_options:
                    title_lower = opt.get("title", "").lower()
                    if "linkedin" in title_lower or "company" in title_lower or "careers" in title_lower:
                        apply_link = opt.get("link")
                        break
            
            if not apply_link:
                 apply_link = job.get("share_link")
            
            if not title or not apply_link:
                continue

            # Normalized Fields via Utils
            experience_val = utils.normalize_experience(None, title) # Use title first
            # Attempt to extract from description if not obvious in title
            if experience_val == "Not Specified":
                experience_val = utils.normalize_experience(clean_desc, title)
            
            raw_type = job.get("detected_extensions", {}).get("schedule_type", "Unknown")
            if raw_type == "Unknown":
                extensions = " ".join(job.get("extensions", []))
                job_type = utils.normalize_job_type(extensions, title)
            else:
                job_type = utils.normalize_job_type(raw_type, title)

            source_hash = utils.generate_source_hash("serpapi", title, company, location)
            logo = job.get("thumbnail") or utils.get_logo(company)
            random_time = utils.get_random_created_at()

            # Salary extraction
            salary_info = job.get("detected_extensions", {}).get("salary")

            job_doc = {
                "title": title,
                "company": company,
                "location": location,
                "apply_link": apply_link,
                "logo": logo,
                "tags": ["SerpApi", "Google Jobs"],
                "source_hash": source_hash,
                "is_active": True,
                "is_processed": False,
                "public_release_at": random_time,
                "created_at": random_time,
                "description": clean_desc,
                "experience": experience_val,
                "job_type": job_type,
                "raw_data": job
            }

            if salary_info:
                job_doc["salary_status"] = salary_info
            
            jobs_collection.update_one(
                {"source_hash": source_hash},
                {
                    "$set": job_doc,
                    "$setOnInsert": {
                        "distribution_status": "pending",
                        "distributed_channels": []
                    }
                },
                upsert=True
            )
            count += 1
        except Exception as e:
            print(f"Error saving job: {e}")
            
    print(f"Upserted {count} jobs.")

if __name__ == "__main__":
    fetch_google_jobs()
