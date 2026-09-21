import base64
import json
import os
import urllib.error
import urllib.request

from dotenv import load_dotenv

import pytest

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    pytest.skip("GEMINI_API_KEY not found in .env", allow_module_level=True)

models = ["gemini-3.1-flash-image", "gemini-3-pro-image", "imagen-4.0-generate-001", "imagen-4.0-fast-generate-001"]

for model in models:
    print(f"\nTrying model: {model}")
    if "imagen" in model:
        # Imagen uses predict endpoint
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:predict"
        payload = {
            "instances": [
                {
                    "prompt": "A majestic glowing golden key floating in deep cosmic space, mystical atmosphere, absolute black background."
                }
            ],
            "parameters": {
                "sampleCount": 1,
                "aspectRatio": "3:4"
            }
        }
    else:
        # Gemini image uses generateContent endpoint
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        payload = {
            "contents": [{"parts": [{"text": "A majestic glowing golden key floating in deep cosmic space, mystical atmosphere, absolute black background, high contrast chiaroscuro lighting, portrait style, 9:16."}]}],
            "generationConfig": {
                "responseModalities": ["IMAGE"]
            }
        }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "x-goog-api-key": api_key,
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        print(f"Sending request to {model}...")
        with urllib.request.urlopen(req, timeout=30) as r:
            body = json.loads(r.read().decode("utf-8"))

        if "imagen" in model:
            predictions = body.get("predictions", [])
            if predictions:
                b64_str = predictions[0].get("bytesBase64Encoded")
                if b64_str:
                    img_bytes = base64.b64decode(b64_str)
                    with open(f"test_{model}.jpg", "wb") as f:
                        f.write(img_bytes)
                    print(f"SUCCESS with {model}! Saved as test_{model}.jpg")
                    break
            print("No image data in prediction response:", body)
        else:
            parts = body.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            ip = next(
                (p for p in parts if p.get("inlineData", {}).get("mimeType", "").startswith("image/")),
                None
            )
            if ip:
                img_bytes = base64.b64decode(ip["inlineData"]["data"])
                with open(f"test_{model}.jpg", "wb") as f:
                    f.write(img_bytes)
                print(f"SUCCESS with {model}! Saved as test_{model}.jpg")
                break
            else:
                print("No image data found in response:", json.dumps(body)[:300])
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()[:300]}")
    except Exception as e:
        print("Error:", e)
