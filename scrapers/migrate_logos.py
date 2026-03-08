import os
import urllib.parse
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(r'C:\Users\kusha\OneDrive\Desktop\SkillHire\web', '.env.local'))
client = MongoClient(os.getenv('MONGODB_URI'))
jobs_collection = client.get_database().jobs

count = 0
for job in jobs_collection.find({'logo': {'$regex': 'google.com/s2/favicons'}}):
    company = job.get('company', 'Unknown')
    encoded = urllib.parse.quote(company)
    new_logo = f'https://ui-avatars.com/api/?name={encoded}&background=random&color=fff&size=128'
    jobs_collection.update_one({'_id': job['_id']}, {'$set': {'logo': new_logo}})
    count += 1

print(f'Migrated {count} generic logos.')
