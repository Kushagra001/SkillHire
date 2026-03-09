import os
import random
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(r'C:\Users\kusha\OneDrive\Desktop\SkillHire\web', '.env.local'))
client = MongoClient(os.getenv('MONGODB_URI'))
db = client.get_database()

jobs = list(db.jobs.find({}))
count = 0
for job in jobs:
    is_premium = random.random() < 0.3
    db.jobs.update_one({'_id': job['_id']}, {'$set': {'is_premium': is_premium}})
    if is_premium:
        count += 1

print(f'Successfully flagged {count} out of {len(jobs)} jobs as premium.')
