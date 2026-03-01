import os
try:
    from apify_client import ApifyClient
except ImportError:
    ApifyClient = None
from pymongo import MongoClient
import dotenv
from datetime import datetime
from bs4 import BeautifulSoup

# Load env variables
dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

# Configuration
APIFY_TOKEN = os.getenv('APIFY_API_TOKEN')
MONGO_URI = os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire"

# Actors
ACTORS = {
    'indeed_valig': 'valig/indeed-jobs-scraper', 
    'indeed_easy': 'easyapi/indeed-jobs-scraper'
}

# ...

def _get_logo(company_name):
    """Generate a custom static avatar for non-extractable companies."""
    if not company_name:
        return None
    import urllib.parse
    encoded = urllib.parse.quote(company_name)
    return f"https://ui-avatars.com/api/?name={encoded}&background=random&color=fff&size=128"

def run_apify_scraper(actor_id, run_input):
    if not APIFY_TOKEN:
        print("Error: APIFY_API_TOKEN not found in .env.local")
        return
    if not ApifyClient:
        print("Error: apify-client not installed. Run: pip install apify-client")
        return

    client = ApifyClient(APIFY_TOKEN)

    print(f"Starting Apify run for {actor_id}...")
    try:
        # Start the actor and wait for it to finish
        run = client.actor(actor_id).call(run_input=run_input)
        
        print(f"Run finished. Dataset ID: {run['defaultDatasetId']}")
        
        # Fetch results
        dataset_items = client.dataset(run['defaultDatasetId']).list_items().items
        print(f"Fetched {len(dataset_items)} items")
        
        save_to_db(dataset_items, actor_id)

    except Exception as e:
        print(f"Apify run failed: {e}")

def save_to_db(items, source):
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    jobs_collection = db.jobs
    
    count = 0
    for item in items:
        try:
            # Normalize fields based on source
            title = item.get('title') or item.get('position')
            
            # Company extraction
            company = item.get('company') or item.get('companyName')
            if not company and isinstance(item.get('employer'), dict):
                company = item.get('employer', {}).get('name')
                
            # Location extraction
            location = item.get('location')
            if isinstance(location, dict):
                # Try to construct a string from location object
                parts = [
                    location.get('city'), 
                    location.get('region'), 
                    location.get('country') or location.get('countryName')
                ]
                location = ", ".join([p for p in parts if p])
            
            url = item.get('url') or item.get('link') or item.get('jobUrl')
            
            raw_desc = item.get('description') or item.get('descriptionHtml') or ''
            clean_desc = BeautifulSoup(raw_desc, "html.parser").get_text(separator="\n").strip() if raw_desc else ""

            if not title or not url:
                continue

            import hashlib
            dedupe_str = f"{(title or '').lower()} {(company or '').lower()} {(location or '').lower()}"
            link_hash = hashlib.md5(dedupe_str.encode('utf-8')).hexdigest()
            source_hash = f"apify_{link_hash}"
            
            # Experience Extraction
            import re
            experience_val = "Not Specified"
            if "intern" in (title or "").lower() or "fresher" in (title or "").lower():
                experience_val = "Fresher"
            else:
                exp_match = re.search(r'(\d+)\+?\s*(?:to|-)?\s*(\d+)?\s*(?:years?|yrs?|yr)[\s\w]{0,15}experience', clean_desc, re.IGNORECASE)
                if exp_match:
                    min_y, max_y = exp_match.groups()
                    experience_val = f'{min_y}-{max_y} Years' if max_y else f'{min_y}+ Years'
                else:
                    exp_match2 = re.search(r'experience.*?(?:of|:)?\s*(\d+)\+?\s*(?:to|-)?\s*(\d+)?\s*(?:years?|yrs?|yr)', clean_desc[:2000], re.IGNORECASE)
                    if exp_match2:
                        min_y, max_y = exp_match2.groups()
                        experience_val = f'{min_y}-{max_y} Years' if max_y else f'{min_y}+ Years'
            
            # Job Type
            raw_type = item.get("jobType") or item.get("employmentType") or []
            if isinstance(raw_type, list) and raw_type:
                job_type = raw_type[0]
            elif isinstance(raw_type, str):
                job_type = raw_type
            else:
                job_type = "Internship" if "intern" in (title or "").lower() else "Full-time"
            
            # Logo
            logo = item.get('companyLogo') or item.get('logo') or _get_logo(company)

            job_doc = {
                "title": title,
                "company": company,
                "location": location,
                "apply_link": url,
                "logo": logo,
                "tags": ["Apify", source],
                "source_hash": source_hash,
                "is_active": True,
                "is_processed": False,
                "public_release_at": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "description": clean_desc,
                "experience": experience_val,
                "job_type": job_type.title(),
                "raw_data": item
            }
            
            jobs_collection.update_one(
                {"source_hash": source_hash},
                {"$set": job_doc},
                upsert=True
            )
            count += 1
        except Exception as e:
            print(f"Error saving item: {e}")
            
    print(f"Upserted {count} jobs from {source}")


if __name__ == "__main__":
    QUERIES = [
        "software engineer fresher", 
        "sde intern", 
        "developer 2025", 
        "frontend entry level"
    ]

    valig_input = {
        "queries": QUERIES,
        "location": "India",
        "country": "in",
        "maxResults": 50
    }

    print(f"Running Indeed Scraper (Valig) via Apify for {len(QUERIES)} queries...")
    # Note: verified to work on free tier WITHOUT proxyConfiguration
    run_apify_scraper(ACTORS['indeed_valig'], valig_input)
