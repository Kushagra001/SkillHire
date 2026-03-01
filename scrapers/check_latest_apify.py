from pymongo import MongoClient
import os
import dotenv
from pprint import pprint

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire"
client = MongoClient(MONGO_URI)
db = client.get_database()

# Find the most recent Apify job
job = db.jobs.find_one(
    {"tags": "Apify"},
    sort=[("created_at", -1)]
)

if job:
    print(f"Found Job: {job.get('title')} at {job.get('company')}")
    print("Raw Data Sample:")
    pprint(job.get('raw_data'))
else:
    print("No Apify jobs found.")
