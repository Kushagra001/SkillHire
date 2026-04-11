import os
from pymongo import MongoClient
import dotenv

# Load env variables from web/.env.local relative to this scripts folder
script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv.load_dotenv(os.path.join(script_dir, '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI')

def cleanup_distribution():
    if not MONGO_URI:
        print("Error: MONGODB_URI not found in environment.")
        return

    print(f"Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    jobs_collection = db.jobs

    # 1. Find jobs that are NOT premium but were incorrectly marked for telegram_premium
    # We check for is_premium: false or where the field doesn't exist at all
    query = {
        "$or": [
            { "is_premium": False },
            { "is_premium": { "$exists": False } }
        ],
        "distributed_channels": "telegram_premium"
    }

    # Count affected jobs first
    count = jobs_collection.count_documents(query)
    if count == 0:
        print("No incorrectly distributed jobs found. Database is clean!")
        return

    print(f"Found {count} jobs incorrectly marked as 'telegram_premium'. Starting cleanup...")

    # 2. Perform the update:
    # - Remove 'telegram_premium' from the distributed_channels array
    # - Remove the 'premium_posted_at' timestamp
    # - Set distribution_status back to 'pending'
    
    # We do this in two steps to be safe about the distribution_status
    # First, pull the channel and unset the date
    result = jobs_collection.update_many(
        query,
        {
            "$pull": { "distributed_channels": "telegram_premium" },
            "$unset": { "premium_posted_at": "" }
        }
    )
    
    print(f"Removed 'telegram_premium' marker from {result.modified_count} jobs.")

    # Second, for any job that now has an empty distributed_channels array, 
    # set status back to 'pending' so the n8n logic picks it up again
    status_result = jobs_collection.update_many(
        {
            "distributed_channels": { "$size": 0 },
            "distribution_status": "distributed"
        },
        {
            "$set": { "distribution_status": "pending" }
        }
    )

    print(f"Reset {status_result.modified_count} jobs back to 'pending' status.")
    print("Cleanup complete! These jobs will now be picked up by your fixed n8n workflow during the next run.")

if __name__ == "__main__":
    cleanup_distribution()
