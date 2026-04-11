"""
scrapers/foundit.py

Scrapes Foundit.in (formerly Monster India) for tech jobs.
- Uses Foundit's public JSON search API (same endpoint as the website).
- Fetches multiple pages and skill-based queries.
- Filters for tech-related roles.
- Saves to MongoDB with full SkillHire schema.

API endpoint: https://www.foundit.in/middleware/jobsearch/v1/search
(reverse-engineered from the website's XHR calls)
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

# Foundit search API (confirmed via browser network inspection)
FOUNDIT_API = "https://www.foundit.in/middleware/jobsearch"
FOUNDIT_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.foundit.in/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Origin": "https://www.foundit.in",
}

TECH_QUERIES = [
    "software developer",
    "software engineer",
    "backend developer",
    "frontend developer",
    "data engineer",
    "devops engineer",
    "android developer",
    "machine learning engineer",
    "full stack developer",
    "python developer",
]

TECH_KEYWORDS_FILTER = [
    'software', 'developer', 'engineer', 'sde', 'frontend', 'backend',
    'data', 'intern', 'tester', 'qa', 'analyst', 'devops', 'cloud',
    'machine learning', 'ml', 'ai', 'full stack', 'android', 'ios',
    'python', 'java', 'react', 'node', 'golang', 'typescript'
]


def make_session():
    """Seed session with homepage visit to get cookies."""
    if USE_CURL:
        session = requests.Session(impersonate="chrome")
    else:
        session = std_requests.Session()
    try:
        session.get("https://www.foundit.in/", headers=FOUNDIT_HEADERS, timeout=15)
        time.sleep(1)
    except Exception as e:
        logger.warning(f"Homepage seed failed: {e}")
    return session


def fetch_foundit_jobs(session, query, page_start=0):
    """Fetch jobs from Foundit API for a given query."""
    params = {
        "query": query,
        "location": "India",
        "sort": 1,
        "start": page_start,
        "limit": 15,
        "freshness": 7,
    }
    try:
        resp = session.get(FOUNDIT_API, params=params, headers=FOUNDIT_HEADERS, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            # Actual path: jobSearchResponse.data (a list)
            jobs = data.get("jobSearchResponse", {}).get("data", [])
            total = data.get("jobSearchResponse", {}).get("meta", {}).get("paging", {}).get("total", 0)
            logger.info(f"  Query='{query}' start={page_start}: {len(jobs)} / {total} total")
            return jobs
        else:
            logger.warning(f"  Foundit returned {resp.status_code} for '{query}'")
            return []
    except Exception as e:
        logger.error(f"  Fetch error for '{query}': {e}")
        return []


def parse_experience(exp_min, exp_max):
    """Convert min/max experience ints to canonical string."""
    try:
        lo, hi = int(exp_min or 0), int(exp_max or 0)
    except (ValueError, TypeError):
        return "Fresher"
    if lo == 0 and hi <= 1:
        return "Fresher"
    return utils.normalize_experience(f"{lo}-{hi} years", "")


def parse_salary(sal):
    """Parse Foundit salary object."""
    if not sal:
        return None
    lo = sal.get("minSalary") or sal.get("min") or 0
    hi = sal.get("maxSalary") or sal.get("max") or 0
    currency = sal.get("currency", "INR")
    try:
        lo_lac = round(float(lo) / 100000, 1)
        hi_lac = round(float(hi) / 100000, 1)
        if lo_lac > 0 and hi_lac > 0:
            return f"{lo_lac}-{hi_lac} LPA"
        elif lo_lac > 0:
            return f"{lo_lac}+ LPA"
    except Exception:
        pass
    return None


def save_to_db(all_jobs):
    if not all_jobs:
        return

    client = MongoClient(MONGO_URI)
    collection = client.get_database("skillhire").jobs

    count = 0
    for job in all_jobs:
        try:
            title = (job.get("title") or job.get("cleanedJobTitle") or "").strip()
            if not title:
                continue

            if not any(kw in title.lower() for kw in TECH_KEYWORDS_FILTER):
                continue

            job_id = str(job.get("jobId") or job.get("id") or "")
            if not job_id:
                continue

            source_hash = f"foundit_{job_id}"

            company = (job.get("companyName") or job.get("recruiterName") or "Unknown").strip()

            # Location is a simple string: "Bengaluru, India"
            location_str = (job.get("locations") or "India").strip()
            # Remove trailing ", India" for cleaner display if city is known
            if location_str.endswith(", India") and len(location_str) > len(", India"):
                location_str = location_str[:-7].strip()  # Keep just "Bengaluru"

            # Apply link: jdUrl is relative, seoJdUrl is also relative
            jd_url = job.get("jdUrl") or job.get("seoJdUrl") or ""
            apply_link = f"https://www.foundit.in{jd_url}" if jd_url else f"https://www.foundit.in/job/{job_id}"

            # Experience: minimumExperience.years and maximumExperience.years
            exp_min = (job.get("minimumExperience") or {}).get("years") or job.get("minimumExperienceFilter") or 0
            exp_max = (job.get("maximumExperience") or {}).get("years") or job.get("maximumExperienceFilter") or 0
            experience = parse_experience(exp_min, exp_max)

            # Salary: absoluteValue in INR paise or full rupees
            min_sal_inr = (job.get("minimumSalary") or {}).get("absoluteValue") or 0
            max_sal_inr = (job.get("maximumSalary") or {}).get("absoluteValue") or 0
            salary_status = None
            if min_sal_inr and max_sal_inr and min_sal_inr > 0:
                salary_status = parse_salary({"min": min_sal_inr, "max": max_sal_inr})

            # Job type from employmentTypes list
            emp_types = job.get("employmentTypes") or []
            if any("intern" in t.lower() for t in emp_types):
                job_type = "Internship"
            elif any("contract" in t.lower() for t in emp_types):
                job_type = "Contract"
            elif any("part" in t.lower() for t in emp_types):
                job_type = "Part-time"
            else:
                job_type = "Full-time"

            # Description (not in list API, use empty)
            description = ""

            # Logo
            logo = utils.get_logo(company)

            # Skills: comma-separated string
            skills_raw = job.get("skills") or ""
            skills = [s.strip() for s in skills_raw.split(",") if s.strip()][:10]

            random_time = utils.get_random_created_at()

            job_doc = {
                "title": title,
                "company": company,
                "location": location_str,
                "apply_link": apply_link,
                "tags": ["Foundit"] + skills,
                "source_hash": source_hash,
                "is_active": True,
                "public_release_at": random_time,
                "created_at": random_time,
                "logo": logo,
                "description": description,
                "experience": experience,
                "salary_status": salary_status,
                "job_type": job_type,
                "is_processed": False,
            }

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
    logger.info(f"Done. Upserted {count} Foundit jobs to MongoDB.")


if __name__ == "__main__":
    session = make_session()
    all_jobs = []
    for query in TECH_QUERIES:
        logger.info(f"Fetching: {query}")
        for start in [0, 15, 30]:   # 3 pages = 45 results per query
            jobs = fetch_foundit_jobs(session, query, start)
            all_jobs.extend(jobs)
            time.sleep(random.uniform(1.5, 3.0))

    logger.info(f"Total fetched: {len(all_jobs)} raw jobs")
    save_to_db(all_jobs)
