
import os
import re
from pymongo import MongoClient
from dotenv import load_dotenv

# Load Env
load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire"

def get_logo(company_name):
    if not company_name or company_name == "Unknown":
        return None
    # Clean name for domain guess
    slug = company_name.lower().replace(" ", "").replace(".", "")
    return f"https://www.google.com/s2/favicons?domain={slug}.com&sz=128"

def backfill():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    collection = db.jobs
    
    # Find jobs with Clearbit logo or no logo
    query = {
        "$or": [
            {"logo": {"$regex": "clearbit"}},
            {"logo": {"$exists": False}}
        ]
    }
    
    jobs = collection.find(query)
    count = 0
    updated = 0
    
    print("Starting Logo Backfill...")
    
    for job in jobs:
        count += 1
        company = job.get('company')
        if not company: continue
        
        logo_url = get_logo(company)
        
        if logo_url:
            collection.update_one(
                {"_id": job["_id"]},
                {"$set": {"logo": logo_url}}
            )
            updated += 1
            if updated % 50 == 0:
                print(f"Updated {updated} jobs...")

    print(f"Backfill Complete. Processed {count} jobs. Updated {updated} with logos.")

if __name__ == "__main__":
    backfill()
