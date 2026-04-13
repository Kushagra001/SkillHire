"""
Wellfound (formerly AngelList) Job Scraper for India via SerpApi.
Wellfound heavily protects its pages and API with Cloudflare challenges (403 Forbidden).
To bypass this reliably in an automated environment, we leverage SerpApi's Organic Google Search
specifically querying `site:wellfound.com/jobs` for Indian tech roles.
"""

import os
import sys
import time
import logging
from pymongo import MongoClient
import requests
import dotenv

# Set up paths to access shared utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scrapers import utils

# Optional retry support
try:
    from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
    _HAS_TENACITY = True
except ImportError:
    _HAS_TENACITY = False

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

SERPAPI_KEY = os.getenv('SERPAPI_KEY')
MONGO_URI = ((os.getenv('MONGODB_URI') or "").strip() or "mongodb://localhost:27017/skillhire").strip()

# Tech keywords to ensure we only scrape relevant roles
TECH_KEYWORDS = [
    "software", "developer", "engineer", "frontend", "backend", "fullstack", 
    "data", "ml", "ai", "cloud", "devops", "product", "manager", "qa", "sdet", "android", "ios", "qa"
]

def _do_request(params):
    """Make the SerpAPI HTTP call with optional retry."""
    if _HAS_TENACITY:
        @retry(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=10),
            retry=retry_if_exception_type((requests.exceptions.RequestException, ValueError)),
            reraise=True
        )
        def _fetch():
            resp = requests.get("https://serpapi.com/search", params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            if "error" in data:
                raise ValueError(f"SerpAPI Error: {data['error']}")
            return data
        return _fetch()
    else:
        resp = requests.get("https://serpapi.com/search", params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        if "error" in data:
            raise ValueError(f"SerpAPI Error: {data['error']}")
        return data

def fetch_wellfound_jobs():
    """Fetch Wellfound jobs via SerpApi organic search."""
    if not SERPAPI_KEY:
        logger.error("No SERPAPI_KEY found in env!")
        return []

    logger.info("Starting Wellfound fetch via SerpApi Organic Search...")
    all_jobs = []
    
    # We construct organic exact search queries
    queries = [
        'site:wellfound.com/jobs "software engineer" ("India" OR "Remote")',
        'site:wellfound.com/jobs "backend developer" ("India" OR "Remote")',
        'site:wellfound.com/jobs "frontend developer" ("India" OR "Remote")',
        'site:wellfound.com/jobs "data engineer" ("India" OR "Remote")',
    ]
    
    for query in queries:
        # Paginating max 3 pages (30 results) per query to save credits
        for start in range(0, 30, 10):
            params = {
                "engine": "google",
                "q": query,
                "hl": "en",
                "gl": "in",      # India targeting
                "tbs": "qdr:w",  # Past week only to keep it fresh
                "api_key": SERPAPI_KEY,
                "start": start,
                "num": 10
            }

            try:
                data = _do_request(params)
                organic_results = data.get("organic_results", [])
                
                if not organic_results:
                    break # No more pages

                for r in organic_results:
                    # Validate URL is a wellfound job URL
                    if "wellfound.com/jobs/" not in r.get("link", ""):
                        continue
                    all_jobs.append(r)
                
                logger.info(f"  Fetched {len(organic_results)} organic results for '{query}' (start={start})")
                time.sleep(1) # Respectful delay
                
            except Exception as e:
                logger.error(f"  Failed for query='{query}' start={start}: {e}")
                break

    # Deduplicate by link
    unique_links = set()
    deduped = []
    for j in all_jobs:
        link = j.get("link")
        if link not in unique_links:
            unique_links.add(link)
            deduped.append(j)

    return deduped


def save_to_db(organic_jobs):
    if not organic_jobs:
        return

    client = MongoClient(MONGO_URI)
    collection = client.get_database("skillhire").jobs

    count = 0
    for job in organic_jobs:
        try:
            raw_title = job.get("title", "").strip()
            if not raw_title:
                continue
                
            # Usually format is "Software Engineer at StartUp Name" or "Company Name hiring Software Engineer"
            title = raw_title
            company = "Wellfound Startup"
            
            if " at " in raw_title:
                parts = raw_title.split(" at ")
                title = parts[0].strip()
                company = parts[1].replace(" - Wellfound", "").strip()
            elif " hiring " in raw_title:
                parts = raw_title.split(" hiring ")
                company = parts[0].strip()
                title = parts[1].replace(" - Wellfound", "").strip()
            
            # Clean up default Wellfound suffixes in titles
            title = title.replace("| Wellfound", "").replace("- Wellfound", "").strip()
            company = company.replace("| Wellfound", "").replace("- Wellfound", "").strip()

            if not any(kw.lower() in title.lower() for kw in TECH_KEYWORDS):
                continue

            apply_link = job.get("link")
            # Extract stable job ID from URL e.g. https://wellfound.com/jobs/3362153-software-engineer
            # Fallback to link hash if no ID
            job_id_part = apply_link.split("/jobs/")[-1].split("-")[0]
            if job_id_part.isdigit():
                source_hash = f"wellfound_{job_id_part}"
            else:
                source_hash = utils.generate_source_hash("wellfound", title, company, "India")

            snippet = job.get("snippet", "")
            
            # Estimate location
            location = "Remote, India" if "Remote" in snippet or "Remote" in title else "India"
            
            # Standard Fields
            logo = job.get("thumbnail") or utils.get_logo(company)
            random_time = utils.get_random_created_at()
            
            # Estimate job type
            job_type = "Full-time"
            if "intern" in title.lower() or "intern" in snippet.lower():
                job_type = "Internship"
            elif "contract" in title.lower() or "contract" in snippet.lower():
                job_type = "Contract"
                
            job_doc = {
                "title": title,
                "company": company,
                "location": location,
                "apply_link": apply_link,
                "tags": ["Wellfound", "Startup"],
                "source_hash": source_hash,
                "is_active": True,
                "public_release_at": random_time,
                "created_at": random_time,
                "logo": logo,
                "description": snippet,
                "experience": "Not Specified",
                "salary_status": None,
                "job_type": job_type,
                "is_processed": False,
            }

            job_doc["is_premium"] = utils.evaluate_premium_status(job_doc)
            collection.update_one(
                {"source_hash": source_hash},
                {
                    "$set": job_doc,
                    "$setOnInsert": {
                        "distribution_status": "pending",
                        "distributed_channels": [],
                    }
                },
                upsert=True
            )
            logger.info(f"  Upserted: {title} @ {company}")
            count += 1
        except Exception as e:
            logger.error(f"  Error processing job '{job.get('title', '?')}': {e}")

    client.close()
    logger.info(f"Done. Upserted {count} Wellfound jobs to MongoDB.")

def run():
    print(f"Starting Wellfound Scraper (India)")
    jobs = fetch_wellfound_jobs()
    print(f"Found {len(jobs)} total deduped organic jobs.")
    save_to_db(jobs)

if __name__ == "__main__":
    run()
