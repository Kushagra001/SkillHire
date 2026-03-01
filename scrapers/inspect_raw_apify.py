from pymongo import MongoClient
import os
import dotenv
import pprint

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire"
client = MongoClient(MONGO_URI)
db = client.get_database()

# Find the Apify job
job = db.jobs.find_one({"tags": "Apify"})
if job and 'raw_data' in job:
    print("Raw Data Keys:", job['raw_data'].keys())
    pprint.pprint(job['raw_data'])
else:
    print("No raw data found.")
