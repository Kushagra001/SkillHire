"""
scrapers/unstop_jobs.py

Scrapes the Unstop API for tech jobs/internships.
- Simulates JSON API request with pagination.
- Filters strictly for tech keywords.
- Saves to MongoDB matching SkillHire schema.
"""

import os
import time
import logging
from datetime import datetime
from curl_cffi import requests
from pymongo import MongoClient
from dotenv import load_dotenv
from bs4 import BeautifulSoup

# Import shared utils
import utils

# Setup
load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

MONGO_URI = ((os.getenv('MONGODB_URI') or "").strip() or 'mongodb://localhost:27017/skillhire' or "").strip()
UNSTOP_API_URL = "https://unstop.com/api/public/opportunity/search-result"
TECH_KEYWORDS = ['software', 'developer', 'engineer', 'sde', 'frontend', 'backend', 'data', 'intern', 'tester', 'qa', 'support', 'analyst']

def fetch_unstop_data(page: int = 1) -> dict:
    params = {'opportunity': 'jobs', 'page': page, 'per_page': 15, 'oppstatus': 'open'}
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    try:
        response = requests.get(UNSTOP_API_URL, params=params, headers=headers, impersonate="chrome", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Failed to fetch Unstop data: {e}")
        return {}

def parse_and_filter(jobs_data: list) -> list:
    valid_jobs = []
    for item in jobs_data:
        title = item.get('title', '')
        org = item.get('organisation', item.get('organization', {}))
        company = org.get('name', 'Unknown') if isinstance(org, dict) else org
        
        loc_data = item.get('job_location') or item.get('locations') or []
        location = 'Remote'
        if isinstance(loc_data, list):
            location = ", ".join([loc.get('city', loc.get('name', '')) for loc in loc_data if isinstance(loc, dict)])
        elif isinstance(loc_data, str):
            location = loc_data
        if not location: location = 'Remote'
            
        seo_url = item.get('seo_url', '')
        link = f"https://unstop.com/{seo_url.lstrip('/')}" if seo_url else "https://unstop.com/jobs"
            
        if not any(k in title.lower() for k in TECH_KEYWORDS):
            continue
            
        # Description
        clean_text = ''
        html_details = item.get('details', '')
        if html_details:
            try:
                soup = BeautifulSoup(html_details, 'html.parser')
                clean_text = soup.get_text(separator='\n', strip=True)
            except Exception as e:
                logger.error(f"Failed to parse details HTML: {e}")

        # Shared Utilities for Type/Exp
        job_detail = item.get('jobDetail', {})
        timing = job_detail.get('timing', '')
        job_type = utils.normalize_job_type(timing, title)
        
        # Experience Logic
        min_exp = job_detail.get('min_experience')
        experience_str = utils.normalize_experience(f"{min_exp} years" if min_exp is not None else None, title)

        # Salary
        salary_status = None
        min_sal = job_detail.get('min_salary')
        max_sal = job_detail.get('max_salary')
        if min_sal and max_sal:
            salary_status = f"₹{min_sal} - ₹{max_sal}"
        elif min_sal:
            salary_status = f"₹{min_sal}+"

        # Skills
        req_skills = item.get('required_skills', [])
        skills = [s.get('skill_name') for s in req_skills if s.get('skill_name')]

        valid_jobs.append({
            'title': title,
            'company': company,
            'location': location,
            'link': link,
            'logo': item.get('logoUrl2') or org.get('logoUrl', '') or utils.get_logo(company),
            'job_type': job_type,
            'skills': skills,
            'experience': experience_str,
            'description': clean_text,
            'salary_status': salary_status,
            'raw_data': item
        })
    return valid_jobs

def save_to_db(jobs: list) -> None:
    if not jobs: return
    client = MongoClient(MONGO_URI)
    collection = client.get_database().jobs
    count = 0
    for job in jobs:
        try:
            source_hash = utils.generate_source_hash("unstop", job['title'], job['company'], job['location'])
            random_time = utils.get_random_created_at()

            job_doc = {
                "title": job['title'],
                "company": job['company'],
                "location": job['location'],
                "apply_link": job['link'],
                "logo": job['logo'],
                "tags": ["Unstop", "Fresher"],
                "source_hash": source_hash,
                "is_active": True,
                "public_release_at": random_time,
                "created_at": random_time,
                "raw_data": job['raw_data'],
                "description": job['description'],
                "is_processed": False,
                "job_type": job['job_type'],
                "skills": job['skills'],
                "experience": job['experience']
            }
            if job.get('salary_status'):
                job_doc["salary_status"] = job['salary_status']

            job_doc["is_premium"] = utils.evaluate_premium_status(job_doc)
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
        except Exception as e:
            logger.error(f"Error saving job: {e}")
    client.close()
    logger.info(f"Upserted {count} jobs from Unstop.")

def main():
    logger.info("Starting Unstop Scraper...")
    all_jobs = []
    for page in range(1, 4):
        data = fetch_unstop_data(page)
        items = data.get('data', {}).get('data', [])
        if not items: items = data.get('data', []) 
        if not items: break
        all_jobs.extend(parse_and_filter(items))
    save_to_db(all_jobs)

if __name__ == "__main__":
    main()
