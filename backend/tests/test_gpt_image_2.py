import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

try:
    response = client.images.generate(
        model="gpt-image-2",
        prompt="A cosmic brain radiating light with the text 'MENTE DESBLOQUEADA' written elegantly on it.",
        n=1,
        size="1024x1024"
    )
    print("SUCCESS!")
    print(response.model_dump())
except Exception as e:
    print("ERROR:", e)
