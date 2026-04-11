import sys, json, os
from dotenv import load_dotenv
load_dotenv('../web/.env.local')

import google.generativeai as genai
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

model = genai.GenerativeModel('gemini-2.5-flash', generation_config={'response_mime_type': 'application/json'})
resp = model.generate_content('Extract {"skills": ["python", "java"]} as JSON array')
print('RAW TEXT:', repr(resp.text))
