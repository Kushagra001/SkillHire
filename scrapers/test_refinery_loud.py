import sys, json, os, traceback
from dotenv import load_dotenv
load_dotenv('../web/.env.local')

import pymongo
db = pymongo.MongoClient(os.getenv('MONGODB_URI') or os.getenv('MONGO_URI')).get_database()
job = db.jobs.find_one()

sys.path.append('../web/scripts')
import refinery

# Monkey patch to raise exception instead of returning None
def process_job_with_gemini_loud(title, desc, raw_location):
    prompt = f"Job Title: {title}\nRaw Location: {raw_location}\nDescription:\n{desc}"
    
    response = refinery.model.generate_content(prompt)
    text = response.text
    print("RAW TEXT:")
    print(repr(text))
    if text.startswith("```json"):
        text = text[7:-3]
        
    data = json.loads(text)
    return data

refinery.process_job_with_gemini = process_job_with_gemini_loud

try:
    print('Testing job:', job['title'])
    res = refinery.process_job(job)
    print('Result:', res)
except Exception as e:
    print('EXCEPTION:')
    traceback.print_exc()
