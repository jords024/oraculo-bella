"""Coletor Pinterest (provedor Playwright) — Fase 0 da curadoria de imagens.

Abre a busca, lê o JSON que a própria página carrega, descarta anúncios e vídeos e devolve
candidatas normalizadas. Ritmo baixo; se surgir muro de login ou CAPTCHA o coletor PARA e
avisa — nunca tenta contornar.
"""

import json
import re
import time
import urllib.parse
from dataclasses import dataclass, asdict, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_ROOT = ROOT / "storage" / "curadoria"


@dataclass
class PinCandidate:
    pin_id: str
    pin_url: str
    image_url_original: str
    image_url_small: str
    width: int
    height: int
    title: str = ""
    description: str = ""
    source_link: str = ""
    domain: str = ""
    promoted: bool = False
    is_video: bool = False
    query: str = ""
    extra: dict = field(default_factory=dict)


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60] or "consulta"


def _original_from(url):
    """Troca o tamanho no caminho da imagem (236x, 474x, 736x…) por 'originals'."""
    return re.sub(r"pinimg\.com/\d+x/", "pinimg.com/originals/", url or "")


def _pin_from_result(item, query):
    if not isinstance(item, dict) or not item.get("id"):
        return None
    images = item.get("images") or {}
    orig = images.get("orig") or {}
    small = images.get("736x") or images.get("474x") or images.get("236x") or {}
    url_small = small.get("url") or orig.get("url") or ""
    if not (orig.get("url") or url_small):
        return None
    return PinCandidate(
        pin_id=str(item["id"]),
        pin_url=f"https://www.pinterest.com/pin/{item['id']}/",
        image_url_original=orig.get("url") or _original_from(url_small),
        image_url_small=url_small,
        width=int(orig.get("width") or small.get("width") or 0),
        height=int(orig.get("height") or small.get("height") or 0),
        title=(item.get("grid_title") or item.get("title") or "").strip(),
        description=(item.get("description") or "").strip()[:300],
        source_link=item.get("link") or "",
        domain=item.get("domain") or "",
        promoted=bool(item.get("is_promoted") or item.get("promoter") or item.get("ad_destination_url")),
        is_video=bool(item.get("videos") or item.get("is_video") or item.get("story_pin_data")),
        query=query,
        extra={"type": item.get("type"), "is_downstream_promotion": item.get("is_downstream_promotion")},
    )


def _walk_results(node, query, found):
    """Percorre o JSON de resposta procurando objetos de pin."""
    if isinstance(node, dict):
        if node.get("type") == "pin" or ("images" in node and "id" in node):
            pin = _pin_from_result(node, query)
            if pin:
                found[pin.pin_id] = pin
        for value in node.values():
            _walk_results(value, query, found)
    elif isinstance(node, list):
        for value in node:
            _walk_results(value, query, found)


class LoginWall(Exception):
    pass


def search_pins(query, *, scrolls=6, pause=2.8, headless=True, lang="pt-BR", host="br.pinterest.com"):
    """Retorna (candidatas, diagnostico)."""
    from playwright.sync_api import sync_playwright

    found = {}
    diag = {"query": query, "responses_json": 0, "stopped": None, "scrolls_done": 0, "final_url": None}

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=headless)
        context = browser.new_context(locale=lang, viewport={"width": 1440, "height": 1000})
        page = context.new_page()

        def on_response(resp):
            try:
                if "resource/" in resp.url and "Search" in resp.url and resp.status == 200:
                    data = resp.json()
                    diag["responses_json"] += 1
                    _walk_results(data, query, found)
            except Exception:
                pass

        page.on("response", on_response)
        url = f"https://{host}/search/pins/?q={urllib.parse.quote(query)}&rs=typed"
        page.goto(url, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(4000)

        def blocked():
            text = ""
            try:
                text = page.inner_text("body", timeout=2000).lower()
            except Exception:
                pass
            if "captcha" in text or "unusual traffic" in text:
                return "captcha"
            if page.locator('[data-test-id="login-modal"], [data-test-id="signup-modal"], div[role="dialog"]:has-text("Entrar"), div[role="dialog"]:has-text("Log in")').count():
                return "login_wall"
            return None

        for step in range(scrolls):
            reason = blocked()
            if reason:
                diag["stopped"] = reason
                break
            page.mouse.wheel(0, 2400)
            page.wait_for_timeout(int(pause * 1000))
            diag["scrolls_done"] = step + 1

        # Plano B: se a página não expôs o JSON, lê as <img> renderizadas.
        if not found:
            for src in page.eval_on_selector_all('img[src*="pinimg.com"]', "els => els.map(e => [e.src, e.naturalWidth, e.naturalHeight, e.alt])"):
                m = re.search(r"pinimg\.com/\w+/([0-9a-f]{2}/[0-9a-f]{2}/[0-9a-f]{2}/[0-9a-f]+)", src[0])
                pid = m.group(1) if m else src[0]
                found[pid] = PinCandidate(pin_id=pid, pin_url="", image_url_original=_original_from(src[0]), image_url_small=src[0],
                                          width=int(src[1]), height=int(src[2]), title=src[3] or "", query=query, extra={"via": "dom"})
            diag["dom_fallback"] = True

        diag["final_url"] = page.url
        browser.close()

    return list(found.values()), diag


def save_run(query, pins, diag, folder=None):
    folder = Path(folder) if folder else OUT_ROOT / "spike" / slug(query)
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "pins.json").write_text(json.dumps({"diag": diag, "pins": [asdict(p) for p in pins]}, ensure_ascii=False, indent=1), encoding="utf-8")
    return folder


if __name__ == "__main__":
    import sys
    q = sys.argv[1] if len(sys.argv) > 1 else "spiritual aesthetic"
    pins, diag = search_pins(q, scrolls=int(sys.argv[2]) if len(sys.argv) > 2 else 6)
    folder = save_run(q, pins, diag)
    ok = [p for p in pins if not p.promoted and not p.is_video]
    print(json.dumps(diag, ensure_ascii=False))
    print(f"pins: {len(pins)} | sem anúncio/vídeo: {len(ok)} | salvo em {folder}")
