import os
from pymongo import MongoClient
import dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv.load_dotenv(os.path.join(script_dir, '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI')

def remove_garbage_fields():
    if not MONGO_URI:
        print("Error: MONGODB_URI not found.")
        return

    client = MongoClient(MONGO_URI)
    db = client['skillhire']
    jobs_collection = db.jobs

    # We need to find keys that start with "{" or contain "$set" as literal strings
    # MongoDB doesn't easily allow unsetting dynamic keys via update_many easily if we don't know the exact string.
    # But we saw the exact strings in the inspection output.
    
    garbage_prefixes = ["{\"$set\":", "\"$addToSet\":", "\"premium_posted_at\":{\"$date\""]
    
    print("Scanning for garbage fields...")
    
    # We'll iterate through documents and find keys to unset
    cursor = jobs_collection.find({})
    total_cleaned = 0
    
    for doc in cursor:
        to_unset = {}
        for key in list(doc.keys()):
            for prefix in garbage_prefixes:
                if key.startswith(prefix):
                    to_unset[key] = ""
        
        if to_unset:
            jobs_collection.update_one({"_id": doc["_id"]}, {"$unset": to_unset})
            total_cleaned += 1

    print(f"Cleanup complete! Removed literal JSON fields from {total_cleaned} documents.")

if __name__ == "__main__":
    remove_garbage_fields()
