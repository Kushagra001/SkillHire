from pymongo import MongoClient
import os
import dotenv

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = (os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire" or "").strip()
client = MongoClient(MONGO_URI)
db = client.get_database()

# Check for Apify jobs specifically
query = {"tags": "Apify"}
count = db.jobs.count_documents(query)
print(f"Total Apify jobs in DB: {count}")

if count > 0:
    print("Sample Apify job:", db.jobs.find_one(query, {'title': 1, 'company': 1, 'source_hash': 1}))
