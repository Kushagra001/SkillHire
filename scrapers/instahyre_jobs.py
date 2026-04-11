"""
scrapers/instahyre_jobs.py

Scrapes the Instahyre jobs API for early-career tech jobs in India.
- Uses curl_cffi to impersonate Chrome and bypass Cloudflare.
- Fetches from the hidden API endpoint with pagination.
- Filters for tech roles.
- Saves to MongoDB matching SkillHire schema.

Fixes applied (2025-03):
  - apply_link now uses real public_url instead of constructed /job-{id}
  - source_hash now uses stable job_id instead of title+company (prevents duplicates)
  - job_type now uses is_internship field from detail API
  - keywords (skills) now stored in tags
  - location handles both string and list format from list API
  - detail endpoint fallback: uses job_search endpoint if employer_public_jobs returns 404
"""

import os
import time
import logging
from datetime import datetime
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from curl_cffi import requests
from pymongo import MongoClient

import utils

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))
MONGO_URI = ((os.getenv('MONGODB_URI') or "").strip() or "mongodb://localhost:27017/skillhire").strip()

TECH_KEYWORDS = [
    'software', 'developer', 'engineer', 'sde', 'frontend', 'backend',
    'data', 'intern', 'tester', 'qa', 'analyst', 'devops', 'cloud',
    'machine learning', 'ml', 'ai', 'product', 'full stack', 'android', 'ios',
    'python', 'java', 'react', 'node', 'golang', 'rust', 'typescript'
]


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
        session.get("https://www.instahyre.com/search-jobs/", headers=headers, timeout=15)
        csrf_token = session.cookies.get("csrftoken", "")
        if csrf_token:
            headers["x-csrftoken"] = csrf_token
            logger.info("Successfully acquired fresh tokens.")
    except Exception as e:
        logger.error(f"Failed to get initial cookies: {e}")
        return session, headers, []

    all_jobs = []
    for offset in [0, 20, 40]:
        api_url = (
            f"https://www.instahyre.com/api/v1/job_search"
            f"?company_size=0&experience=0&isLandingPage=true&job_type=0&offset={offset}"
        )
        try:
            logger.info(f"Hitting API (offset={offset})")
            response = session.get(api_url, headers=headers, timeout=15)
            response.raise_for_status()
            jobs = response.json().get('objects', [])
            all_jobs.extend(jobs)
            logger.info(f"  Got {len(jobs)} jobs at offset={offset}")
            time.sleep(0.5)
        except Exception as e:
            logger.error(f"API Fetch Failed for offset {offset}: {e}")
            break

    logger.info(f"Total raw jobs fetched: {len(all_jobs)}")
    return session, headers, all_jobs


def get_job_details(session, headers, job_id):
    """Fetch detailed job info. Falls back to job_search endpoint if employer_public_jobs returns 404."""
    detail_url = f"https://www.instahyre.com/api/v1/employer_public_jobs/{job_id}"
    try:
        resp = session.get(detail_url, headers=headers, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        # Fallback
        fallback_url = f"https://www.instahyre.com/api/v1/job_search/{job_id}"
        resp2 = session.get(fallback_url, headers=headers, timeout=10)
        if resp2.status_code == 200:
            return resp2.json()
    except Exception as e:
        logger.warning(f"Could not fetch details for job {job_id}: {e}")
    return {}


def parse_location(locations_raw):
    """Handle both string ('Delhi,Gurgaon') and list (['Delhi', 'Gurgaon']) formats."""
    if not locations_raw:
        return "India"
    if isinstance(locations_raw, str):
        # "Delhi,Gurgaon,Noida" → "Delhi, Gurgaon, Noida"
        parts = [p.strip() for p in locations_raw.split(",") if p.strip()]
        return ", ".join(parts) if parts else "India"
    if isinstance(locations_raw, list):
        parts = []
        for loc in locations_raw:
            if isinstance(loc, str):
                parts.append(loc.strip())
            elif isinstance(loc, dict):
                parts.append(loc.get('name', '').strip())
        return ", ".join(p for p in parts if p) or "India"
    return "India"


def save_to_db(session, headers, raw_jobs):
    if not raw_jobs:
        return

    client = MongoClient(MONGO_URI)
    collection = client.get_database("skillhire").jobs

    count = 0
    for job in raw_jobs:
        title = (job.get('title') or job.get('candidate_title') or '').strip()
        if not title:
            continue

        # Filter: tech roles only
        if not any(kw in title.lower() for kw in TECH_KEYWORDS):
            continue

        try:
            job_id = job.get('id')
            if not job_id:
                continue

            # Use stable job_id for deduplication
            source_hash = f"instahyre_{job_id}"

            company_data = job.get('employer') or {}
            company_name = company_data.get('company_name') or 'Unknown'

            # Location from list API
            location_str = parse_location(job.get('locations'))

            # apply_link: use real public_url from API, not a constructed URL
            public_url = job.get('public_url', '')
            apply_link = public_url if public_url.startswith('http') else f"https://www.instahyre.com/job-{job_id}"

            # Logo: profile_image_src from employer, or employer_profile_url from details
            logo = (
                company_data.get('profile_image_src') or
                company_data.get('company_logo') or
                None
            )
            if not logo or logo == '':
                logo = utils.get_logo(company_name)

            # Keywords/skills from list API
            keywords = job.get('keywords') or []

            # Fetch job details (description, experience, job_type)
            details = get_job_details(session, headers, job_id)
            time.sleep(0.3)

            # Description
            raw_html = details.get('description', '')
            clean_text = BeautifulSoup(raw_html, "html.parser").get_text(separator="\n").strip() if raw_html else ''

            # Experience
            min_exp = details.get('workex_min') or job.get('workex_min') or 0
            max_exp = details.get('workex_max') or job.get('workex_max') or 0
            try:
                min_exp = int(min_exp)
                max_exp = int(max_exp)
            except (ValueError, TypeError):
                min_exp, max_exp = 0, 0

            if min_exp == 0 and max_exp == 0:
                experience = "Fresher"
            elif min_exp == max_exp:
                experience = utils.normalize_experience(f"{min_exp}+ years", title)
            else:
                experience = utils.normalize_experience(f"{min_exp}-{max_exp} years", title)

            # Job type: use is_internship flag from details
            is_internship = details.get('is_internship') or False
            if is_internship:
                job_type = "Internship"
            else:
                job_type = utils.normalize_job_type(None, title)

            random_time = utils.get_random_created_at()

            job_doc = {
                "title": title,
                "company": company_name,
                "location": location_str,
                "apply_link": apply_link,
                "tags": ["Instahyre", "Startup"] + keywords,
                "source_hash": source_hash,
                "is_active": True,
                "public_release_at": random_time,
                "created_at": random_time,
                "logo": logo,
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
            logger.info(f"Upserted: [{experience}] {title} @ {company_name} ({location_str})")
            count += 1
        except Exception as e:
            logger.error(f"Error parsing job '{title}': {e}")

    client.close()
    logger.info(f"Done. Upserted {count} jobs to MongoDB.")


if __name__ == "__main__":
    session, headers, jobs = fetch_instahyre_api()
    save_to_db(session, headers, jobs)
