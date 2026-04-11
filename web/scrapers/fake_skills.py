import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('../web/.env.local')

client = MongoClient(os.getenv('MONGODB_URI') or os.getenv('MONGO_URI'))
db = client.get_database()

db.jobs.update_many({}, {"$set": {"skills": ["React", "Next.js", "TypeScript", "Node.js"]}})
print('Successfully populated fake skills for UI testing.')
