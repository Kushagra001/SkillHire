
import requests
import json

def verify_api():
    try:
        response = requests.get('http://localhost:3000/api/jobs?limit=5')
        if response.status_code != 200:
            print(f"API Error: {response.status_code}")
            return

        data = response.json()
        jobs = data.get('jobs', [])
        
        print(f"Fetched {len(jobs)} jobs from API")
        
        for job in jobs:
            print(f"Job: {job.get('title')} at {job.get('company')}")
            print(f"Root Logo: {job.get('logo')}")
            print(f"Raw Data Logo: {job.get('raw_data', {}).get('logo')}")
            print("-" * 30)
            
    except Exception as e:
        print(f"Error calling API: {e}")

if __name__ == "__main__":
    verify_api()
