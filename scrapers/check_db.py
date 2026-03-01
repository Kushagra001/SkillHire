from pymongo import MongoClient
import os
import dotenv

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI') or "mongodb://localhost:27017/skillhire"
client = MongoClient(MONGO_URI)
db = client.get_database()
count = db.jobs.count_documents({})
print(f"Total jobs in DB: {count}")
if count > 0:
    print("Sample job:", db.jobs.find_one({}, {'title': 1, 'company': 1}))
