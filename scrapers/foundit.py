import os
import asyncio
from playwright.async_api import async_playwright
from pymongo import MongoClient
from datetime import datetime, timedelta
import dotenv

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI')
if not MONGO_URI:
    print("MONGODB_URI not found in .env.local")
    exit(1)

client = MongoClient(MONGO_URI)
db = client.get_database()
jobs_collection = db.jobs

async def scrape_foundit(skill):
    print(f"Scraping foundit.in for {skill}...")
    url = f"https://www.foundit.in/search/fresher-{skill}-jobs"
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto(url, timeout=60000)
            await page.wait_for_selector('.srpResultCard', timeout=10000)
            
            job_cards = await page.query_selector_all('.srpResultCard')
            print(f"Found {len(job_cards)} jobs for {skill}")

            for card in job_cards:
                try:
                    title_el = await card.query_selector('.jobTitle')
                    company_el = await card.query_selector('.companyName')
                    location_el = await card.query_selector('.jobLocation')
                    link_el = await card.query_selector('.jobTitle') # Link is usually on title

                    if not title_el or not link_el:
                        continue

                    title = await title_el.inner_text()
                    company = await company_el.inner_text() if company_el else "Unknown"
                    location = await location_el.inner_text() if location_el else "Remote"
                    link = await link_el.get_attribute('href')
                    
                    if link and not link.startswith('http'):
                        link = "https:" + link

                    # Extract ID from URL
                    # URL format: .../job-title-[id]?searchId=...
                    # or .../job/[id]
                    # Foundit URL: https://www.foundit.in/job/software-developer-canonical-bangalore-23423423
                    job_id = link.split('-')[-1].split('?')[0] if link else None
                    
                    if not job_id:
                        continue

                    source_hash = f"foundit_{job_id}"
                    
                    # 24h Lock Logic
                    public_release_at = datetime.utcnow() + timedelta(hours=24)

                    job_doc = {
                        "title": title.strip(),
                        "company": company.strip(),
                        "location": location.strip(),
                        "apply_link": link,
                        "tags": ["Fresher", skill, "Batch:2024", "Batch:2025"], # Mock tags for now
                        "source_hash": source_hash,
                        "is_active": True,
                        "public_release_at": public_release_at,
                        "created_at": datetime.utcnow()
                    }

                    # Upsert
                    jobs_collection.update_one(
                        {"source_hash": source_hash},
                        {"$set": job_doc},
                        upsert=True
                    )
                    print(f"Upserted: {title}")

                except Exception as e:
                    print(f"Error parsing card: {e}")
                    continue
            
        except Exception as e:
            print(f"Error scraping {skill}: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    skills = ["react", "node", "python", "java", "frontend", "backend"]
    for skill in skills:
        asyncio.run(scrape_foundit(skill))
