
from pymongo import MongoClient
import os
import datetime
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire"

def seed():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    collection = db.jobs
    
    # Mock Raw Job
    raw_job = {
        "title": "Software Engineer Intern (2026 Batch)",
        "company": "TestCorp",
        "location": "Bengaluru",
        "apply_link": "https://example.com/job/123",
        "tags": ["Mock"],
        "source_hash": "mock_test_001",
        "is_active": True,
        "public_release_at": datetime.datetime.utcnow(),
        "created_at": datetime.datetime.utcnow(),
        "is_processed": False # This triggers the refinery
    }
    
    collection.update_one(
        {"source_hash": "mock_test_001"},
        {"$set": raw_job},
        upsert=True
    )
    print("Seeded 'mock_test_001' for processing.")

if __name__ == "__main__":
    seed()
