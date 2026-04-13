
import os
import time
import json
import hashlib
import logging
import random
from datetime import datetime
from dotenv import load_dotenv

# Shared utils
import utils

from serpapi import GoogleSearch

# Optional: Apify
try:
    from apify_client import ApifyClient
except ImportError:
    ApifyClient = None

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load Env
load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

SERPAPI_KEY = os.getenv("SERPAPI_KEY")
APIFY_TOKEN = os.getenv("APIFY_API_TOKEN")

# --- TM1: Google SERP Logic (ATS Hunter) ---

# UPGRADE 1: Split the domains. Greenhouse gets city-loops. Lever/Ashby get keyword-loops.
GREENHOUSE_DOMAIN = "site:boards.greenhouse.io"
# Parentheses required — without them, Google treats the OR as low-precedence and may
# apply it across the whole query instead of just the site: operators.
LEVER_ASHBY_DOMAINS = "(site:jobs.lever.co OR site:jobs.ashbyhq.com)"

# Greenhouse Location Sets
QUERY_SET_A_TECH_HUBS = '("Bangalore" OR "Bengaluru" OR "Hyderabad" OR "Pune" OR "Mumbai" OR "Chennai" OR "Remote")'
QUERY_SET_B_EMERGING = '("Gurgaon" OR "Gurugram" OR "Noida" OR "Delhi" OR "Indore" OR "Jaipur" OR "Ahmedabad" OR "Kolkata" OR "Chandigarh")'

ROLE_KEYWORDS = '("software" OR "developer" OR "tester" OR "qa" OR "technical support" OR "data analyst")'
LEVEL_KEYWORDS = '("intern" OR "fresher" OR "2023" OR "2024" OR "2025" OR "2026" OR "entry level" OR "0-2 years")'
NEGATIVE_KEYWORDS = '-"senior" -"lead" -"manager" -"principal" -"staff"'

class ATSHunter:
    def __init__(self):
        if not SERPAPI_KEY:
            logger.error("SERPAPI_KEY not found.")
            raise ValueError("SERPAPI_KEY missing")
        self.api_key = SERPAPI_KEY

    def build_query(self, base_query, locations=""):
        return f'{base_query} {ROLE_KEYWORDS} {LEVEL_KEYWORDS} {locations} {NEGATIVE_KEYWORDS}'.strip()

    def search_google(self, query):
        if not GoogleSearch:
             logger.error("serpapi library not installed. pip install google-search-results")
             return []

        logger.info(f"Searching Google: {query}")
        
        params = {
            "q": query,
            "tbs": "qdr:w",  # Past week
            "api_key": self.api_key,
            "num": 20,
            "gl": "in"       # Geolocation India
        }

        try:
            search = GoogleSearch(params)
            results = search.get_dict()
            if 'error' in results:
                logger.error(f"SerpApi API Error: {results['error']}")
            elif 'organic_results' not in results:
                logger.warning(f"SerpApi: No organic_results found. Keys: {results.keys()}")
            
            organic_results = results.get("organic_results", [])
            return organic_results
        except Exception as e:
            logger.error(f"SerpApi Error: {e}")
            return []

    def run(self):
        all_jobs = []
        
        # --- STRATEGY 1: Location-First for Greenhouse ---
        logger.info("Running Location-First strategy for Greenhouse...")
        
        q_greenhouse_a = self.build_query(GREENHOUSE_DOMAIN, QUERY_SET_A_TECH_HUBS)
        results_ga = self.search_google(q_greenhouse_a)
        all_jobs.extend(self._process_results(results_ga, "boards.greenhouse.io", "Tech Hubs"))
        
        time.sleep(1)
        
        q_greenhouse_b = self.build_query(GREENHOUSE_DOMAIN, QUERY_SET_B_EMERGING)
        results_gb = self.search_google(q_greenhouse_b)
        all_jobs.extend(self._process_results(results_gb, "boards.greenhouse.io", "Emerging"))

        time.sleep(1)

        # --- STRATEGY 2: Keyword-First for Lever & Ashby (Save API Credits!) ---
        logger.info("Running Keyword-First strategy for Lever and Ashby...")
        
        q_lever_ashby = self.build_query(LEVER_ASHBY_DOMAINS, '("India" OR "Remote")')
        results_la = self.search_google(q_lever_ashby)
        
        # "India/Remote" as the region — Refinery will extract exact cities later.
        all_jobs.extend(self._process_results(results_la, "lever_or_ashby", "India/Remote"))
            
        return all_jobs

    def _process_results(self, results, source, region):
        processed = []
        for r in results:
            company = self._extract_company(r.get("title"), r.get("link"))
            title = r.get("title")
            processed.append({
                "title": title,
                "link": r.get("link"),
                "company": company,
                "location": region,
                "source": source,
                "posted_at": "Within 24 Hours",
                "raw_snippet": r.get("snippet"),
                "logo": utils.get_logo(company),
                "experience": utils.normalize_experience(r.get("snippet"), title),
                "job_type": utils.normalize_job_type(None, title)
            })
        return processed

    def _extract_company(self, title, link):
        try:
            # Map board tokens to proper names
            MAP = {
                "razorpay": "Razorpay", 
                "browserstack": "BrowserStack", 
                "paytm": "Paytm",
                "coinbase": "Coinbase",
                "postman": "Postman"
            }
            if "greenhouse.io" in link:
                slug = link.split("greenhouse.io/")[1].split("/")[0]
                return MAP.get(slug.lower(), slug.capitalize())
            if "lever.co" in link:
                slug = link.split("lever.co/")[1].split("/")[0]
                return MAP.get(slug.lower(), slug.capitalize())
            if "ashbyhq.com" in link:
                slug = link.split("ashbyhq.com/")[1].split("/")[0]
                return MAP.get(slug.lower(), slug.capitalize())
        except:
            pass
        return "Unknown"

