"""
scrapers/naukri_jobs.py

Scrapes Naukri.com for Indian tech jobs using their internal REST API.
- No API key required; uses the same endpoint the website uses.
- Seeds session first by visiting the homepage to pick up cookies.
- Uses persistent curl_cffi session across all queries to avoid 406 bot detection.
- Filters for tech roles in India.
- Saves to MongoDB with full SkillHire schema.

API endpoint reverse-engineered from: https://www.naukri.com/jobs-in-india
"""

import os
import re
import time
import random
import logging
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient

try:
    from curl_cffi import requests
    USE_CURL = True
except ImportError:
    import requests as std_requests
    USE_CURL = False

import utils

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))
MONGO_URI = ((os.getenv('MONGODB_URI') or "").strip() or "mongodb://localhost:27017/skillhire").strip()

NAUKRI_API_BASE = "https://www.naukri.com/jobapi/v3/search"
BASE_HEADERS = {
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.naukri.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "appid": "109",
    "systemid": "Naukri",
    "x-http-method-override": "GET",
    "x-requested-with": "XMLHttpRequest",
}

TECH_QUERIES = [
    "software engineer india",
    "sde india",
    "backend developer india",
    "frontend developer india",
    "data engineer india",
    "devops engineer india",
    "machine learning engineer india",
    "full stack developer india",
    "android developer india",
    "python developer india",
]

TECH_KEYWORDS_FILTER = [
    'software', 'developer', 'engineer', 'sde', 'frontend', 'backend',
    'data', 'intern', 'tester', 'qa', 'analyst', 'devops', 'cloud',
    'machine learning', 'ml', 'ai', 'product', 'full stack', 'android', 'ios',
    'python', 'java', 'react', 'node', 'golang', 'typescript'
]


def normalize_salary(salary_str):
    """Convert Naukri salary like '5,00,000 - 10,00,000 PA' to '5-10 LPA'"""
    if not salary_str or salary_str.strip() == "Not disclosed":
        return None
    try:
        # Pattern: "X,XX,XXX - Y,YY,YYY PA" or "X - Y Lacs PA"
        lacs_match = re.search(r'(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(?:Lac|Lakh|LPA)', salary_str, re.IGNORECASE)
        if lacs_match:
            return f"{lacs_match.group(1)}-{lacs_match.group(2)} LPA"
        # PA amounts in full (5,00,000 = 5 LPA)
        pa_match = re.findall(r'[\d,]+', salary_str)
        if pa_match and len(pa_match) >= 2:
            def to_lac(s):
                n = int(s.replace(',', ''))
                return round(n / 100000, 1)
            lo, hi = to_lac(pa_match[0]), to_lac(pa_match[1])
            if lo > 0 and hi > 0:
                return f"{lo}-{hi} LPA"
    except Exception:
        pass
    return salary_str.strip() if salary_str else None


def parse_experience(exp_str):
    """Parse '2-5 Yrs', '0-1 Yr (Fresher)', etc."""
    if not exp_str:
        return "Fresher"
    exp_lower = exp_str.lower()
    if 'fresher' in exp_lower or '0-1' in exp_lower or '0 - 1' in exp_lower:
        return "Fresher"
    match = re.search(r'(\d+)\s*[-–]\s*(\d+)', exp_str)
    if match:
        lo, hi = int(match.group(1)), int(match.group(2))
        return utils.normalize_experience(f"{lo}-{hi} years", "")
    match = re.search(r'(\d+)\+?\s*yr', exp_str, re.IGNORECASE)
    if match:
        lo = int(match.group(1))
        return utils.normalize_experience(f"{lo}+ years", "")
    return "Fresher"


def make_session():
    """Create a session and seed it with Naukri homepage cookies."""
    if USE_CURL:
        session = requests.Session(impersonate="chrome")
    else:
        session = std_requests.Session()
    try:
        logger.info("Seeding session with Naukri homepage...")
        session.get("https://www.naukri.com/", headers=BASE_HEADERS, timeout=15)
        time.sleep(2)
    except Exception as e:
        logger.warning(f"Homepage seed failed: {e}")
    return session


