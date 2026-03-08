import sys, traceback, json, os
from dotenv import load_dotenv

load_dotenv('../web/.env.local')
sys.path.append('../web/scripts')
import refinery

try:
    print('Testing model:', refinery.model.model_name)
    # Call generate_content directly so we catch the actual exception
    resp = refinery.model.generate_content('Extract skills: 2 years python experience', generation_config=refinery.generation_config)
    print('Response:', resp.text)
except Exception as e:
    print('ERROR MSG:', type(e), str(e))
