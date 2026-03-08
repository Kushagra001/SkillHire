import asyncio
from playwright.async_api import async_playwright

async def debug():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        try:
            # Try Stripe
            await page.goto("https://boards.greenhouse.io/stripe", timeout=60000)
            print("Title:", await page.title())
            
            # Check for .opening
            openings = await page.query_selector_all('.opening')
            print(f"Found {len(openings)} openings")
            
            if len(openings) == 0:
                 # Dump content
                 content = await page.content()
                 with open("greenhouse_dump.html", "w", encoding="utf-8") as f:
                     f.write(content)
                 print("Dumped HTML")

            await asyncio.sleep(10) # Wait to see visual
            
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(debug())
