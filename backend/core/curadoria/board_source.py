"""Fonte "Minhas pastas": lê as imagens de pastas (boards) PÚBLICAS do Pinterest do próprio usuário.

Usa o RSS público da pasta (https://www.pinterest.com/<usuário>/<pasta>.rss): HTTP simples, sem login,
sem navegador e sem senha. Devolve até ~25 pins mais recentes por pasta, no mesmo formato dos pins da busca.
"""

import html
import re
import urllib.request
from xml.etree import ElementTree

UA = "Mozilla/5.0"


def board_rss_url(board_url):
    """Aceita o endereço da pasta (com ou sem .rss, qualquer subdomínio de idioma) e devolve o RSS canônico."""
    m = re.search(r"pinterest\.[a-z.]+/([^/?#]+)/([^/?#]+)", str(board_url or ""))
    if not m or m.group(1) in ("pin", "search", "ideas"):
        raise ValueError("endereço de pasta inválido")
    user, slug = m.group(1), re.sub(r"\.rss$", "", m.group(2))
    return f"https://www.pinterest.com/{user}/{slug}.rss"


def fetch_board(board_url, timeout=25):
    """Retorna (nome_da_pasta, pins). Levanta ValueError se a pasta não for pública/existir."""
    try:
        raw = urllib.request.urlopen(urllib.request.Request(board_rss_url(board_url), headers={"User-Agent": UA}), timeout=timeout).read()
    except Exception as exc:
        raise ValueError(f"pasta indisponível (privada ou inexistente): {str(exc)[:80]}")
    root = ElementTree.fromstring(raw)
    channel = root.find("channel")
    name = html.unescape((channel.findtext("title") or "").strip()) if channel is not None else ""
    pins = []
    for item in root.iter("item"):
        link = (item.findtext("link") or "").strip()
        desc = html.unescape(item.findtext("description") or "")
        img = re.search(r'src="(https://i\.pinimg\.com/[^"]+)"', desc)
        pin_id = re.search(r"/pin/(\d+)", link)
        if not (img and pin_id):
            continue
        small = img.group(1)
        pins.append({
            "pin_id": pin_id.group(1),
            "pin_url": link,
            "image_url_small": small,
            "image_url_original": re.sub(r"pinimg\.com/\d+x/", "pinimg.com/originals/", small),
            "width": 0, "height": 0,  # o RSS não informa; o tamanho real é medido depois do download
            "title": html.unescape(item.findtext("title") or "").strip()[:200],
            "promoted": False, "is_video": False, "query": f"pasta:{name}",
        })
    return name, pins
