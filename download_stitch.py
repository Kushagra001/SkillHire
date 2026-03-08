import requests

url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2VmZjYwNjQ3YjFmOTQxMjc4OTY0NDlhN2M0YTYzM2IwEgsSBxD0lcmalBwYAZIBIwoKcHJvamVjdF9pZBIVQhM5NTY0OTI4Mzg0MDY1MzMwOTg2&filename=&opi=89354086"
output_file = "stitch_ui.html"

print(f"Downloading {url} to {output_file}...")
try:
    response = requests.get(url)
    response.raise_for_status()
    with open(output_file, "wb") as f:
        f.write(response.content)
    print("Download complete.")
except Exception as e:
    print(f"Download failed: {e}")
