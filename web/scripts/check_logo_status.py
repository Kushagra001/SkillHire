
import requests

def check_url(url):
    try:
        r = requests.head(url, timeout=5)
        print(f"URL: {url} | Status: {r.status_code}")
    except Exception as e:
        print(f"URL: {url} | Error: {e}")

if __name__ == "__main__":
    check_url("https://logo.clearbit.com/sap.com")
    check_url("https://logo.clearbit.com/testcorp.com")
    check_url("https://logo.clearbit.com/google.com")
