from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(r'C:\Users\kusha\OneDrive\Desktop\SkillHire\web', '.env.local'))
client = MongoClient(os.getenv('MONGODB_URI'))

docs = client.get_database().jobs.find({'tags': 'Greenhouse'}).sort('created_at', -1).limit(2)
for d in docs:
    print(f"[{d.get('title')}] - {d.get('company')}")
    print(f"  Location: {d.get('location')}")
    desc = d.get('description', 'NO_DESCRIPTION')
    print(f"  Desc Length: {len(desc)} chars. Sneak Peek: {desc[:60]}...\n{'='*40}")
