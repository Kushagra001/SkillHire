import os
import requests
import re
from bs4 import BeautifulSoup
from pymongo import MongoClient
from datetime import datetime
import dotenv

# Import shared utils
import utils

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = (os.getenv('MONGODB_URI') or "").strip()
if not MONGO_URI:
    MONGO_URI = "mongodb://localhost:27017/skillhire"

SERPAPI_KEY = os.getenv('SERPAPI_KEY')

def get_active_boards():
    if not SERPAPI_KEY:
        print("SERPAPI_KEY not found in env.")
        return set()
    print("Discovering active Greenhouse boards via SerpAPI...")
    params = {
        "engine": "google",
        "q": 'site:boards.greenhouse.io "India" ("software" OR "developer" OR "data" OR "qa") ("2024" OR "2025" OR "2026" OR "fresher" OR "intern")',
        "api_key": SERPAPI_KEY,
        "num": 30
    }
    url = "https://serpapi.com/search"
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        organic_results = data.get("organic_results", [])
        boards = set()
        for res in organic_results:
            link = res.get("link", "")
            match = re.search(r'boards\.greenhouse\.io/([^/]+)', link)
            if match:
                boards.add(match.group(1))
        print(f"Discovered {len(boards)} active boards: {', '.join(boards)}")
        return boards
    except Exception as e:
        print(f"Error fetching boards from SerpAPI: {e}")
        return set()

def _get_logo(company_name):
    """Generate a custom static avatar for non-extractable companies."""
    if not company_name:
        return None
    import urllib.parse
    encoded = urllib.parse.quote(company_name)
    return f"https://ui-avatars.com/api/?name={encoded}&background=random&color=fff&size=128"

def scrape_greenhouse(board_tokens):
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    _jobs_col = db.jobs

    for board_token in board_tokens:
        # Proper Capitalization logic
        COMPANY_MAP = {
            "razorpay": "Razorpay",
            "browserstack": "BrowserStack",
            "paytm": "Paytm",
            "zomato": "Zomato",
            "swiggy": "Swiggy",
            "coinbase": "Coinbase",
            "postman": "Postman"
        }
        company_name = COMPANY_MAP.get(board_token.lower(), board_token.capitalize())
        
        url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true"
        print(f"Scraping Greenhouse board: {board_token} ({company_name})")
        
        try:
            response = requests.get(url, timeout=15)
            if response.status_code != 200:
                continue
            
            data = response.json()
            jobs = data.get('jobs', [])
            
            count = 0
            for job in jobs:
                title = job.get('title')
                location = job.get('location', {}).get('name', 'Remote')
                
                if not title: continue

                # Filters
                title_lower = title.lower()
                location_lower = location.lower()
                
                if not any(kw in title_lower for kw in ['software', 'developer', 'engineer', 'intern', 'sde', 'frontend', 'backend', 'fullstack', 'data', 'qa', 'tester']):
                    continue
                if any(kw in title_lower for kw in ["senior", "lead", "principal", "staff", "sr.", "iii", "iv", "director", "head", "vp"]):
                    continue
                if not any(loc in location_lower for loc in ['india', 'bangalore', 'bengaluru', 'hyderabad', 'pune', 'mumbai', 'noida', 'gurgaon', 'remote']):
                    continue
                
                raw_content = job.get('content', '')
                import html
                unescaped_html = html.unescape(html.unescape(raw_content)) if raw_content else ""
                clean_desc = BeautifulSoup(unescaped_html, "html.parser").get_text(separator="\n").strip() if unescaped_html else ""
                
                # Shared Utilities
                experience = utils.normalize_experience(clean_desc, title)
                job_type = utils.normalize_job_type(None, title) 
                
                source_hash = utils.generate_source_hash("greenhouse", title, company_name, location)
                logo = utils.get_logo(company_name)
                random_time = utils.get_random_created_at()

                job_doc = {
                    "title": title.strip(),
                    "company": company_name,
                    "location": location.strip(),
                    "apply_link": job.get('absolute_url'),
                    "logo": logo,
                    "tags": ["Greenhouse", board_token],
                    "source_hash": source_hash,
                    "is_active": True,
                    "is_processed": False,
                    "public_release_at": random_time,
                    "created_at": random_time,
                    "description": clean_desc,
                    "experience": experience,
                    "job_type": job_type,
                    "raw_data": job
                }
                
                _jobs_col.update_one(
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
            print(f"  Saved {count} jobs from {board_token}")
        except Exception as e:
            print(f"Error scraping {board_token}: {e}")
    
    client.close()

if __name__ == "__main__":
    boards = get_active_boards()
    if not boards:
        boards = ['razorpay', 'coinbase', 'browserstack', 'postman']
    
    scrape_greenhouse(boards)

