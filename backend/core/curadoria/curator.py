"""Curador de imagens (MVP): escolhe fotos do Pinterest para as lâminas com foto.

Fluxo: planejador de consultas (LLM) → coleta anônima → pré-filtro → download → ranking por visão
→ escolha por lâmina (sem repetir) → grava o arquivo e ajusta a zona de texto do motor tipográfico.
Qualquer falha devolve o controle ao pipeline, que gera a imagem por IA como antes.
"""

import io
import json
import os
import re
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

from . import vision_rank
from .pinterest_playwright import search_pins

ROOT = Path(__file__).resolve().parents[2]
ANCHOR = ROOT / "storage" / "curadoria" / "anchor-halo.jpg"
MIN_SCORE = 7.0  # abaixo disso a lâmina volta para a geração por IA
FALLBACK_QUERIES = [
    "silhouette sun halo minimal surreal",
    "lone figure glowing light vast space",
    "god aesthetic",
    "universe aesthetic",
]
PLANNER = """Você é o planejador de buscas de imagem da Bella (Isabella Dalcin). Dado o tema e o texto das lâminas, escreva 4 consultas curtas, em inglês, para a busca de imagens do Pinterest que retornem imagens simbólicas, sensíveis e limpas: figura humana pequena ou em silhueta, luz simbólica (halo, sol, feixe, brilho), grande espaço vazio, paisagem atmosférica, terracota, âmbar, areia, azul profundo.
Regras: 3 a 6 palavras por consulta; use vocabulário VISUAL (silhouette, halo, beam of light, vast desert, lone figure, fog, eclipse, minimal surreal), não emoções abstratas; cada consulta cobre um ângulo diferente (figura no espaço, símbolo de luz, paisagem, matéria ou textura); nunca use "spiritual aesthetic", "quote", "chakra", "lotus", "meditation", "yoga", "buddha", "crystals".
Responda apenas JSON: {"queries":["","","",""],"estado_emocional":"2 a 4 palavras"}"""


def _call_text(instructions, text, model="gpt-5.6-terra"):
    body = {"model": model, "reasoning": {"effort": "low"}, "max_output_tokens": 1200,
            "instructions": instructions, "input": text}
    req = urllib.request.Request("https://api.openai.com/v1/responses", data=json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"],
                                          "Content-Type": "application/json"})
    data = json.load(urllib.request.urlopen(req, timeout=120))
    return data.get("output_text") or "".join(
        c.get("text", "") for o in data.get("output", []) for c in o.get("content", []) if isinstance(c, dict))


def _plain(text):
    return re.sub(r"\*+|\[\[|\]\]", "", text or "").strip()


def plan_queries(slides, theme, log):
    resumo = "\n".join(f"- {_plain(s.get('title'))} | {_plain(s.get('body'))[:120]}" for s in slides[:6])
    try:
        raw = _call_text(PLANNER, f"TEMA: {theme}\nLÂMINAS:\n{resumo}")
        data = json.loads(raw[raw.index("{"):raw.rindex("}") + 1])
        queries = [q.strip() for q in data.get("queries", []) if isinstance(q, str) and q.strip()][:4]
        if queries:
            return queries, str(data.get("estado_emocional") or "")
    except Exception as exc:
        log(f"Planejador de consultas falhou ({str(exc)[:80]}); usando consultas padrão.")
    return FALLBACK_QUERIES, ""


def _download(pin, dest):
    for url in (pin["image_url_original"], pin["image_url_small"]):
        try:
            data = urllib.request.urlopen(urllib.request.Request(
                url, headers={"User-Agent": "Mozilla/5.0", "Referer": "https://www.pinterest.com/"}), timeout=30).read()
            if data[4:8] == b"ftyp":  # HEIC: tenta a versão JPG pequena
                continue
            Image.open(io.BytesIO(data)).verify()
            dest.write_bytes(data)
            return True
        except Exception:
            continue
    return False


def _prefilter(pins):
    out = [p for p in pins
           if p["width"] >= 900 and p["height"] > 0 and 1.1 <= p["height"] / p["width"] <= 1.9
           and not p.get("promoted") and not p.get("is_video")]
    out.sort(key=lambda p: (abs(p["height"] / p["width"] - 1.25), -min(p["width"], 2000)))
    return out


def _room_for_type(path):
    """Bônus/penalidade pelo espaço calmo para tipografia (maior vão entre topo e base)."""
    try:
        from core.util.composer.art_director import crop_photo
        from core.util.composer.bella_type_engine import _calm_height, _calm_height_up
        img = crop_photo(Image.open(path), (1080, 1350), focus=(0.5, 0.45)).convert("RGBA")
        span = max(_calm_height(img, 88, 728, 190, 620), _calm_height_up(img, 88, 728, 1180, 620))
    except Exception:
        return 0.0
    if span < 260:
        return -1.5
    if span >= 420:
        return 0.5
    return 0.0


