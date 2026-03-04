import os
import pymongo
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = (os.getenv('MONGODB_URI') or "").strip()

def main():
    if not MONGO_URI:
        print("MONGO_URI is missing")
        return
        
    client = pymongo.MongoClient(MONGO_URI)
    db = client.get_database()
    collection = db.jobs

    # We want to identify duplicates based on exact Title + Company + Location
    pipeline = [
        {
            "$group": {
                "_id": {
                    "title": {"$toLower": "$title"},
                    "company": {"$toLower": "$company"}, 
                    "location": {"$toLower": "$location"}
                },
                "count": {"$sum": 1},
                "docs": {"$push": "$_id"}
            }
        },
        {
            "$match": {
                "count": {"$gt": 1}
            }
        }
    ]

    duplicates = list(collection.aggregate(pipeline))
    
    total_deleted = 0
    for dup in duplicates:
        # Keep the first document, delete the rest
        docs_to_delete = dup["docs"][1:]
        result = collection.delete_many({"_id": {"$in": docs_to_delete}})
        total_deleted += result.deleted_count
        print(f"Removed {result.deleted_count} duplicates for: {dup['_id']['title']} at {dup['_id']['company']}")

    print(f"\nFinished deduping! Total duplicate records removed: {total_deleted}")

if __name__ == "__main__":
    main()
