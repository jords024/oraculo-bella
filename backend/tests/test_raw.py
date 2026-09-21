import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from pathlib import Path

from core.util.gen_image_openai import gen_openai as gen
from core.util.prompt_builder import build_prompt

prompt = "A pair of weathered human hands trying desperately to hold glowing golden sand, but the sand slips uncontrollably through their fingers into an endless abyss. Warm gold lighting, visceral desperation."
final_prompt = build_prompt(prompt)

print("Generating raw image...")
img_bytes = gen(final_prompt)
if img_bytes:
    out = Path("C:/Users/julia/Desktop/raw_dalle.png")
    out.write_bytes(img_bytes)
    print("Saved to", out)
