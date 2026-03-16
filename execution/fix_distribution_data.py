import os
from pymongo import MongoClient
from dotenv import load_dotenv

def cleanup_dates():
    # Load env
    load_dotenv()
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DB")
    
    if not uri or not db_name:
        print("Error: MONGODB_URI or MONGODB_DB not found in .env")
        return

    client = MongoClient(uri)
    db = client[db_name]
    jobs_col = db["jobs"]

    print(f"Connecting to database: {db_name}")

    # Find jobs where premium_posted_at contains a newline
    # In MongoDB, we can use $regex to find these
    query = {"premium_posted_at": {"$regex": "\\n"}}
    
    affected_jobs = list(jobs_col.find(query))
    print(f"Found {len(affected_jobs)} jobs with poisoned premium_posted_at dates.")

    count = 0
    for job in affected_jobs:
        old_val = job["premium_posted_at"]
        new_val = old_val.strip()
        
        # Verify it's actually different
        if old_val != new_val:
            jobs_col.update_one(
                {"_id": job["_id"]},
                {"$set": {"premium_posted_at": new_val}}
            )
            count += 1

    print(f"Successfully cleaned up {count} records.")

    # Also check for is_active: true inconsistencies if any (Optional but good)
    # The workflow relies on is_active: true. 
    # Just a sanity check.

if __name__ == "__main__":
    cleanup_dates()
