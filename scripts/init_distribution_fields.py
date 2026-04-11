import os
from pymongo import MongoClient
import dotenv

# Load env variables from web/.env.local relative to this scripts folder
dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = ((os.getenv('MONGODB_URI') or "").strip() or "mongodb://localhost:27017/skillhire" or "").strip()

def migrate_jobs():
    if not MONGO_URI:
        print("Error: MONGODB_URI not found.")
        return

    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    jobs_collection = db.jobs

    print("Running migration to initialize distribution fields for existing jobs...")
    
    # Update documents that don't have distribution_status
    result = jobs_collection.update_many(
        { "distribution_status": { "$exists": False } },
        {
            "$set": {
                "distribution_status": "pending",
                "distributed_channels": [],
                "is_active": True
            }
        }
    )

    print(f"Migration complete: {result.modified_count} jobs updated out of {result.matched_count} matched jobs.")

if __name__ == "__main__":
    migrate_jobs()
