import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from pathlib import Path

from core.agentes.register_carousel import register
from core.util.compose_util import compose
from core.util.gen_image_openai import gen_openai as gen
from core.util.prompt_builder import build_prompt

OUT_DIR = Path("C:/Users/julia/Desktop/carrossel-dinheiro-foge")

s2 = {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "title": "A GENTE CRESCE OUVINDO\nQUE DINHEIRO HONESTO\nÉ SUADO",
    "body": "Mas repara numa coisa: quem mais trabalha, acorda às 5 da manhã e pega ônibus lotado... é quem menos tem. Tem alguma coisa muito errada nessa conta.",
    "prompt": "A silhouette of a person standing at the base of a gigantic, towering mountain of gold. The scale is immense, creating a sense of distance. Cold amber lighting, cinematic."
}

s6 = {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "A SENSAÇÃO HORRÍVEL\nDE ESTAR SEMPRE\nPATINANDO",
    "body": "Você se esforça o mês inteiro, e no dia 15 já tá contando moeda de novo. Não é falta de inteligência sua. É pura biologia.",
    "prompt": "A glowing human footprint on dark wet sand, slowly fading away into the dark. Cinematic, moody, dark teal lighting."
}

ok = 0
for s in [s2, s6]:
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

print(f"Recuperados: {ok}/2")

register(
    title="O Dinheiro que Foge",
    theme="dinheiro-foge",
    format="B",
    slides_dir=str(OUT_DIR),
    caption="Sabe quando você finalmente consegue juntar um dinheirinho, e do nada aparece um imprevisto pra roubar tudo? Não é azar. Comente FONTE para desativar essa trava.",
    revisor_score="15/15",
    notes="Linguagem visceral e humanizada (Humanizer Impecável). Tese: Trauma financeiro biológico."
)
