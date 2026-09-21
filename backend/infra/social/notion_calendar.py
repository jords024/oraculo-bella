#!/usr/bin/env python3
"""
notion_calendar.py — Cliente do Calendário Editorial no Notion
Lê e escreve no banco "Calendário Editorial — Fonte Oculta"

Data Source ID: c595263c-1c98-4b18-abd2-445bb3630661
"""
import json
import os
import urllib.error
import urllib.request
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

# ── CONSTRUTORES DE BLOCOS NOTION ─────────────────────────────────────────────
def _rt(text, bold=False, color="default"):
    """Rich text object."""
    ann = {"bold": bold, "color": color}
    return {"type": "text", "text": {"content": str(text)[:2000]}, "annotations": ann}

def _h1(text):
    return {"object":"block","type":"heading_1",
            "heading_1":{"rich_text":[_rt(text, bold=True)],"color":"default"}}

def _h2(text):
    return {"object":"block","type":"heading_2",
            "heading_2":{"rich_text":[_rt(text)]}}

def _h3(text, color="default"):
    return {"object":"block","type":"heading_3",
            "heading_3":{"rich_text":[_rt(text, bold=True)],"color":color}}

def _para(text, bold=False):
    if not text:
        return {"object":"block","type":"paragraph","paragraph":{"rich_text":[]}}
    return {"object":"block","type":"paragraph",
            "paragraph":{"rich_text":[_rt(text, bold=bold)]}}

def _callout(text, emoji="📌", color="gray_background"):
    return {"object":"block","type":"callout",
            "callout":{"icon":{"type":"emoji","emoji":emoji},
                       "rich_text":[_rt(text)],
                       "color": color}}

def _quote(text):
    return {"object":"block","type":"quote",
            "quote":{"rich_text":[_rt(str(text)[:2000])]}}

def _divider():
    return {"object":"block","type":"divider","divider":{}}

def _toggle(title, children):
    return {
        "object": "block", "type": "toggle",
        "toggle": {
            "rich_text": [_rt(title, bold=True)],
            "children": children,
        }
    }

def _bullet(text):
    return {"object":"block","type":"bulleted_list_item",
            "bulleted_list_item":{"rich_text":[_rt(text)]}}

ETAPAS_B = [
    "Paradoxo / Gancho",
    "Validação",
    "Nomeação",
    "Evidência Científica",
    "Mecanismo Profundo",
    "Identificação Tribal",
    "Reconstrução / Esperança",
    "Cristalização + CTA",
]
ETAPAS_D = [
    "Gancho Histórico",
    "O Contexto",
    "A Revelação",
    "A Evidência",
    "Consequência Invisível",
    "Conexão com Hoje",
    "A Virada",
    "Cristalização + CTA",
]
ETAPAS_A = [
    "Tese Central",
    "Evidência 1",
    "Evidência 2",
    "O Mecanismo",
    "O Que Todos Erram",
    "Tradução Prática",
    "Implicação Real",
    "Cristalização + CTA",
]
ETAPAS_C = [
    "Gancho da Lista",
    "Item 1",
    "Item 2",
    "Item 3",
    "Item 4",
    "Item 5",
    "A Síntese",
    "Cristalização + CTA",
]

ETAPAS_MAP = {"B": ETAPAS_B, "D": ETAPAS_D, "A": ETAPAS_A, "C": ETAPAS_C}

FORMATO_DESC = {
    "B": "Demolição + Reconstrução — Destrói uma crença dominante com evidência irrefutável. Valida a dor, nomeia o problema real, expõe o mecanismo científico, reconstrói identidade baseada em biologia e não em falha de caráter.",
    "D": "História + Verdade — Abre com gancho narrativo/histórico, revela a evidência suprimida ou mal compreendida, conecta ao presente, culmina em cristalização inevitável.",
    "A": "Tese + Tradução — Apresenta uma tese científica central, sustenta com 2 evidências verificáveis, explica o mecanismo profundo, traduz para implicação prática imediata.",
    "C": "Lista Revelação — 5 itens que ninguém organizou assim antes. Cada item é uma mini-demolição. A síntese no S07 é o choque final.",
}

