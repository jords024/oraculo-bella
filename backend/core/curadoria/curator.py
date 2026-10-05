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
from .board_source import fetch_board

ROOT = Path(__file__).resolve().parents[2]
# A referência ideal acompanha o código (assets/, versionado); storage/ pode sobrescrevê-la sem mexer no repositório.
ANCHOR = next((p for p in (ROOT / "storage" / "curadoria" / "anchor-halo.jpg", ROOT / "assets" / "curadoria" / "anchor-halo.jpg") if p.exists()),
              ROOT / "assets" / "curadoria" / "anchor-halo.jpg")
MIN_SCORE = 7.0  # abaixo disso a lâmina volta para a geração por IA
BOARD_MIN_SCORE = 6.0  # pastas do próprio usuário já são curadas por ele: o filtro só barra texto, rosto e falta de espaço
RELAXED_DELTA = 1.5    # se faltar imagem, a 2ª passada aceita nota até 1,5 abaixo do mínimo (nunca cai para IA)
USED_FILE = ROOT / "storage" / "curadoria" / "used_pins.json"
USED_TTL_DAYS = 120    # uma imagem usada num carrossel não volta em outro por 120 dias
HASH_NEAR = 6          # distância (de 64 bits) abaixo da qual duas imagens contam como a mesma foto
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


def _boards_from(payload):
    """Lista de endereços de pastas escolhidas pelo usuário (aceita strings ou {url, name})."""
    out = []
    for item in payload.get("pinterestBoards") or []:
        url = item.get("url") if isinstance(item, dict) else item
        if isinstance(url, str) and url.strip():
            out.append(url.strip())
    return out[:6]


def _usable_for_cover(path):
    """Pastas não informam tamanho: mede a imagem baixada (largura mínima e proporção que o recorte 4:5 aguenta)."""
    try:
        with Image.open(path) as im:
            w, h = im.size
        return w >= 700 and 0.8 <= h / w <= 2.0
    except Exception:
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


def _dhash(path):
    """Impressão digital visual de 64 bits: a mesma foto repostada com outro ID tem hash quase igual."""
    try:
        with Image.open(path) as im:
            small = im.convert("L").resize((9, 8), Image.LANCZOS)
        px = list(small.getdata())
        bits = 0
        for row in range(8):
            for col in range(8):
                bits = (bits << 1) | (1 if px[row * 9 + col] > px[row * 9 + col + 1] else 0)
        return bits
    except Exception:
        return None


_STOP = {"com", "sem", "para", "numa", "num", "uma", "uns", "das", "dos", "que", "por", "entre", "sobre", "ao", "em", "no", "na", "de", "da", "do", "a", "o", "e"}


def _subject_words(text):
    words = re.findall(r"[a-zà-ÿ]{4,}", str(text or "").lower())
    return {re.sub(r"(os|as|a|o|s)$", "", w) for w in words if w not in _STOP}  # raiz aproximada: vazio/vazia, sentado/sentada


def _similar_subject(a, b):
    """Dois assuntos descritos de forma parecida (ex.: 'figura sentada em cadeira') contam como a mesma cena."""
    wa, wb = _subject_words(a), _subject_words(b)
    if not wa or not wb:
        return False
    return len(wa & wb) / min(len(wa), len(wb)) >= 0.5


def _near(a, b):
    return a is not None and b is not None and bin(a ^ b).count("1") <= HASH_NEAR


def _load_used():
    try:
        data = json.loads(USED_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}
    cutoff = time.time() - USED_TTL_DAYS * 86400
    return {k: v for k, v in data.items() if isinstance(v, dict) and v.get("ts", 0) >= cutoff}


def _remember(picks, carousel_id):
    """Guarda as imagens usadas (ID + impressão visual) para nunca repeti-las em outros carrosséis."""
    used = _load_used()
    now = time.time()
    for pin, h in picks:
        used[pin["pin_id"]] = {"ts": now, "hash": format(h, "x") if h is not None else "", "carousel": str(carousel_id or "")}
    try:
        USED_FILE.parent.mkdir(parents=True, exist_ok=True)
        USED_FILE.write_text(json.dumps(used, ensure_ascii=False), encoding="utf-8")
    except Exception:
        pass


