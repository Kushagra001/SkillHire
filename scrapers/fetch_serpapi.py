import os
import json
import requests
import dotenv

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))
SERPAPI_KEY = os.getenv('SERPAPI_KEY')

params = {
    'engine': 'google_jobs',
    'q': 'data analyst fresher jobs India',
    'location': 'India',
    'google_domain': 'google.co.in',
    'hl': 'en',
    'gl': 'in',
    'tbs': 'qdr:d',
    'api_key': SERPAPI_KEY
}
r = requests.get('https://serpapi.com/search', params=params)
data = r.json()
jobs = data.get('jobs_results', [])
if jobs:
    with open('test_output.json', 'w', encoding='utf-8') as f:
        json.dump(jobs[0], f, indent=2, ensure_ascii=False)
    print("Saved to test_output.json")