def _construir_blocos_pagina(
    big_idea: str,
    formato_letra: str,
    arco_descricao: str,
    slides: list,
    caption: str,
    refs: str = "",
) -> list:
    """
    Constrói a lista de blocos Notion para o corpo de uma página de carrossel.
    slides = [{"titulo": str, "body": str}, ...]  — 8 slides
    """
    etapas   = ETAPAS_MAP.get(formato_letra, ETAPAS_B)
    fmt_desc = FORMATO_DESC.get(formato_letra, "")
    blocos   = []

    # ── CABEÇALHO ────────────────────────────────────────────────────────────
    blocos.append(_callout(f"🎯  BIG IDEA: {big_idea}", "🎯", "yellow_background"))
    blocos.append(_callout(
        f"📋  FORMATO {formato_letra} — {fmt_desc}\n\n{arco_descricao}",
        "📋", "blue_background"
    ))
    blocos.append(_divider())

    # ── ARCO DRAMÁTICO ────────────────────────────────────────────────────────
    blocos.append(_h2("ARCO DRAMÁTICO — 8 SLIDES"))

    for i, slide in enumerate(slides[:8]):
        etapa  = etapas[i] if i < len(etapas) else f"Slide {i+1}"
        num    = f"{i+1:02d}"
        titulo = slide.get("titulo", "")
        body   = slide.get("body", "")

        # Toggle: "Slide 01 — Paradoxo / Gancho"
        slide_blocos = []
        slide_blocos.append(_callout(f"💬  {titulo}", "💬", "gray_background"))
        # Quebra body em parágrafos por \n\n
        paragrafos = body.split("\n\n")
        for p in paragrafos:
            p = p.strip()
            if p:
                slide_blocos.append(_para(p))

        blocos.append(_toggle(f"Slide {num} — {etapa}", slide_blocos))

    blocos.append(_divider())

    # ── CAPTION ───────────────────────────────────────────────────────────────
    blocos.append(_h2("CAPTION INSTAGRAM"))
    # Caption pode ter >2000 chars — quebrar em blocos de 2000
    cap = caption
    while cap:
        chunk = cap[:1999]
        blocos.append(_quote(chunk))
        cap = cap[1999:]

    # ── REFERÊNCIAS ───────────────────────────────────────────────────────────
    if refs:
        blocos.append(_divider())
        blocos.append(_h2("REFERÊNCIAS CIENTÍFICAS"))
        for linha in refs.strip().split("\n"):
            if linha.strip():
                blocos.append(_bullet(linha.strip()))

    return blocos

NOTION_TOKEN   = os.getenv("NOTION_TOKEN")
DS_ID          = "c595263c-1c98-4b18-abd2-445bb3630661"
NOTION_VERSION = "2022-06-28"
BASE_URL       = "https://api.notion.com/v1"

def _headers():
    return {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }

