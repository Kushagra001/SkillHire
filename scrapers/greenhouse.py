import os
import requests
import re
from bs4 import BeautifulSoup
from pymongo import MongoClient
from datetime import datetime
import dotenv

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

def scrape_greenhouse(board_token):
    print(f"Fetching Greenhouse API: {board_token}...")
    url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true"

    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print(f"Failed to fetch {board_token}: {response.status_code}")
            return

        data = response.json()
        jobs = data.get('jobs', [])
        print(f"Found {len(jobs)} jobs for {board_token}")

        # Open one DB connection per company scrape
        _client = MongoClient(MONGO_URI)
        _jobs_col = _client.get_database().jobs

        for job in jobs:
            try:
                title = job.get('title')
                absolute_url = job.get('absolute_url')
                location_name = job.get('location', {}).get('name')
                raw_html = job.get('content', '')
                import html
                # Greenhouse double-escapes their JSON HTML entities
                unescaped_html = html.unescape(html.unescape(raw_html))
                clean_text = BeautifulSoup(unescaped_html, "html.parser").get_text(separator="\n").strip()

                if not title or not absolute_url:
                    continue

                title_lower = title.lower()
                location_lower = location_name.lower() if location_name else ''

                # Filter out obvious senior/management roles
                senior_keywords = ["senior", "lead", "manager", "principal", "staff", "sr.", "iii", "iv", "director", "head", "vp"]
                if any(k in title_lower for k in senior_keywords):
                    continue

                # Strictly require India or Indian cities (drop generic 'Remote')
                valid_locations = ['india', 'bengaluru', 'bangalore', 'mumbai', 'delhi', 'ncr', 'hyderabad', 'pune', 'chennai', 'gurgaon', 'noida']
                if not location_lower or not any(loc in location_lower for loc in valid_locations):
                    continue

                import hashlib
                dedupe_str = f"{(title or '').lower()} {board_token.lower()} {(location_name or 'Remote').lower()}"
                link_hash = hashlib.md5(dedupe_str.encode('utf-8')).hexdigest()
                source_hash = f"greenhouse_{link_hash}"

                experience_val = "Not Specified"
                if "intern" in title_lower or "fresher" in title_lower:
                    experience_val = "Fresher"
                else:
                    import re
                    exp_match = re.search(r'(\d+)\+?\s*(?:to|-)?\s*(\d+)?\s*(?:years?|yrs?|yr)[\s\w]{0,15}experience', clean_text, re.IGNORECASE)
                    if exp_match:
                        min_y, max_y = exp_match.groups()
                        experience_val = f'{min_y}-{max_y} Years' if max_y else f'{min_y}+ Years'
                    else:
                        exp_match2 = re.search(r'experience.*?(?:of|:)?\s*(\d+)\+?\s*(?:to|-)?\s*(\d+)?\s*(?:years?|yrs?|yr)', clean_text[:2000], re.IGNORECASE)
                        if exp_match2:
                            min_y, max_y = exp_match2.groups()
                            experience_val = f'{min_y}-{max_y} Years' if max_y else f'{min_y}+ Years'

                job_doc = {
                    "title": title.strip(),
                    "company": board_token.capitalize(),
                    "location": location_name.strip() if location_name else "Remote",
                    "apply_link": absolute_url,
                    "logo": _get_logo(board_token),
                    "tags": ["Greenhouse", board_token],
                    "source_hash": source_hash,
                    "is_active": True,
                    "is_processed": False,
                    "public_release_at": datetime.utcnow(),
                    "created_at": datetime.utcnow(),
                    "raw_data": {"description": raw_html},
                    "description": clean_text,
                    "job_type": "Internship" if "intern" in title_lower else "Full-time",
                    "experience": experience_val,
                    "skills": []
                }

                _jobs_col.update_one(
                    {"source_hash": source_hash},
                    {"$set": job_doc},
                    upsert=True
                )

            except Exception as e:
                print(f"Error parsing job {job.get('id')}: {e}")

        _client.close()
        print(f"Finished processing {board_token}")

    except Exception as e:
        print(f"Error fetching {board_token}: {e}")

if __name__ == "__main__":
    discovered_boards = get_active_boards()
    if not discovered_boards:
        discovered_boards = ['razorpay', 'coinbase', 'browserstack', 'postman']
    
    for board in discovered_boards:
        scrape_greenhouse(board)

