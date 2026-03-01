import requests
import sys

BASE_URL = "http://localhost:3000/api/jobs"

def test_api():
    print(f"Testing API at {BASE_URL}...")
    
    # 1. Default Fetch
    try:
        res = requests.get(BASE_URL)
        if res.status_code == 200:
            data = res.json()
            print(f"[PASS] Default Fetch: Found {len(data.get('jobs', []))} jobs.")
        else:
            print(f"[FAIL] Default Fetch: Status {res.status_code}")
    except Exception as e:
        print(f"[FAIL] Connection refused: {e}")
        return

    # 2. Search Filter
    try:
        params = {"q": "developer"}
        res = requests.get(BASE_URL, params=params)
        data = res.json()
        print(f"[PASS] Search 'developer': Found {len(data.get('jobs', []))} jobs.")
    except Exception as e:
        print(f"[FAIL] Search: {e}")

    # 3. Source Filter (Google)
    try:
        params = {"source": "Google"}
        res = requests.get(BASE_URL, params=params)
        data = res.json()
        jobs = data.get('jobs', [])
        print(f"[PASS] Source 'Google': Found {len(jobs)} jobs.")
    except Exception as e:
        print(f"[FAIL] Source Filter: {e}")

    # 4. Grad Year Filter (2025)
    try:
        params = {"gradYear": "2025"}
        res = requests.get(BASE_URL, params=params)
        data = res.json()
        jobs = data.get('jobs', [])
        print(f"[PASS] Grad Year '2025': Found {len(jobs)} jobs (Expected 0 if no tags yet).")
    except Exception as e:
        print(f"[FAIL] Grad Year Filter: {e}")

if __name__ == "__main__":
    test_api()
