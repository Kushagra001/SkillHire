from pymongo import MongoClient
import os
import dotenv
from pprint import pprint

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = (os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire" or "").strip()
client = MongoClient(MONGO_URI)
db = client.get_database()

# Find the most recent SerpApi Google Job
job = db.jobs.find_one(
    {"tags": "SerpApi"},
    sort=[("created_at", -1)]
)

if job:
    print(f"Found Job: {job.get('title')} at {job.get('company')}")
    print(f"Location: {job.get('location')}")
    print(f"Apply Link: {job.get('apply_link')}")
    print(f"Source Hash: {job.get('source_hash')}")
else:
    print("No SerpApi jobs found.")
