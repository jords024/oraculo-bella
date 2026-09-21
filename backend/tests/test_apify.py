import json
import os

import requests
from dotenv import load_dotenv

load_dotenv()


API_KEY = os.getenv("APIFY_API_KEY")
url = f"https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token={API_KEY}"


payload = {
    "queries": "física quântica expansão da consciência news",
    "maxPagesPerQuery": 1,
    "resultsPerPage": 5,
    "languageCode": "pt",
    "countryCode": "br"
}

print("Running Apify task...")
response = requests.post(url, json=payload, timeout=120)
print("Status:", response.status_code)
try:
    print(json.dumps(response.json()[:2], indent=2))
except:
    print(response.text[:500])
