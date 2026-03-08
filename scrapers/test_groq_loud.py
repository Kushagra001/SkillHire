import sys, json, os, traceback
from dotenv import load_dotenv
load_dotenv('../web/.env.local')

import pymongo
db = pymongo.MongoClient(os.getenv('MONGODB_URI') or os.getenv('MONGO_URI')).get_database()
job = db.jobs.find_one()

sys.path.append('../web/scripts')
import refinery

raw_data = job.get('raw_data', {})
text_to_analyze = str(job.get('description', '')).strip()

if not text_to_analyze:
    text_to_analyze = str(
        job.get('raw_snippet') or 
        raw_data.get('snippet') or 
        raw_data.get('raw_snippet') or 
        ""
    )
    
if not text_to_analyze and isinstance(raw_data.get('description'), dict):
    d = raw_data.get('description')
    text_to_analyze = str(d.get('text') or d.get('html') or "")
elif not text_to_analyze and isinstance(raw_data.get('description'), str):
    text_to_analyze = str(raw_data.get('description'))

current_chunk = [{
    "id": "123456",
    "_original_id": "123456",
    "title": "Software Engineer - Full Stack",
    "location": "Bangalore",
    "description": "We are looking for a highly skilled Full Stack Developer to join our core team. You will be responsible for building scalable web applications. Requirements: 2+ years of experience with React, Node.js, and TypeScript. Experience with MongoDB and AWS is a huge plus. This is a full-time role offering 12 LPA. 2024 graduates preferred."
}]

print(f"Testing job: {job.get('title')}")
print("\n--- RAW DESCRIPTION FEED BEFORE API ---")
print(current_chunk[0]['description'])
print("--------------------------------------\n")

extracted_results = refinery.process_job_batch_with_groq(current_chunk)

with open('test_output.json', 'w') as f:
    json.dump(extracted_results, f, indent=2)

print("\nResult written to test_output.json")
