from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(r'C:\Users\kusha\OneDrive\Desktop\SkillHire\web', '.env.local'))
client = MongoClient(os.getenv('MONGODB_URI'))
docs = client.get_database().jobs.find({'tags': 'Greenhouse', 'experience': {'$ne': 'Not Specified'}}).limit(20)
for d in docs:
    print(f"[{d.get('title')}] Exp: {d.get('experience')}")
