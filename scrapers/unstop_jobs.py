"""
scrapers/unstop_jobs.py

Scrapes the Unstop API for tech jobs/internships.
- Simulates JSON API request.
- Filters strictly for tech keywords.
- Saves to MongoDB matching SkillHire schema.

Run: python scrapers/unstop_jobs.py
"""

import os
import re
import re
import time
import hashlib
import logging
from datetime import datetime
from curl_cffi import requests
from seleniumbase import Driver
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

MONGO_URI = (os.getenv('MONGODB_URI') or 'mongodb://localhost:27017/skillhire' or "").strip()

# UNSTOP API Endpoint
UNSTOP_API_URL = "https://unstop.com/api/public/opportunity/search-result"

# Filters
TECH_KEYWORDS = ['software', 'developer', 'engineer', 'sde', 'frontend', 'backend', 'data', 'intern', 'tester', 'qa', 'support', 'analyst']

def fetch_unstop_data(page: int = 1) -> dict:
    """Fetch opportunities from Unstop API."""
    params = {
        'opportunity': 'jobs',
        'page': page,
        'per_page': 15,
        'oppstatus': 'open'
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        response = requests.get(UNSTOP_API_URL, params=params, headers=headers, impersonate="chrome", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Failed to fetch Unstop data: {e}")
        return {}

def _get_logo(company_name: str) -> str | None:
    if not company_name or company_name.lower() == 'unknown':
        return None
    import urllib.parse
    encoded = urllib.parse.quote(company_name)
    return f"https://ui-avatars.com/api/?name={encoded}&background=random&color=fff&size=128"

def parse_and_filter(jobs_data: list) -> list:
    """Extract required fields and filter by tech keywords."""
    valid_jobs = []
    
    for item in jobs_data:
        title = item.get('title', '')
        
        # Unstop nests company name
        org = item.get('organisation', item.get('organization', {}))
        company = org.get('name', '') if isinstance(org, dict) else org
        if not company: company = 'Unknown'
        
        # Location might be a string or a list of objects depending on the actual API structure.
        loc_data = item.get('job_location') or item.get('locations') or []
        location = 'Remote'
        if isinstance(loc_data, list):
            location = ", ".join([loc.get('city', loc.get('name', '')) for loc in loc_data if isinstance(loc, dict)])
        elif isinstance(loc_data, str):
            location = loc_data
        if not location: location = 'Remote'
            
        seo_url = item.get('seo_url', '')
        if seo_url:
            if seo_url.startswith('http'):
                link = seo_url
            else:
                link = f"https://unstop.com/{seo_url.lstrip('/')}"
        else:
            link = "https://unstop.com/jobs"
            
        lower_title = title.lower()
        if not any(k in lower_title for k in TECH_KEYWORDS):
            continue
            
        # Fetch full description details directly from the API response payload
        description_text = ''
        html_details = item.get('details', '')
        if html_details:
            try:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(html_details, 'html.parser')
                description_text = soup.get_text(separator=' ', strip=True)
            except Exception as e:
                logger.error(f"Failed to parse details HTML: {e}")
                
        item['description'] = description_text

        # Extract Job Type
        job_detail = item.get('jobDetail', {})
        timing = job_detail.get('timing', '')
        job_type = "Full-time" if timing == "full_time" else "Internship" if timing == "internship" else timing.title().replace("_", " ") if timing else "Full-time"

        # Extract Skills natively
        req_skills = item.get('required_skills', [])
        skills = [s.get('skill_name') for s in req_skills if s.get('skill_name')]

        # Extract Experience
        experience_list = []
        min_exp = job_detail.get('min_experience')
        if min_exp is not None:
            experience_list.append(str(min_exp))
            
        if not experience_list:
            import json
            reg_req = item.get('regnRequirements', {})
            elig_str = reg_req.get('eligibility', '{}')
            try:
                elig_obj = json.loads(elig_str)
                exp_list = elig_obj.get('experience', [])
                if exp_list:
                    experience_list = [str(x) for x in exp_list]
            except: pass
            
        import re
        nums = []
        for exp_val in experience_list:
            nums.extend([int(n) for n in re.findall(r'\d+', str(exp_val))])
            
        if nums:
            min_y = min(nums)
            max_y = max(nums)
            if min_y == max_y:
                experience_str = f"{min_y} Years" if min_y != 0 else "Fresher"
            else:
                experience_str = f"{min_y}-{max_y} Years"
        else:
            experience_str = "Fresher"

        valid_jobs.append({
            'title': title,
            'company': company,
            'location': location or 'Remote',
            'link': link,
            'raw_data': item,
            'logo': item.get('logoUrl2') or org.get('logoUrl', '') or _get_logo(company),
            'job_type': job_type,
            'skills': skills,
            'experience': experience_str
        })
        
    return valid_jobs

def save_to_db(jobs: list) -> None:
    if not jobs:
        logger.info("No jobs to save.")
        return

    client = MongoClient(MONGO_URI)
    db = client.get_database()
    collection = db.jobs

    count = 0
    for job in jobs:
        try:
            dedupe_str = f"{(job['title'] or '').lower()} {(job['company'] or '').lower()} {(job['location'] or '').lower()}"
            link_hash = hashlib.md5(dedupe_str.encode('utf-8')).hexdigest()
            source_hash = f"unstop_{link_hash}"

            job_doc = {
                "title": job['title'],
                "company": job['company'],
                "location": job['location'],
                "apply_link": job['link'],
                "logo": job['logo'],
                "tags": ["Unstop", "Fresher"],
                "source_hash": source_hash,
                "is_active": True,
                "public_release_at": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "raw_data": job['raw_data'],
                "description": job['raw_data'].get('description', ''),
                "is_processed": False,
                "job_type": job.get('job_type', 'Full-time'),
                "skills": job.get('skills', []),
                "experience": job.get('experience', 'Fresher')
            }

            collection.update_one(
                {"source_hash": source_hash},
                {"$set": job_doc},
                upsert=True
            )
            count += 1
        except Exception as e:
            logger.error(f"Error saving job: {e}")

    logger.info(f"Upserted {count} jobs from Unstop.")

def main():
    logger.info("Starting Unstop Scraper...")
    all_jobs = []
    
    # Fetch a few pages to get a good sample
    for page in range(1, 4):
        logger.info(f"Fetching page {page}...")
        data = fetch_unstop_data(page)
        items = data.get('data', {}).get('data', [])
        if not items:
            items = data.get('data', []) # Fallback structure

        if not items:
            logger.info("No more items found.")
            break
            
        valid_jobs = parse_and_filter(items)
        all_jobs.extend(valid_jobs)
        
    logger.info(f"Found {len(all_jobs)} tech jobs.")
    save_to_db(all_jobs)
    logger.info("Done.")

if __name__ == "__main__":
    main()
