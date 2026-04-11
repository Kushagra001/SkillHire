
import requests
import socket

def check_network():
    print("--- Network Check ---")
    
    # 1. DNS Resolution
    try:
        ip = socket.gethostbyname("google.com")
        print(f"DNS google.com: {ip}")
    except Exception as e:
        print(f"DNS google.com Failed: {e}")

    try:
        ip = socket.gethostbyname("logo.clearbit.com")
        print(f"DNS logo.clearbit.com: {ip}")
    except Exception as e:
        print(f"DNS logo.clearbit.com Failed: {e}")

    # 2. HTTP Request
    try:
        r = requests.get("https://www.google.com", timeout=5)
        print(f"HTTP google.com: {r.status_code}")
    except Exception as e:
        print(f"HTTP google.com Failed: {e}")

if __name__ == "__main__":
    check_network()
