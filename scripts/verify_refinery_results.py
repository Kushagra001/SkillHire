
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import datetime

load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire"

def verify():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    collection = db.jobs
    
    # Check Mock Job
    job = collection.find_one({"source_hash": "mock_test_001"})
    
    if not job:
        print("Mock job not found!")
        return

    print("--- Verified Job Data ---")
    print(f"Title: {job.get('title')}")
    print(f"Is Processed: {job.get('is_processed')}")
    print(f"Batch: {job.get('batch')}")
    print(f"Tech Stack: {job.get('tech_stack')}")
    print(f"Normalized Location: {job.get('normalized_location')}")
    print(f"Work Mode: {job.get('work_mode')}")
    print(f"Tags: {job.get('tags')}")

if __name__ == "__main__":
    verify()
