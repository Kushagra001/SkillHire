import sys, json, os, traceback
from dotenv import load_dotenv
load_dotenv('../web/.env.local')

import pymongo
db = pymongo.MongoClient(os.getenv('MONGODB_URI') or os.getenv('MONGO_URI')).get_database()
job = db.jobs.find_one()

sys.path.append('../web/scripts')
import refinery

# Get a valid description from the job to test
prompt = f"Job Title: {job['title']}\nRaw Location: {job['location']}\nDescription:\n{job.get('description', '')}"
response = refinery.model.generate_content(prompt)

with open('output_utf8.txt', 'w', encoding='utf-8') as f:
    f.write(response.text)
