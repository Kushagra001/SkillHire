"""
scrapers/instahyre_jobs.py

Scrapes the Instahyre jobs page for early-career tech jobs.
- Uses curl_cffi to impersonate Chrome and bypass Cloudflare.
- Fetches from the hidden API endpoint.
- Filters for tech roles.
- Saves to MongoDB matching SkillHire schema.

Run: python scrapers/instahyre_jobs.py
"""

import os
import time
import hashlib
import logging
from datetime import datetime
from dotenv import load_dotenv
from bs4 import BeautifulSoup

# We use curl_cffi to perfectly mimic a Chrome browser and bypass Cloudflare
from curl_cffi import requests
from pymongo import MongoClient

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load Env
load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))
MONGO_URI = os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire"

def fetch_instahyre_api():
    logger.info("Starting Instahyre API Fetcher...")
    
    # 1. Establish a session that looks EXACTLY like Google Chrome to Cloudflare
    session = requests.Session(impersonate="chrome")
    
    headers = {
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.instahyre.com/search-jobs/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    }
    
    # 2. Hit the main page first to grab fresh cookies & CSRF token
    try:
        logger.info("Fetching fresh CSRF token...")
        session.get("https://www.instahyre.com/search-jobs/", headers=headers)
        
        csrf_token = session.cookies.get("csrftoken", "")
        if csrf_token:
            headers["x-csrftoken"] = csrf_token
            logger.info("Successfully acquired fresh tokens.")
        else:
            logger.warning("No CSRF token found, API request might fail.")
            
    except Exception as e:
        logger.error(f"Failed to get initial cookies: {e}")
        return session, headers, []

    # 3. Hit the hidden JSON API (using offset=0, you could loop this to offset=20, 40, etc.)
    api_url = "https://www.instahyre.com/api/v1/job_search?company_size=0&experience=0&isLandingPage=true&job_type=0&offset=0"
    
    try:
        logger.info(f"Hitting hidden API endpoint: {api_url}")
        response = session.get(api_url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        # Instahyre stores the job array inside the 'objects' key
        jobs_list = data.get('objects', [])
        logger.info(f"Successfully fetched {len(jobs_list)} raw jobs from API.")
        return session, headers, jobs_list
        
    except Exception as e:
        logger.error(f"API Fetch Failed: {e}")
        return session, headers, []

def save_to_db(session, headers, raw_jobs):
    if not raw_jobs:
        return

    client = MongoClient(MONGO_URI)
    db = client.get_database()
    collection = db.jobs
    
    count = 0
    # Keywords to ensure we only save Tech/Fresher roles
    tech_keywords = ['software', 'developer', 'engineer', 'sde', 'frontend', 'backend', 'data', 'intern', 'tester', 'qa', 'support', 'analyst']
    
    for job in raw_jobs:
        title = job.get('title', '').lower()
        
        # 4. Filter: Only process if it's a tech role
        if not any(keyword in title for keyword in tech_keywords):
            continue
            
        try:
            # Extract data from Instahyre's specific JSON structure
            company_data = job.get('employer') or {}
            company_name = company_data.get('company_name', 'Unknown')
            
            # Usually a list of location objects, an array of strings, or a flat string
            locations = job.get('locations')
            location_str = 'Remote'
            
            if isinstance(locations, str):
                location_str = locations
            elif isinstance(locations, list) and len(locations) > 0:
                if isinstance(locations[0], str):
                    location_str = locations[0]
                elif isinstance(locations[0], dict):
                    location_str = locations[0].get('name', 'India')
            
            # Construct the apply link (Instahyre URLs use the job ID)
            job_id = job.get('id')
            if not job_id:
                logger.warning(f"Skipping job with no ID: {title}")
                continue
                
            apply_link = f"https://www.instahyre.com/job-{job_id}"
            
            dedupe_str = f"{(title or '').lower()} {(company_name or '').lower()} {(location_str or 'Remote').lower()}"
            link_hash = hashlib.md5(dedupe_str.encode('utf-8')).hexdigest()
            source_hash = f"instahyre_{link_hash}"
            
            api_job_type = job.get('job_type', 0)
            if api_job_type == 1 or 'intern' in title:
                exact_job_type = "Internship"
            else:
                exact_job_type = "Full-time"
            
            clean_text = ""
            experience = ""
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
                    experience = f"{min_exp}-{max_exp} Years"
                else:
                    logger.warning(f"Failed to fetch details for {job_id}, status {details_resp.status_code}")
            except Exception as e:
                logger.error(f"Error fetching details for {job_id}: {e}")

            job_doc = {
                "title": job.get('title'),
                "company": company_name,
                "location": location_str,
                "apply_link": apply_link,
                "tags": ["Instahyre", "Startup"],
                "source_hash": source_hash,
                "is_active": True,
                "public_release_at": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "logo": company_data.get('profile_image_src') or company_data.get('company_logo'),
                "raw_data": job,
                "description": clean_text,
                "experience": experience,
                "is_processed": False, # Leaves it for your refinery.py to extract the Batch Year!
                "job_type": exact_job_type
            }
            
            collection.update_one(
                {"source_hash": source_hash},
                {"$set": job_doc},
                upsert=True
            )
            count += 1
            time.sleep(1)
        except Exception as e:
            logger.error(f"Error parsing job {title}: {e}")
            
    logger.info(f"Upserted {count} relevant tech jobs to MongoDB.")

if __name__ == "__main__":
    session, headers, jobs = fetch_instahyre_api()
    save_to_db(session, headers, jobs)
