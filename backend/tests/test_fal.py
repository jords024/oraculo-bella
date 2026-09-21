import json
import os
import urllib.error
import urllib.request

from dotenv import load_dotenv

import pytest

load_dotenv()
fal_key = os.getenv("FAL_KEY")

if not fal_key:
    pytest.skip("FAL_KEY not found in .env", allow_module_level=True)

print(f"Using FAL_KEY: {fal_key[:10]}...")

prompt = "A majestic glowing golden key floating in deep cosmic space, mystical atmosphere, absolute black background."

# FAL API url for flux/schnell
url = "https://queue.fal.run/fal-ai/flux/schnell"
headers = {
    "Authorization": f"Key {fal_key}",
    "Content-Type": "application/json"
}
payload = {
    "prompt": prompt,
    "image_size": "portrait_4_3",
    "sync_mode": True
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers=headers,
    method="POST"
)

try:
    print("Sending request to fal.ai (flux/schnell)...")
    with urllib.request.urlopen(req, timeout=120) as r:
        response = json.loads(r.read().decode("utf-8"))

    print("Response keys:", response.keys())
    images = response.get("images", [])
    if images:
        img_url = images[0].get("url")
        print("Success! Image URL:", img_url)
        # Download image
        with urllib.request.urlopen(img_url) as img_res:
            img_bytes = img_res.read()
            with open("test_fal_output.jpg", "wb") as f:
                f.write(img_bytes)
        print("Saved test_fal_output.jpg successfully!")
    else:
        print("No images key in response:", response)
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()}")
except Exception as e:
    print("Error:", e)
