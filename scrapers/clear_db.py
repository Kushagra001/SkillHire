import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = ((os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "").strip() or "").strip()

def clear_db():
    if not MONGO_URI:
        print("No MongoDB URI found.")
        return
    client = MongoClient(MONGO_URI)
    db = client.get_database() # Uses the default DB from the URI
    collection = db.jobs
    result = collection.delete_many({})
    print(f"Deleted {result.deleted_count} jobs from the database.")

if __name__ == "__main__":
    clear_db()
