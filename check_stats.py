import os
import pymongo
from dotenv import load_dotenv

load_dotenv("web/.env.local")
uri = (os.getenv("MONGODB_URI") or "").strip()
client = pymongo.MongoClient(uri)
db = client.get_database()

print(f"Total jobs: {db.jobs.count_documents({})}")
print(f"Unprocessed jobs: {db.jobs.count_documents({'is_processed': False})}")
print(f"Processed jobs: {db.jobs.count_documents({'is_processed': True})}")

job = db.jobs.find_one()
if job:
    print(f"Sample Job ID: {job.get('_id')}, is_processed: {job.get('is_processed')}")