def _req(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    req  = urllib.request.Request(
        f"{BASE_URL}{path}", data=data,
        headers=_headers(), method=method
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Notion {method} {path} → {e.code}: {e.read().decode()[:300]}")

# ── CRIAR ENTRADA NO CALENDÁRIO ───────────────────────────────────────────────
def criar_slot(
    data: str,          # "2026-04-09"
    horario: str,       # "09h00"
    praca: str,         # "MENTE"
    formato: str,       # "B - Demolição+Reconstrução"
    carousel_id: str = "",
    slides_dir: str = "",
    caption: str = "",
    status: str = "Planejado",
):
    dia_fmt = datetime.strptime(data, "%Y-%m-%d").strftime("%d/%m")
    titulo  = f"FO | {praca} | {horario} | {dia_fmt}"

    props = {
        "Post":     {"title": [{"text": {"content": titulo}}]},
        "Status":   {"select": {"name": status}},
        "Data":     {"date": {"start": data}},
        "Horário":  {"select": {"name": horario}},
        "Praça":    {"select": {"name": praca}},
        "Formato":  {"select": {"name": formato}},
    }
    if carousel_id:
        props["Carousel ID"] = {"rich_text": [{"text": {"content": carousel_id}}]}
    if slides_dir:
        props["Slides Dir"]  = {"rich_text": [{"text": {"content": slides_dir}}]}
    if caption:
        props["Caption"]     = {"rich_text": [{"text": {"content": caption[:2000]}}]}

    body = {
        "parent": {"database_id": DS_ID},
        "properties": props,
    }
    return _req("POST", "/pages", body)

# ── CRIAR PÁGINA COMPLETA COM CORPO (ARCO + SLIDES + CAPTION) ────────────────
def criar_pagina_completa(
    data: str,
    horario: str,
    praca: str,
    formato: str,           # "B - Demolição+Reconstrução" (full name)
    titulo_editorial: str,  # ex: "Você não tem problema de disciplina"
    big_idea: str,
    arco_descricao: str,    # 1-2 linhas descrevendo o ângulo específico deste carrossel
    slides: list,           # [{"titulo": str, "body": str}] × 8
    caption: str,
    refs: str = "",         # referências científicas (uma por linha)
    carousel_id: str = "",
    slides_dir: str = "",
    status: str = "Planejado",
):
    """
    Cria uma página Notion com corpo completo:
    - Properties do calendário
    - Callout Big Idea + Formato
    - 8 Slides em toggles (etapa + título + body)
    - Caption completa em quote
    - Referências científicas em bullets
    """
    dia_fmt      = datetime.strptime(data, "%Y-%m-%d").strftime("%d/%m")
    formato_letra = formato.split(" - ")[0].strip() if " - " in formato else formato[:1]
    titulo_pagina = f"FO | {praca} | {horario} | {dia_fmt} — {titulo_editorial}"

    props = {
        "Post":    {"title": [{"text": {"content": titulo_pagina[:200]}}]},
        "Status":  {"select": {"name": status}},
        "Data":    {"date": {"start": data}},
        "Horário": {"select": {"name": horario}},
        "Praça":   {"select": {"name": praca}},
        "Formato": {"select": {"name": formato}},
    }
    if carousel_id:
        props["Carousel ID"] = {"rich_text": [{"text": {"content": carousel_id}}]}
    if slides_dir:
        props["Slides Dir"]  = {"rich_text": [{"text": {"content": slides_dir}}]}
    if caption:
        props["Caption"]     = {"rich_text": [{"text": {"content": caption[:2000]}}]}

    children = _construir_blocos_pagina(
        big_idea       = big_idea,
        formato_letra  = formato_letra,
        arco_descricao = arco_descricao,
        slides         = slides,
        caption        = caption,
        refs           = refs,
    )

    body = {
        "parent":     {"database_id": DS_ID},
        "properties": props,
        "children":   children,
    }
    return _req("POST", "/pages", body)

# ── LER SLOTS DO DIA ──────────────────────────────────────────────────────────
def slots_do_dia(data: str):
    """Retorna os 3 slots de um dia específico com status Pronto ou Planejado."""
    body = {
        "filter": {
            "and": [
                {"property": "Data", "date": {"equals": data}},
                {"property": "Status", "select": {"does_not_equal": "Publicado"}},
            ]
        },
        "sorts": [{"property": "Horário", "direction": "ascending"}],
    }
    result = _req("POST", f"/databases/{DS_ID}/query", body)
    return result.get("results", [])

# ── LER PRÓXIMO SLOT A PUBLICAR ───────────────────────────────────────────────
def proximo_slot_pronto(data: str, horario: str):
    """Retorna o slot 'Pronto' para um data+horário específico."""
    body = {
        "filter": {
            "and": [
                {"property": "Data",    "date":   {"equals": data}},
                {"property": "Horário", "select": {"equals": horario}},
                {"property": "Status",  "select": {"equals": "Pronto"}},
            ]
        }
    }
    result = _req("POST", f"/databases/{DS_ID}/query", body)
    pages  = result.get("results", [])
    return pages[0] if pages else None

# ── ATUALIZAR STATUS ──────────────────────────────────────────────────────────
def atualizar_status(page_id: str, status: str, media_id: str = ""):
    props = {"Status": {"select": {"name": status}}}
    if status == "Publicado":
        props["Publicado Em"] = {"date": {"start": datetime.now().strftime("%Y-%m-%dT%H:%M:%S")}}
    if media_id:
        props["Instagram Media ID"] = {"rich_text": [{"text": {"content": media_id}}]}
    _req("PATCH", f"/pages/{page_id}", {"properties": props})

# ── MARCAR COMO PRONTO ────────────────────────────────────────────────────────
def marcar_pronto(page_id: str, carousel_id: str, slides_dir: str, caption: str):
    props = {
        "Status":      {"select": {"name": "Pronto"}},
        "Carousel ID": {"rich_text": [{"text": {"content": carousel_id}}]},
        "Slides Dir":  {"rich_text": [{"text": {"content": slides_dir}}]},
        "Caption":     {"rich_text": [{"text": {"content": caption[:2000]}}]},
    }
    _req("PATCH", f"/pages/{page_id}", {"properties": props})

# ── LISTAR SLOTS SEM CONTEÚDO ─────────────────────────────────────────────────
def slots_planejados(limite: int = 10):
    body = {
        "filter": {"property": "Status", "select": {"equals": "Planejado"}},
        "sorts":  [{"property": "Data", "direction": "ascending"}],
        "page_size": limite,
    }
    result = _req("POST", f"/databases/{DS_ID}/query", body)
    return result.get("results", [])

def extrair_props(page: dict) -> dict:
    """Extrai as propriedades de uma página Notion em dict simples."""
    p = page.get("properties", {})
    def txt(field):
        arr = p.get(field, {}).get("rich_text", [])
        return arr[0]["text"]["content"] if arr else ""
    def sel(field):
        s = p.get(field, {}).get("select")
        return s["name"] if s else ""
    def dt(field):
        d = p.get(field, {}).get("date")
        return d["start"] if d else ""
    def tit():
        arr = p.get("Post", {}).get("title", [])
        return arr[0]["text"]["content"] if arr else ""

    return {
        "page_id":    page["id"],
        "titulo":     tit(),
        "status":     sel("Status"),
        "data":       dt("Data"),
        "horario":    sel("Horário"),
        "praca":      sel("Praça"),
        "formato":    sel("Formato"),
        "carousel_id": txt("Carousel ID"),
        "slides_dir": txt("Slides Dir"),
        "caption":    txt("Caption"),
    }
