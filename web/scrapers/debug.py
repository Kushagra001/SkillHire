import requests
from bs4 import BeautifulSoup

def debug():
    url = "https://www.foundit.in/search/fresher-react-jobs"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        with open("foundit_dump.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        
        if response.status_code == 200:
             soup = BeautifulSoup(response.text, 'html.parser')
             print("Title:", soup.title.string if soup.title else "No title")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug()
