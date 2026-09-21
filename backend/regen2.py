import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from pathlib import Path

from core.agentes.register_carousel import register
from core.util.compose_util import compose
from core.util.gen_image_openai import gen_openai as gen
from core.util.prompt_builder import build_prompt

OUT_DIR = Path("C:/Users/julia/Desktop/carrossel-dinheiro-foge")

s6 = {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "A SENSAÇÃO HORRÍVEL\nDE ESTAR SEMPRE\nPATINANDO",
    "body": "Você se esforça o mês inteiro, e no dia 15 já tá contando moeda de novo. Não é falta de inteligência sua. É pura biologia.",
    "prompt": "A completely abstract visual representation of time slipping away. Soft glowing particles drifting into an endless dark blue space. Beautiful cinematic lighting, peaceful but mysterious."
}

ok = 0
for s in [s6]:
    print(f"Gerando Slide {s['num']}...")
    prompt_final = build_prompt(s["prompt"])
    img = gen(prompt_final)
    if img:
        final = compose(img, s["title"], s["body"], s["layout"])
        slug = "".join(c if c.isalnum() else "-" for c in s["title"].splitlines()[0].lower()).strip("-")[:36]
        out = OUT_DIR / f"slide-{s['num']}-{slug}.jpg"
        final.save(str(out), "JPEG", quality=95)
        print("OK", out)
        ok += 1

print(f"Recuperados: {ok}/1")

register(
    title="O Dinheiro que Foge",
    theme="dinheiro-foge",
    format="B",
    slides_dir=str(OUT_DIR),
    caption="Sabe quando você finalmente consegue juntar um dinheirinho, e do nada aparece um imprevisto pra roubar tudo? Não é azar. Comente FONTE para desativar essa trava.",
    revisor_score="15/15",
    notes="Linguagem visceral e humanizada (Humanizer Impecável). Tese: Trauma financeiro biológico."
)
