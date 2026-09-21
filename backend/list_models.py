import json
import os
import urllib.error
import urllib.request

from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("GEMINI_API_KEY not found in .env")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    print("Fetching available Gemini models...")
    with urllib.request.urlopen(url, timeout=30) as r:
        response = json.loads(r.read().decode("utf-8"))

    models = response.get("models", [])
    print(f"Found {len(models)} models:")
    for m in models:
        print(f"- {m.get('name')}: {m.get('displayName')} (methods: {m.get('supportedGenerationMethods')})")
except Exception as e:
    print("Error:", e)
