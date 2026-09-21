"""Seleciona memória visual por afinidade funcional, sem fixar números de slides a templates."""

import json
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[2]
REFERENCE_ROOT = BACKEND_ROOT / "config" / "visual-references"
MANIFEST_PATH = REFERENCE_ROOT / "manifest.json"


def load_manifest():
    try:
        return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {"references": []}


def select_reference(slide):
    """A referência orienta linguagem, ritmo e matéria; nunca conteúdo ou identidade."""
    plan = slide.get("visual_plan") if isinstance(slide.get("visual_plan"), dict) else {}
    layout = str(slide.get("layout") or plan.get("layout") or "")
    role = str(plan.get("visual_role") or slide.get("estado") or "").lower()
    treatment = str(plan.get("photo_treatment") or "")
    candidates = []
    for order, reference in enumerate(load_manifest().get("references", [])):
        score = 0
        if layout in reference.get("layouts", []): score += 5
        if treatment in reference.get("photo_treatments", []): score += 4
        roles = [str(item).lower() for item in reference.get("visual_roles", [])]
        if role in roles: score += 3
        else: score += sum(1 for item in roles if item and item in role)
        asset = REFERENCE_ROOT / str(reference.get("photographic_crop") or "")
        if asset.exists(): candidates.append((score, -order, asset, reference.get("id", "")))
    if not candidates: return None, None
    _, _, path, reference_id = max(candidates, key=lambda item: (item[0], item[1]))
    return path, reference_id
