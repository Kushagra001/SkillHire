"""
scrapers/instahyre_jobs.py

Scrapes the Instahyre jobs page for early-career tech jobs.
- Uses curl_cffi to impersonate Chrome and bypass Cloudflare.
- Fetches from the hidden API endpoint with pagination.
- Filters for tech roles.
- Saves to MongoDB matching SkillHire schema.
"""

import os
import time
import logging
from datetime import datetime
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from curl_cffi import requests
from pymongo import MongoClient

# Import shared utils
import utils

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load Env
load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))
MONGO_URI = ((os.getenv('MONGODB_URI') or "").strip() or "mongodb://localhost:27017/skillhire" or "").strip()

def fetch_instahyre_api():
    logger.info("Starting Instahyre API Fetcher...")
    session = requests.Session(impersonate="chrome")
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.instahyre.com/search-jobs/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    }
    
    try:
        logger.info("Fetching fresh CSRF token...")
        session.get("https://www.instahyre.com/search-jobs/", headers=headers)
        csrf_token = session.cookies.get("csrftoken", "")
        if csrf_token:
            headers["x-csrftoken"] = csrf_token
            logger.info("Successfully acquired fresh tokens.")
    except Exception as e:
        logger.error(f"Failed to get initial cookies: {e}")
        return session, headers, []

    all_jobs = []
    # Pagination: Fetch 3 pages (0, 20, 40)
    for offset in [0, 20, 40]:
        api_url = f"https://www.instahyre.com/api/v1/job_search?company_size=0&experience=0&isLandingPage=true&job_type=0&offset={offset}"
        try:
            logger.info(f"Hitting API (offset={offset}): {api_url}")
            response = session.get(api_url, headers=headers)
            response.raise_for_status()
            data = response.json()
            jobs = data.get('objects', [])
            all_jobs.extend(jobs)
            time.sleep(1) # Gap between page fetches
        except Exception as e:
            logger.error(f"API Fetch Failed for offset {offset}: {e}")
            break
            
    logger.info(f"Total raw jobs fetched: {len(all_jobs)}")
    return session, headers, all_jobs

def save_to_db(session, headers, raw_jobs):
    if not raw_jobs: return

    client = MongoClient(MONGO_URI)
    collection = client.get_database().jobs
    
    count = 0
    tech_keywords = ['software', 'developer', 'engineer', 'sde', 'frontend', 'backend', 'data', 'intern', 'tester', 'qa', 'support', 'analyst']
    
    for job in raw_jobs:
        title = job.get('title', '')
        if not title: continue
        
        # Filter Tech roles
        if not any(kw in title.lower() for kw in tech_keywords):
            continue
            
        try:
            company_data = job.get('employer') or {}
            company_name = company_data.get('company_name', 'Unknown')
            
            locations = job.get('locations')
            location_str = 'India'
            if isinstance(locations, str): location_str = locations
            elif isinstance(locations, list) and len(locations) > 0:
                if isinstance(locations[0], str): location_str = locations[0]
                elif isinstance(locations[0], dict): location_str = locations[0].get('name', 'India')
            
            job_id = job.get('id')
            if not job_id: continue
            apply_link = f"https://www.instahyre.com/job-{job_id}"
            
            # Use shared utils for Experience/Type
            clean_text = ""
            experience = "0-2 Years" # Default
            try:
                details_url = f"https://www.instahyre.com/api/v1/employer_public_jobs/{job_id}"
                details_resp = session.get(details_url, headers=headers)
                if details_resp.status_code == 200:
                    details_data = details_resp.json()
                    raw_html = details_data.get('description', '')
                    if raw_html:
                        clean_text = BeautifulSoup(raw_html, "html.parser").get_text(separator="\n").strip()
                    
                    min_exp = details_data.get('workex_min', 0)
                    max_exp = details_data.get('workex_max', 0)
                    # Specific Instahyre normalization
                    if min_exp == 0 and max_exp == 0:
                        experience = "Fresher"
                    else:
                        experience = utils.normalize_experience(f"{min_exp}-{max_exp} years", title)
                else:
                    experience = utils.normalize_experience(None, title)
            except Exception as e:
                logger.error(f"Error fetching details for {job_id}: {e}")
                experience = utils.normalize_experience(None, title)

            job_type = utils.normalize_job_type(None, title)
            source_hash = utils.generate_source_hash("instahyre", title, company_name, location_str)
            logo = company_data.get('profile_image_src') or company_data.get('company_logo') or utils.get_logo(company_name)
            if logo == '': logo = utils.get_logo(company_name) # Fix empty string bug
            
            random_time = utils.get_random_created_at()

            job_doc = {
                "title": title,
                "company": company_name,
                "location": location_str,
                "apply_link": apply_link,
                "tags": ["Instahyre", "Startup"],
                "source_hash": source_hash,
                "is_active": True,
                "public_release_at": random_time,
                "created_at": random_time,
                "logo": logo,
                "raw_data": job,
                "description": clean_text,
                "experience": experience,
                "job_type": job_type,
                "is_processed": False
            }
            
            collection.update_one(
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
            time.sleep(0.3) # Faster polling
        except Exception as e:
            logger.error(f"Error parsing job {title}: {e}")
            
    client.close()
    logger.info(f"Upserted {count} jobs to MongoDB.")

if __name__ == "__main__":
    session, headers, jobs = fetch_instahyre_api()
    save_to_db(session, headers, jobs)
