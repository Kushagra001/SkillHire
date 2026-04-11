from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(r'C:\Users\kusha\OneDrive\Desktop\SkillHire\web', '.env.local'))
client = MongoClient(os.getenv('MONGODB_URI'))

docs = client.get_database().jobs.find({'tags': 'Unstop'}).sort('created_at', -1).limit(3)
for d in docs:
    print(f"[{d.get('title')}] - {d.get('company')}")
    print(f"  Type: {d.get('job_type')}")
    print(f"  Exp: {d.get('experience')}")
    print(f"  Skills: {', '.join(d.get('skills', []))[:100]}\n")
