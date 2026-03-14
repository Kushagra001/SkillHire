import os
from pymongo import MongoClient
import dotenv
import json

script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv.load_dotenv(os.path.join(script_dir, '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI')

def inspect_jobs():
    if not MONGO_URI:
        print("Error: MONGODB_URI not found.")
        return
    print(f"Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client['skillhire']
    jobs_collection = db.jobs

    print("--- Distribution Summary ---")
    total = jobs_collection.count_documents({})
    premium_jobs = jobs_collection.count_documents({"is_premium": True})
    non_premium_jobs = jobs_collection.count_documents({"is_premium": {"$ne": True}})
    
    # Check specifically for documents where distributed_channels IS NOT an array
    not_array = jobs_collection.count_documents({"distributed_channels": {"$not": {"$type": "array"}}})
    is_array = jobs_collection.count_documents({"distributed_channels": {"$type": "array"}})
    
    # Docs where it's a string
    is_string = jobs_collection.count_documents({"distributed_channels": {"$type": "string"}})
    
    print(f"Total Jobs: {total}")
    print(f"distributed_channels is ARRAY: {is_array}")
    print(f"distributed_channels NOT an array: {not_array}")
    print(f"distributed_channels IS string: {is_string}")

    print("\n--- Searching for ANY 'distributed' jobs ---")
    distributed_jobs = list(jobs_collection.find({"distribution_status": "distributed"}).limit(10))
    if distributed_jobs:
        print(f"Found {len(distributed_jobs)} jobs with 'distributed' status.")
        for dj in distributed_jobs:
            print(f"ID: {dj['_id']} | Channels: {dj.get('distributed_channels')}")
    else:
        print("No jobs found with 'distributed' status.")

    # List first 10 IDs in the DB to see if I'm even in the right place
    print("\n--- First 10 Job IDs in DB ---")
    first_10 = list(jobs_collection.find({}, {"_id": 1}).limit(10))
    for f in first_10:
        print(f"- {f['_id']}")

    any_distribution = jobs_collection.count_documents({"distributed_channels": {"$not": {"$size": 0}}})
    print(f"Jobs with ANY distribution: {any_distribution}")
    
    # Let's see some docs that have ANY distribution
    any_dist_sample = list(jobs_collection.find({"distributed_channels": {"$not": {"$size": 0}}}).limit(5))
    print("\n--- Samples with ANY distribution ---")
    for doc in any_dist_sample:
        print(f"ID: {doc['_id']} | Distributed Channels: {doc.get('distributed_channels')} | Type: {type(doc.get('distributed_channels'))}")

    # Aggie check
    pipeline = [
        {"$match": {"distributed_channels": {"$exists": True, "$type": "array", "$not": {"$size": 0}}}},
        {"$unwind": "$distributed_channels"},
        {"$group": {"_id": "$distributed_channels"}}
    ]
    unique_channels = [doc["_id"] for doc in jobs_collection.aggregate(pipeline)]
    print(f"Unique channels found (refined): {unique_channels}")

    in_premium_channel = jobs_collection.count_documents({"distributed_channels": "telegram_premium"})
    in_free_channel = jobs_collection.count_documents({"distributed_channels": "telegram_free"})
    
    status_distributed = jobs_collection.count_documents({"distribution_status": "distributed"})
    status_pending = jobs_collection.count_documents({"distribution_status": "pending"})

    print(f"Total Jobs: {total}")
    print(f"Premium Jobs: {premium_jobs}")
    print(f"Non-Premium Jobs: {non_premium_jobs}")
    print(f"Jobs with ANY distribution: {any_distribution}")
    print(f"Jobs in Premium Channel: {in_premium_channel}")
    print(f"Jobs in Free Channel: {in_free_channel}")
    print(f"Jobs with status 'distributed': {status_distributed}")
    print(f"Jobs with status 'pending': {status_pending}")

    print("\n--- Distribution Overlap ---")
    premium_in_premium = jobs_collection.count_documents({"is_premium": True, "distributed_channels": "telegram_premium"})
    free_in_premium = jobs_collection.count_documents({"is_premium": {"$ne": True}, "distributed_channels": "telegram_premium"})
    print(f"Premium jobs in Premium channel: {premium_in_premium}")
    print(f"NON-Premium jobs in Premium channel: {free_in_premium}")

    print("\n--- Sample Non-Premium Job with telegram_premium Channel ---")
    sample = jobs_collection.find_one({
        "is_premium": {"$ne": True},
        "distributed_channels": "telegram_premium"
    })
    
    if sample:
        # Convert ObjectId to string for printing
        sample['_id'] = str(sample['_id'])
        print(json.dumps(sample, indent=2, default=str))
    else:
        print("No matches found for Non-Premium + telegram_premium.")
        
        print("\n--- Sample Non-Premium Job Status ---")
        sample_any = jobs_collection.find_one({"is_premium": {"$ne": True}})
        if sample_any:
            sample_any['_id'] = str(sample_any['_id'])
            print(json.dumps(sample_any, indent=2, default=str))

if __name__ == "__main__":
    inspect_jobs()
