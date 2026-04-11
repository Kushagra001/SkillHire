from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(r'C:\Users\kusha\OneDrive\Desktop\SkillHire\web', '.env.local'))
client = MongoClient(os.getenv('MONGODB_URI'))

docs = client.get_database().jobs.find({'tags': 'Unstop'}).sort('created_at', -1).limit(3)
for d in docs:
    print(f"LINK: {d.get('apply_link')}")
    print(f"LOGO: {d.get('logo')}")
    desc = d.get('description', 'NO_DESCRIPTION')
    print(f"DESC: {desc[:200]}...\n{'='*40}")
