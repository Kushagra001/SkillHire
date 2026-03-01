import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(r'C:\Users\kusha\OneDrive\Desktop\SkillHire\web', '.env.local'))
client = MongoClient(os.getenv('MONGODB_URI'))
db = client.get_database()

# Find all that failed due to the 429
failed_count = db.jobs.count_documents({'refinery_error': True})
if failed_count > 0:
    res = db.jobs.update_many({'refinery_error': True}, {'$set': {'is_processed': False}, '$unset': {'refinery_error': ''}})
    print(f'Reset {res.modified_count} jobs.')
else:
    print('No failed jobs found to reset.')
