
import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Load Env
load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire"

def check_logos():
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_database()
        collection = db.jobs
        
        # Get latest 5 jobs
        jobs = collection.find().sort("created_at", -1).limit(5)
        
        print(f"--- Checking Latest 5 Jobs for Logos ---")
        found_logos = 0
        for job in jobs:
            title = job.get('title', 'N/A')
            company = job.get('company', 'N/A')
            logo = job.get('logo')
            
            print(f"Title: {title}")
            print(f"Company: {company}")
            print(f"Logo: {logo}")
            print("-" * 30)
            
            if logo and "clearbit.com" in logo:
                found_logos += 1
                
        print(f"Found {found_logos} jobs with Clearbit logos in the last 5 entries.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_logos()