# --- TM2: Indeed/LinkedIn Filter (Aggregator Hunter) ---
# NOTE: The actual Apify/Indeed runner is in scrapers/apify_jobs.py.
# This class is kept for future integration into a unified pipeline.

TARGET_CITIES = [
  "Bangalore", "Hyderabad", "Pune", "Mumbai",
  "Gurgaon", "Noida", "Chennai", "Kolkata",
  "Ahmedabad", "Remote"
]

# UPGRADE 2: Bulletproof Indeed Query.
# Targets Title specifically, includes Batch Years, and excludes non-tech noise.
AGG_KEYWORDS = 'title:("developer" OR "engineer" OR "programmer" OR "intern" OR "tester" OR "qa" OR "support" OR "analyst") ("2023" OR "2024" OR "2025" OR "2026" OR "fresher" OR "new grad" OR "entry level" OR "0-2 years") ("software" OR "react" OR "node" OR "python" OR "frontend" OR "backend" OR "data") -chef -delivery -driver -sales -marketing -bpo -manager -senior'

class AggregatorHunter:
    def __init__(self):
        if not APIFY_TOKEN:
             logger.error("APIFY_API_TOKEN not found.")
             raise ValueError("APIFY_API_TOKEN missing")
        self.client = ApifyClient(APIFY_TOKEN) if ApifyClient else None

    def run_indeed(self):
        if not self.client: return []
        
        logger.info("Starting Indeed Scraper iteration...")
        all_jobs = []
        
        for city in TARGET_CITIES:
            logger.info(f"Scraping Indeed for: {city}")
            
            run_input = {
                "queries": [AGG_KEYWORDS],
                "location": f"{city}, India",
                "maxResults": 10,
                "countryCode": "in",
                "maxAgeDays": 1
            }
            
            try:
                # Uncomment in production to run actual Apify actor
                # run = self.client.actor("easyapi/indeed-jobs-scraper").call(run_input=run_input)
                # dataset_items = self.client.dataset(run['defaultDatasetId']).list_items().items
                # ... processing ...
                
                logger.info(f"  [Mock] Triggered Indeed actor for {city}")
            except Exception as e:
                logger.error(f"Indeed Error for {city}: {e}")
                
        return all_jobs

# --- Database Logic ---
from pymongo import MongoClient

MONGO_URI = ((os.getenv('MONGODB_URI') or "").strip() or "mongodb://localhost:27017/skillhire" or "").strip()

def save_to_db(jobs):
    if not jobs:
        logger.info("No jobs to save.")
        return

    client = MongoClient(MONGO_URI)
    db = client.get_database()
    collection = db.jobs
    
    count = 0
    for job in jobs:
        try:
            source_hash = utils.generate_source_hash("ats_hunter", job['title'], job['company'], job['location'])
            random_time = utils.get_random_created_at()
            
            job_doc = {
                "title": job['title'],
                "company": job['company'],
                "location": job['location'],
                "apply_link": job['link'],
                "tags": ["ATS Hunter", job['source']],
                "source_hash": source_hash,
                "is_active": True,
                "public_release_at": random_time,
                "created_at": random_time,
                "logo": job.get('logo'),
                "raw_data": job,
                "description": job.get("raw_snippet", ""),
                "experience": job.get("experience", "0-2 Years"),
                "job_type": job.get("job_type", "Full-time"),
                "is_processed": False
            }

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
    logger.info(f"Upserted {count} jobs to MongoDB.")

def main():
    logger.info("--- Starting Job Hunter ---")
    
    # 1. Run ATS Hunter (Greenhouse, Lever, Ashby via SerpAPI)
    try:
        ats_hunter = ATSHunter()
        ats_jobs = ats_hunter.run()
        logger.info(f"ATS Hunter found {len(ats_jobs)} jobs.")
        save_to_db(ats_jobs)
    except Exception as e:
        logger.error(f"ATS Hunter Failed: {e}")

    # 2. Run Aggregator Hunter (Indeed via Apify — see apify_jobs.py for the live runner)
    # try:
    #     agg_hunter = AggregatorHunter()
    #     agg_hunter.run_indeed()
    # except Exception as e:
    #     logger.error(f"Aggregator Hunter Failed: {e}")

if __name__ == "__main__":
    main()
