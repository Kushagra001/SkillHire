import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

MONGO_URI = os.getenv('MONGODB_URI')
if not MONGO_URI:
    print("MONGODB_URI not found in .env.local")
    sys.exit(1)

try:
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    collection = db.jobs

    # Find a few jobs
    jobs = list(collection.find().limit(5))
    
    print(f"Checking {len(jobs)} jobs for raw_data...")
    
    for job in jobs:
        print(f"\nJob ID: {job['_id']}")
        print(f"Title: {job.get('title')}")
        raw_data = job.get('raw_data', {})
        if not raw_data:
             print("XX raw_data is MISSING or Empty")
        else:
            desc = raw_data.get('description')
            snippet = raw_data.get('snippet')
            print(f"raw_data keys: {list(raw_data.keys())}")
            print(f"Description length: {len(desc) if desc else 0}")
            print(f"Snippet length: {len(snippet) if snippet else 0}")

except Exception as e:
    print(f"Error: {e}")