def curate_images(slides, out_dir, payload, log, layout_uses_image, pool_cap=48, queries_cap=4):
    """Escolhe imagens do Pinterest para as lâminas com foto. Altera `slides` e devolve quantas foram curadas.

    Regras: nunca repete imagem (nem a mesma foto repostada com outro ID) dentro do carrossel nem em carrosséis
    anteriores; nunca recorre à IA — se faltar imagem boa, relaxa a nota e busca mais; o que ainda faltar é
    resolvido pelo pipeline (lâmina só com tipografia).
    """
    targets = [i for i, s in enumerate(slides)
               if layout_uses_image(s.get("layout", "fullbleed")) and not s.get("curated_image_path")]
    if not targets:
        return 0
    work = Path(out_dir) / "_curadoria"
    (work / "images").mkdir(parents=True, exist_ok=True)
    theme = payload.get("theme") or payload.get("title") or ""
    t0 = time.time()

    used = _load_used()
    used_hashes = [int(v["hash"], 16) for v in used.values() if v.get("hash")]
    boards = _boards_from(payload)
    floor = BOARD_MIN_SCORE if boards else MIN_SCORE
    relaxed = floor - RELAXED_DELTA
    seen = set(used)          # IDs já usados em outros carrosséis ou já avaliados nesta rodada
    scored = []               # (nota, caminho, pin, avaliação, hash)
    usage_total = {"input_tokens": 0, "output_tokens": 0}
    state = {"emotion": ""}

    def evaluate(raw_pins, prefilter):
        fresh = []
        for p in raw_pins:
            if p["pin_id"] not in seen:
                seen.add(p["pin_id"])
                fresh.append(p)
        pool = (_prefilter(fresh) if prefilter else fresh)[:(max(pool_cap, 60) if boards else pool_cap)]
        with ThreadPoolExecutor(max_workers=6) as ex:
            done = list(ex.map(lambda p: _download(p, work / "images" / f"{p['pin_id']}.jpg"), pool))
        pool = [p for p, ok in zip(pool, done) if ok]
        if boards:
            pool = [p for p in pool if _usable_for_cover(work / "images" / f"{p['pin_id']}.jpg")]
        candidates, hashes = [], [item[4] for item in scored]
        for p in pool:
            path = work / "images" / f"{p['pin_id']}.jpg"
            h = _dhash(path)
            if any(_near(h, other) for other in used_hashes + hashes):
                continue  # mesma foto já usada antes (ou repetida dentro desta busca)
            hashes.append(h)
            candidates.append((p, path, h))
        log(f"  {len(fresh)} pins novos → {len(candidates)} candidatas inéditas; ranqueando por visão…")
        if not candidates:
            return
        paths = [path for _, path, _ in candidates]
        context = f"Tema: {theme}. Estado emocional: {state['emotion'] or 'inferir das lâminas'}. Capa: {_plain(slides[0].get('title'))}."
        ranked, usage = vision_rank.rank(paths, ANCHOR, context=context)
        for key in usage_total:
            usage_total[key] += int(usage.get(key, 0))
        for p, path, h in candidates:
            r = ranked.get(str(path))
            if not r or r.get("eliminar"):
                continue
            total = r["bella"] * 0.35 + r["emocao"] * 0.35 + r["estetica"] * 0.30
            if r.get("espaco_limpo") not in ("topo", "base", "esquerda", "direita"):
                total -= 2
            if r.get("rosto") == "identificavel":
                total -= 3
            total += _room_for_type(path)
            scored.append((round(total, 2), path, p, r, h))
        scored.sort(key=lambda x: -x[0])

    def search(queries):
        from .pinterest_playwright import search_pins  # só a busca precisa do navegador (Playwright)
        raw = {}
        for q in queries:
            try:
                found, diag = search_pins(q, scrolls=1)
            except Exception as exc:
                log(f"  consulta '{q}' falhou: {str(exc)[:80]}")
                continue
            for p in found:
                raw.setdefault(p.pin_id, dict(p.__dict__))
            log(f"  '{q}': {len(found)} pins" + (f" (parou: {diag['stopped']})" if diag.get("stopped") else ""))
            time.sleep(6)
        return list(raw.values())

    queries = []
    if boards:
        log(f"Curadoria nas pastas do usuário: {len(targets)} lâmina(s) com foto · {len(boards)} pasta(s)")
        raw = {}
        for url in boards:
            try:
                name, found = fetch_board(url)
            except Exception as exc:
                log(f"  pasta {url}: {str(exc)[:100]}")
                continue
            for p in found:
                raw.setdefault(p["pin_id"], p)
            log(f"  pasta '{name}': {len(found)} pins")
        evaluate(list(raw.values()), False)
    else:
        queries, state["emotion"] = plan_queries(slides, theme, log)
        log(f"Curadoria Pinterest: {len(targets)} lâmina(s) com foto · consultas: {' | '.join(queries[:queries_cap])}"
            + (f" · {len(used)} imagens já usadas serão ignoradas" if used else ""))
        evaluate(search(queries[:queries_cap]), True)

    assignments, taken, used_zones, chosen_hashes, chosen_subjects = {}, set(), [], [], []

    def assign(min_score):
        for i in targets:
            if i in assignments:
                continue
            free = [it for it in scored if it[1] not in taken and it[0] >= min_score
                    and not any(_near(it[4], h) for h in chosen_hashes)]
            if not free:
                continue
            # cenas diferentes: só repete o assunto (ex.: duas figuras numa cadeira) se não houver outra opção
            varied = [it for it in free if not any(_similar_subject(it[3].get("assunto"), s) for s in chosen_subjects)]
            free = varied or free
            # a variedade de zona só decide entre imagens boas; nunca passa na frente da qualidade
            pick = next((it for it in free if it[3].get("espaco_limpo") not in used_zones and it[0] >= free[0][0] - 1.0), None) or free[0]
            assignments[i] = pick
            taken.add(pick[1])
            chosen_hashes.append(pick[4])
            chosen_subjects.append(pick[3].get("assunto"))
            used_zones.append(pick[3].get("espaco_limpo"))

    assign(floor)
    if len(assignments) < len(targets) and not boards:
        extra = [q for q in FALLBACK_QUERIES if q not in queries][:queries_cap]
        log(f"  faltam {len(targets) - len(assignments)} imagem(ns) boas; buscando mais no Pinterest ({len(extra)} consultas extras)…")
        evaluate(search(extra), True)
        assign(floor)
    assign(relaxed)

    if scored:
        (work / "ranking.json").write_text(json.dumps(
            [{"total": t, "pin_id": p["pin_id"], "pin_url": p["pin_url"], **r} for t, _, p, r, _ in scored],
            ensure_ascii=False, indent=1), encoding="utf-8")

    for i in targets:
        pick = assignments.get(i)
        num = slides[i].get("num", str(i + 1).zfill(2))
        if not pick:
            log(f"  S{num}: sem imagem inédita e boa o bastante no Pinterest; a lâmina ficará só com tipografia (sem IA).")
            continue
        total, path, pin, r, _ = pick
        dest = Path(out_dir) / f"curada-{num}.jpg"
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
        slides[i]["image_source"] = {"origem": "pasta_pinterest" if boards else "pinterest", "pin_id": pin["pin_id"], "pin_url": pin["pin_url"],
                                     "nota": total, "estado_emocional": r.get("estado_emocional"),
                                     "motivo": r.get("motivo"), "consulta": pin.get("query")}
        log(f"  S{num}: nota {total}{' (aceita pelo critério flexível)' if total < floor else ''} · {r.get('estado_emocional')} · espaço {zone}")

    _remember([(assignments[i][2], assignments[i][4]) for i in assignments], payload.get("id"))
    log(f"Curadoria concluída em {round(time.time() - t0)}s ({len(assignments)} de {len(targets)} imagem(ns); visão: {usage_total['input_tokens']}+{usage_total['output_tokens']} tokens).")
    return len(assignments)
