from seleniumbase import Driver
import time

def test_unstop_bypass():
    print("Launching undetected browser...")
    # uc=True turns on Undetected Chromedriver mode
    # headless=False lets you visually watch it solve the Cloudflare challenge
    driver = Driver(uc=True, headless=False) 
    
    try:
        test_url = "https://unstop.com/jobs"
        print(f"Navigating to {test_url}")
        driver.uc_open_with_reconnect(test_url, 4)
        
        # Give Cloudflare's JavaScript 5 seconds to run the math puzzle
        time.sleep(5) 
        
        # Check if we successfully got the real page title
        title = driver.title
        print(f"Success! Page Title: {title}")
        
    except Exception as e:
        print(f"Failed to bypass: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_unstop_bypass()
