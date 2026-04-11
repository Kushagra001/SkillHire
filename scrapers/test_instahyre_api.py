from curl_cffi import requests
session = requests.Session(impersonate="chrome")
headers = {
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://www.instahyre.com/search-jobs/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
}
session.get("https://www.instahyre.com/search-jobs/", headers=headers)
headers["x-csrftoken"] = session.cookies.get("csrftoken", "")

# 40646 was the job_id from my earlier DB dump `resource_uri` for Software Engineer - Java
details_url = "https://www.instahyre.com/api/v1/employer_public_jobs/40646"
details_resp = session.get(details_url, headers=headers)
print("Status:", details_resp.status_code)
if details_resp.status_code == 200:
    details_data = details_resp.json()
    print("Keys:", details_data.keys())
    print("Desc length:", len(details_data.get('description', '')))
    print("workex_min:", details_data.get('workex_min'))
else:
    print("Failed to fetch.")
