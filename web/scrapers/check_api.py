import requests
import json

def check_board(token):
    url = f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true"
    try:
        response = requests.get(url)
        print(f"Checking {token}: Status {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            jobs = data.get('jobs', [])
            print(f"Found {len(jobs)} jobs for {token}")
            if jobs:
                print(f"Sample Job: {jobs[0]['title']}")
        else:
            print(f"Error: {response.text[:200]}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    check_board("grammarly")
    check_board("stripe")