def curate_images(slides, out_dir, payload, log, layout_uses_image, pool_cap=48, queries_cap=4):
    """Escolhe imagens para as lâminas com foto. Altera `slides` e devolve quantas foram curadas."""
    targets = [i for i, s in enumerate(slides)
               if layout_uses_image(s.get("layout", "fullbleed")) and not s.get("curated_image_path")]
    if not targets:
        return 0
    work = Path(out_dir) / "_curadoria"
    (work / "images").mkdir(parents=True, exist_ok=True)
    theme = payload.get("theme") or payload.get("title") or ""
    t0 = time.time()

    queries, emotion = plan_queries(slides, theme, log)
    log(f"Curadoria Pinterest: {len(targets)} lâmina(s) com foto · consultas: {' | '.join(queries[:queries_cap])}")

    pins = {}
    for q in queries[:queries_cap]:
        try:
            found, diag = search_pins(q, scrolls=1)
        except Exception as exc:
            log(f"  consulta '{q}' falhou: {str(exc)[:80]}")
            continue
        for p in found:
            pins.setdefault(p.pin_id, dict(p.__dict__))
        log(f"  '{q}': {len(found)} pins" + (f" (parou: {diag['stopped']})" if diag.get("stopped") else ""))
        time.sleep(6)
    if not pins:
        log("Curadoria: nenhum pin coletado; usando geração por IA.")
        return 0

    pool = _prefilter(list(pins.values()))[:pool_cap]
    with ThreadPoolExecutor(max_workers=6) as ex:
        done = list(ex.map(lambda p: _download(p, work / "images" / f"{p['pin_id']}.jpg"), pool))
    pool = [p for p, ok in zip(pool, done) if ok]
    log(f"  {len(pins)} pins únicos → {len(pool)} candidatas baixadas; ranqueando por visão…")
    if not pool:
        return 0

    paths = [work / "images" / f"{p['pin_id']}.jpg" for p in pool]
    context = f"Tema: {theme}. Estado emocional: {emotion or 'inferir das lâminas'}. Capa: {_plain(slides[0].get('title'))}."
    ranked, usage = vision_rank.rank(paths, ANCHOR, context=context)
    scored = []
    for path, pin in zip(paths, pool):
        r = ranked.get(str(path))
        if not r or r.get("eliminar"):
            continue
        total = r["bella"] * 0.35 + r["emocao"] * 0.35 + r["estetica"] * 0.30
        if r.get("espaco_limpo") not in ("topo", "base", "esquerda", "direita"):
            total -= 2
        if r.get("rosto") == "identificavel":
            total -= 3
        total += _room_for_type(path)
        scored.append((round(total, 2), path, pin, r))
    scored.sort(key=lambda x: -x[0])
    (work / "ranking.json").write_text(json.dumps(
        [{"total": t, "pin_id": p["pin_id"], "pin_url": p["pin_url"], **r} for t, _, p, r in scored],
        ensure_ascii=False, indent=1), encoding="utf-8")

    taken, used_zones, picked = set(), [], 0
    for i in targets:
        free = [item for item in scored if item[1] not in taken and item[0] >= MIN_SCORE]
        # a variedade de zona só decide entre imagens boas; nunca passa na frente da qualidade
        pick = next((item for item in free if item[3].get("espaco_limpo") not in used_zones and item[0] >= free[0][0] - 1.0), None) or (free[0] if free else None)
        if not pick:
            log(f"  S{slides[i].get('num', i + 1)}: sem candidata com nota >= {MIN_SCORE}; esta lâmina será gerada por IA.")
            break
        total, path, pin, r = pick
        if total < MIN_SCORE:
            log(f"  S{slides[i].get('num', i + 1)}: melhor candidata restante tem nota {total} (< {MIN_SCORE}); esta lâmina será gerada por IA.")
            break
        taken.add(path)
        dest = Path(out_dir) / f"curada-{slides[i].get('num', str(i + 1).zfill(2))}.jpg"
        Image.open(path).convert("RGB").save(dest, "JPEG", quality=95)
        zone = r.get("espaco_limpo")
        plan = slides[i].get("visual_plan") if isinstance(slides[i].get("visual_plan"), dict) else {}
        plan.pop("text_zone", None)
        plan.pop("text_side", None)
        if zone in ("topo", "base"):
            plan["text_zone"] = zone
        elif zone in ("esquerda", "direita"):
            plan["text_side"] = "left" if zone == "esquerda" else "right"
        slides[i]["visual_plan"] = plan
        slides[i]["curated_image_path"] = str(dest)
        slides[i]["image_source"] = {"origem": "pinterest", "pin_id": pin["pin_id"], "pin_url": pin["pin_url"],
                                     "nota": total, "estado_emocional": r.get("estado_emocional"),
                                     "motivo": r.get("motivo"), "consulta": pin.get("query")}
        used_zones.append(zone)
        picked += 1
        log(f"  S{slides[i].get('num', i + 1)}: nota {total} · {r.get('estado_emocional')} · espaço {zone}")
    log(f"Curadoria concluída em {round(time.time() - t0)}s ({picked} imagem(ns); visão: {usage['input_tokens']}+{usage['output_tokens']} tokens).")
    return picked
