import os
import time

import requests
from dotenv import load_dotenv

load_dotenv()
ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
IG_USER_ID = os.getenv("INSTAGRAM_ACCOUNT_ID")
BASE_URL = "https://graph.facebook.com/v20.0"

# Dummy image URL (catbox)
image_url = "https://files.catbox.moe/kixf6f.jpg" # valid image

def test_schedule():
    endpoint = f"{BASE_URL}/{IG_USER_ID}/media"
    payload = {
        "image_url": image_url,
        "caption": "Test post for scheduling.",
        "access_token": ACCESS_TOKEN,
        "is_scheduled_publish": "true",
        "scheduled_publish_time": str(int(time.time()) + 3600) # +1 hour
    }
    r = requests.post(endpoint, data=payload)
    print("STATUS:", r.status_code)
    print("RESPONSE:", r.json())

if __name__ == "__main__":
    test_schedule()
