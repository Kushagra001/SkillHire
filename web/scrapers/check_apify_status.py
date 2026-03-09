import os
from apify_client import ApifyClient
import dotenv
from pprint import pprint

# Load env variables
dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '../web/.env.local'))

APIFY_TOKEN = os.getenv('APIFY_API_TOKEN')
ACTOR_ID = 'orgupdate/google-jobs-scraper'

if not APIFY_TOKEN:
    print("Error: APIFY_API_TOKEN not found.")
    exit(1)

client = ApifyClient(APIFY_TOKEN)

# List runs for the actor
print(f"Checking runs for {ACTOR_ID}...")
runs = client.actor(ACTOR_ID).runs().list().items

if not runs:
    print("No runs found.")
else:
    # Get the latest run
    latest_run = runs[0]
    print(f"Latest Run ID: {latest_run['id']}")
    print(f"Status: {latest_run['status']}")
    print(f"Dataset ID: {latest_run['defaultDatasetId']}")
    
    # Check dataset items
    dataset_client = client.dataset(latest_run['defaultDatasetId'])
    items = dataset_client.list_items().items
    print(f"Items found: {len(items)}")
    
    if items:
        item = items[0]
        print("Keys:", sorted(list(item.keys())))
        print("Job Title:", item.get('job_title'))
        import pprint
        print("Posted Via:")
        pprint.pprint(item.get('posted_via'))
