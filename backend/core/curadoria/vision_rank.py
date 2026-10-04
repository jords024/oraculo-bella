"""Ranking por visão das candidatas de imagem (Fase 0 da curadoria).

Cada lote vai ao modelo de visão em baixo detalhe junto de uma imagem-âncora (o ideal da Bella).
A rubrica elimina texto, marca d'água, mosaico, clichê esotérico e rosto identificável, e dá nota
de emoção, estética e adequação à Bella.
"""

import base64
import io
import json
import os
import urllib.request
from pathlib import Path

from PIL import Image

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[2] / ".env")
except ImportError:
    pass

RESPONSES_URL = "https://api.openai.com/v1/responses"

RUBRIC = """Você é o curador visual de Isabella Dalcin (Academia Sete). A estética da Bella é sensível, sacerdotal, espiritualista e psicodélica no sentido de metamorfose da realidade: figura humana pequena ou em silhueta, luz simbólica (halo, sol, feixe, brilho), grande espaço vazio atmosférico, cores quentes (terracota, âmbar, areia, cacau, musgo) ou azuis profundos, grão analógico, composição limpa e silenciosa. A PRIMEIRA imagem recebida é a REFERÊNCIA IDEAL (silhueta com halo de sol num campo laranja); não a avalie.

Para cada imagem numerada, responda os campos abaixo. Elimine (eliminar=true) se houver: texto ou letras legíveis na imagem, marca d'água ou logo, mosaico/colagem de várias imagens, captura de tela, infográfico ou diagrama, produto ou ambiente decorativo (velas, lâmpada de sal, estante), clichê esotérico (mapa de chakra, lótus, Buda, símbolo Om, cristais, pose de meditação de ioga), rosto de pessoa real claramente identificável em primeiro plano.

Notas de 0 a 10: estetica (qualidade visual, composição, grão, luz), bella (aderência à estética descrita e à referência), emocao (força de evocar um estado emocional, mesmo que sutil). "espaco_limpo": onde há área calma para tipografia (esquerda, direita, topo, base, nenhuma). "rosto": identificavel | silhueta | sem_pessoa. "estado_emocional": 1 a 3 palavras do que a imagem faz sentir. "motivo": uma frase curta em português.
Responda apenas JSON válido: {"itens":[{"i":1,"eliminar":false,"motivo_eliminacao":"","estetica":0,"bella":0,"emocao":0,"espaco_limpo":"","rosto":"","meio":"fotografia|pintura|ilustração|arte digital|colagem|3D","estado_emocional":"","motivo":""}]}"""


def _key():
    return os.environ["OPENAI_API_KEY"]


def _data_uri(path, max_side=512, quality=80):
    im = Image.open(path).convert("RGB")
    im.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def _call(content, model="gpt-5.6-terra", effort="low"):
    body = {"model": model, "reasoning": {"effort": effort}, "max_output_tokens": 4000,
            "instructions": RUBRIC, "input": [{"role": "user", "content": content}]}
    req = urllib.request.Request(RESPONSES_URL, data=json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + _key(), "Content-Type": "application/json"})
    data = json.load(urllib.request.urlopen(req, timeout=180))
    text = data.get("output_text") or "".join(c.get("text", "") for o in data.get("output", []) for c in o.get("content", []) if isinstance(c, dict))
    return text, data.get("usage", {})


def rank(paths, anchor, batch=6, model="gpt-5.6-terra", on_batch=None, context=""):
    results, usage_total = {}, {"input_tokens": 0, "output_tokens": 0}
    anchor_uri = _data_uri(anchor) if anchor and Path(anchor).exists() else None
    for start in range(0, len(paths), batch):
        group = paths[start:start + batch]
        content = []
        if context:
            content.append({"type": "input_text", "text": "CONTEXTO DO CARROSSEL (a nota de emoção mede o quanto a imagem evoca este estado): " + context})
        if anchor_uri:
            content += [{"type": "input_text", "text": "REFERÊNCIA IDEAL (não avaliar):"},
                        {"type": "input_image", "image_url": anchor_uri, "detail": "low"}]
        for n, p in enumerate(group, 1):
            content += [{"type": "input_text", "text": f"Imagem {n}:"},
                        {"type": "input_image", "image_url": _data_uri(p), "detail": "low"}]
        text, usage = _call(content, model=model)
        for k in usage_total:
            usage_total[k] += int(usage.get(k, 0))
        raw = text.strip().removeprefix("```json").removesuffix("```").strip()
        try:
            items = json.loads(raw[raw.index("{"):raw.rindex("}") + 1])["itens"]
        except Exception:
            items = []
        for item in items:
            i = int(item.get("i", 0)) - 1
            if 0 <= i < len(group):
                results[str(group[i])] = item
        if on_batch:
            on_batch(start + len(group), len(paths))
    return results, usage_total
