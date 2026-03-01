
import os
from pymongo import MongoClient
from dotenv import load_dotenv
import datetime

# Load Env
load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire"

def check_freshness():
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_database()
        collection = db.jobs
        
        # Get count
        total = collection.count_documents({})
        print(f"Total Jobs in DB: {total}")
        
        # Get latest 5 jobs
        jobs = collection.find().sort("created_at", -1).limit(5)
        
        print(f"--- Latest 5 Jobs ---")
        now = datetime.datetime.utcnow()
        for job in jobs:
            created_at = job.get('created_at')
            # Handle string vs datetime
            if isinstance(created_at, str):
                created_at = datetime.datetime.fromisoformat(created_at.replace('Z', '+00:00')).replace(tzinfo=None)
            
            diff = now - created_at
            print(f"Title: {job.get('title')}")
            print(f"Company: {job.get('company')}")
            print(f"Created At: {created_at} (Age: {diff})")
            print("-" * 30)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_freshness()