def fetch_naukri_jobs(session, query, page=1):
    """Fetch one page of Naukri search results using a persistent session."""
    params = {
        "noOfResults": 20,
        "urlType": "search_by_keyword",
        "searchType": "adv",
        "keyword": query,
        "pageNo": page,
        "sort": "1",
        "k": query,
        "experience": "",
        "l": "india",
    }
    try:
        resp = session.get(NAUKRI_API_BASE, params=params, headers=BASE_HEADERS, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            jobs = data.get("jobDetails", [])
            total = data.get("noOfJobs", 0)
            logger.info(f"  Query='{query}' page={page}: {len(jobs)} / {total} total")
            return jobs
        else:
            logger.warning(f"  Naukri returned {resp.status_code} for '{query}' (will skip)")
            return []
    except Exception as e:
        logger.error(f"  Fetch error for '{query}': {e}")
        return []


def save_to_db(all_jobs):
    if not all_jobs:
        return

    client = MongoClient(MONGO_URI)
    collection = client.get_database("skillhire").jobs

    count = 0
    for job in all_jobs:
        try:
            title = (job.get('title') or '').strip()
            if not title:
                continue

            # Filter: tech roles only
            if not any(kw in title.lower() for kw in TECH_KEYWORDS_FILTER):
                continue

            # Required fields
            job_id = str(job.get('jobId') or '')
            if not job_id:
                continue

            company = (
                job.get('companyName') or
                job.get('company', {}).get('label') or
                'Unknown'
            ).strip()

            # Location
            locations = job.get('locations') or []
            if isinstance(locations, list):
                location_str = ", ".join(
                    loc.get('label', '') if isinstance(loc, dict) else str(loc)
                    for loc in locations[:3]
                ).strip() or "India"
            else:
                location_str = str(locations) or "India"

            # Apply link
            apply_link = (
                job.get('jdURL') or
                f"https://www.naukri.com/job-listings-{job_id}"
            )

            # Experience
            exp_raw = job.get('experienceText') or job.get('experience') or ''
            experience = parse_experience(exp_raw)

            # Salary
            salary_raw = job.get('salary') or job.get('salaryObject', {}).get('label') or ''
            salary_status = normalize_salary(salary_raw)

            # Job type
            job_type_raw = (job.get('jobTypeLabel') or '').lower()
            if 'intern' in job_type_raw:
                job_type = "Internship"
            elif 'contract' in job_type_raw:
                job_type = "Contract"
            elif 'part' in job_type_raw:
                job_type = "Part-time"
            else:
                job_type = "Full-time"

            # Description (snippet from list API - Naukri has full desc behind auth)
            description = (
                job.get('jobDescription') or
                job.get('snippets', {}).get('whyJoin') or
                ''
            ).strip()

            # Logo
            logo_url = (
                job.get('companyImageUrl') or
                job.get('logoPath') or
                None
            )
            if not logo_url:
                logo_url = utils.get_logo(company)

            # Skills/tags
            skills = job.get('keySkills') or job.get('tagsAndSkills') or []
            if isinstance(skills, str):
                skills = [s.strip() for s in skills.split(',') if s.strip()]
            elif isinstance(skills, list):
                skills = [s.get('label', s) if isinstance(s, dict) else str(s) for s in skills]

            source_hash = f"naukri_{job_id}"
            random_time = utils.get_random_created_at()

            job_doc = {
                "title": title,
                "company": company,
                "location": location_str,
                "apply_link": apply_link,
                "tags": ["Naukri"] + skills[:10],
                "source_hash": source_hash,
                "is_active": True,
                "public_release_at": random_time,
                "created_at": random_time,
                "logo": logo_url,
                "description": description,
                "experience": experience,
                "salary_status": salary_status,
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
            logger.info(f"  Upserted: [{experience}] {title} @ {company} ({location_str})")
            count += 1
        except Exception as e:
            logger.error(f"  Error processing job '{job.get('title', '?')}': {e}")

    client.close()
    logger.info(f"Done. Upserted {count} Naukri jobs to MongoDB.")


if __name__ == "__main__":
    session = make_session()
    all_jobs = []
    for query in TECH_QUERIES:
        logger.info(f"Fetching: {query}")
        for page in [1, 2]:   # 2 pages = 40 results per query
            jobs = fetch_naukri_jobs(session, query, page)
            all_jobs.extend(jobs)
            time.sleep(random.uniform(2.5, 4.0))  # Longer delay to avoid 406

    logger.info(f"Total fetched: {len(all_jobs)} raw jobs")
    save_to_db(all_jobs)
