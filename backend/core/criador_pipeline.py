#!/usr/bin/env python3
"""
criador_pipeline.py — Runner genérico de carrossel a partir do output do Criador.

USO:
    python core/criador_pipeline.py --data '{"title":...,"slides":[...]}'

Saída (JSON lines para stdout):
    {"type":"start",  "total":10, "title":"..."}
    {"type":"slide",  "num":1, "total":10, "estado":"DISRUPÇÃO", "status":"gerando"}
    {"type":"slide",  "num":1, "total":10, "estado":"DISRUPÇÃO", "status":"ok", "file":"..."}
    {"type":"slide",  "num":1, "total":10, "estado":"DISRUPÇÃO", "status":"erro", "msg":"..."}
    {"type":"done",   "id":"carrossel-46", "slides_dir":"...", "total_ok":9}
    {"type":"error",  "msg":"..."}

Em produção (Linux/Render):
    - Salva em /tmp/carrossel-{slug}/
    - NÃO chama register() — o Node.js faz o registro no B2
    - O Node.js lê os arquivos de /tmp/ e faz upload para B2
"""

import argparse
import importlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

# ── Garante que a raiz do projeto está no sys.path ────────────────────────────
ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

# ── python_packages/ (instalado via pip --target no Render) ──────────────────
VENDOR = ROOT / "python_packages"
if VENDOR.exists() and str(VENDOR) not in sys.path:
    sys.path.insert(0, str(VENDOR))

# ── Auto-instala dependências se ainda não estiverem disponíveis ──────────────
def _ensure(pkg: str, import_as: str | None = None) -> None:
    """Instala `pkg` se o módulo `import_as` não for importável."""
    mod = import_as or pkg.split("[")[0].replace("-", "_")
    try:
        importlib.import_module(mod)
    except ImportError:
        print(json.dumps({"type": "log", "msg": f"⚙ Instalando {pkg}..."}), flush=True)
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "--quiet",
             "--target", str(VENDOR), pkg],
            check=True, capture_output=True
        )
        importlib.invalidate_caches()
        if str(VENDOR) not in sys.path:
            sys.path.insert(0, str(VENDOR))

_ensure("openai")
_ensure("Pillow", "PIL")
_ensure("numpy")
_ensure("python-dotenv", "dotenv")

# ── Carrega .env localmente; no Render as variáveis já estão no ambiente ──────
try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
except ImportError:
    pass

IS_WIN = sys.platform == "win32"

# ── Imports do pipeline ───────────────────────────────────────────────────────
try:
    from core.util.compose_util import compose
    from core.util.gen_image_openai import gen_openai as gen
    from core.util.prompt_builder import build_prompt
    from core.util.deck_director import direct_deck, layout_uses_generated_image
    from core.util.visual_reference_registry import select_reference
except ImportError as e:
    print(json.dumps({"type": "error", "msg": f"Import error: {e}"}), flush=True)
    sys.exit(1)

# Registro só no Windows (local); no Linux o Node.js cuida via B2
if IS_WIN:
    try:
        from core.agentes.register_carousel import register
    except ImportError:
        register = None
else:
    register = None


def out(obj: dict):
    """Emite uma linha JSON para stdout (parseada pelo Node.js)."""
    print(json.dumps(obj, ensure_ascii=False), flush=True)


def slugify(text: str) -> str:
    import unicodedata
    text = text.lower().strip()
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text[:48].strip("-")


# Mesmas famílias que o Pillow já desenha (core/util/fonts.py), disponibilizadas no
# navegador via Google Fonts (ver frontend/index.html) para o Estúdio ficar fiel.
_FONT_FAMILY_CSS = {
    "serif": "'Playfair Display', Georgia, serif",
    "condensed": "'Oswald', Arial, sans-serif",
    "sans": "'Inter', Arial, sans-serif",
    "default": "'Inter', Arial, sans-serif",
}

_DESIGN_ELEMENT_NAMES = {
    "title": "Título", "body": "Texto", "watermark": "Assinatura",
    "shape": "Forma", "image": "Imagem", "texture": "Textura", "symbol": "Símbolo",
}


def build_editable_design(report: list, has_photo: bool, visual_plan: dict | None = None) -> dict:
    """Converte o relatório de blocos de texto (engine.py `report=[]`) no mesmo formato
    de documento em camadas que o Estúdio (frontend) já lê de `meta.design`
    (ver frontend/src/components/EditSlideModal/slideDocument.js `createSlideDocument`).
    Isso permite abrir o carrossel recém-gerado já como camadas editáveis, em vez de
    uma única imagem achatada.
    """
    def bounded(value, fallback, minimum, maximum):
        try:
            return max(minimum, min(maximum, float(value)))
        except (TypeError, ValueError):
            return fallback

    canvas_bg = next((item["color"] for item in report if item.get("role") == "canvas_background"), None)
    elements = []
    if canvas_bg:
        background_color = canvas_bg
    elif has_photo:
        background_color = "#2d241f"
        elements.append({
            "id": "background", "type": "image", "name": "Imagem de fundo",
            "x": 0, "y": 0, "width": 1080, "height": 1350,
            "rotation": 0, "opacity": 1, "locked": True, "visible": True, "fit": "cover",
        })
    else:
        background_color = "#2d241f"

    # O diretor pode pedir recortes fotográficos, matéria e formas como camadas
    # nativas. Nunca aceitamos "ícones" genéricos aqui: somente imagem crua,
    # textura e matéria editorial simples que continuem desmontáveis no Estúdio.
    native_layers = visual_plan.get("native_layers", []) if isinstance(visual_plan, dict) else []
    if isinstance(native_layers, list):
        for index, layer in enumerate(native_layers[:12]):
            if not isinstance(layer, dict):
                continue
            layer_type = str(layer.get("type", "")).lower()
            if layer_type not in {"image", "shape", "texture"}:
                continue
            common = {
                "id": f"directed-{layer_type}-{index + 1}",
                "type": layer_type,
                "name": str(layer.get("name") or "Matéria editorial")[:80],
                "x": bounded(layer.get("x"), 0, -1080, 2160),
                "y": bounded(layer.get("y"), 0, -1350, 2700),
                "width": bounded(layer.get("width"), 1080, 1, 2160),
                "height": bounded(layer.get("height"), 1350, 1, 2700),
                "rotation": bounded(layer.get("rotation"), 0, -180, 180),
                "opacity": bounded(layer.get("opacity"), 1, 0, 1),
                "locked": False, "visible": True,
            }
            if layer_type == "image" and has_photo:
                elements.append({**common, "src": "", "sourceRole": "raw", "fit": "cover",
                                 "focusX": bounded(layer.get("focusX"), 50, 0, 100),
                                 "focusY": bounded(layer.get("focusY"), 50, 0, 100),
                                 "radius": bounded(layer.get("radius"), 0, 0, 540),
                                 "aspectLocked": True, "flipX": False, "flipY": False})
            elif layer_type == "shape":
                elements.append({**common, "fill": str(layer.get("fill", "#b85b31"))[:40],
                                 "radius": bounded(layer.get("radius"), 0, 0, 999),
                                 "blur": bounded(layer.get("blur"), 0, 0, 80),
                                 "stroke": "", "strokeWidth": 0})
            elif layer_type == "texture":
                elements.append({**common, "textureKind": "paper-grain",
                                 "color": str(layer.get("color", "#30261f"))[:40],
                                 "intensity": bounded(layer.get("intensity"), .14, .02, .8),
                                 "blendMode": str(layer.get("blendMode", "multiply"))[:20], "seed": 17})

    seen = {}
    for item in report:
        role = item.get("role")
        if role == "canvas_background":
            continue
        seen[role] = seen.get(role, 0) + 1
        suffix = "" if seen[role] == 1 else f"-{seen[role]}"
        element_id = item.get("id") or f"{role}{suffix}"
        common = {
            "id": element_id,
            "name": item.get("name") or _DESIGN_ELEMENT_NAMES.get(role, role.capitalize() if role else "Elemento"),
            "x": item.get("x", 0), "y": item.get("y", 0),
            "width": item.get("width", 1), "height": item.get("height", 1),
            "rotation": item.get("rotation", 0), "opacity": item.get("opacity", 1),
            "locked": item.get("locked", False), "visible": item.get("visible", True),
        }
        if role == "shape":
            elements.append({
                **common, "type": "shape", "fill": item.get("fill", "transparent"),
                "radius": item.get("radius", 0), "blur": item.get("blur", 0),
                "stroke": item.get("stroke", ""), "strokeWidth": item.get("strokeWidth", 0),
                "gradient": item.get("gradient"),
            })
            continue
        if role == "image":
            elements.append({
                **common, "type": "image", "src": item.get("src", ""),
                "sourceRole": item.get("sourceRole", "raw"), "fit": item.get("fit", "cover"),
                "focusX": item.get("focusX", 50), "focusY": item.get("focusY", 50),
                "radius": item.get("radius", 0), "aspectLocked": item.get("aspectLocked", True),
                "flipX": False, "flipY": False,
            })
            continue
        if role == "texture":
            elements.append({
                **common, "type": "texture", "textureKind": item.get("textureKind", "paper-grain"),
                "color": item.get("color", "#30261f"), "intensity": item.get("intensity", 0.16),
                "blendMode": item.get("blendMode", "multiply"), "seed": item.get("seed", 17),
            })
            continue
        if role == "symbol":
            elements.append({
                **common, "type": "symbol", "symbolKind": item.get("symbolKind", "ruler"),
                "color": item.get("color", "#f4efe5"), "strokeWidth": item.get("strokeWidth", 4),
                "density": item.get("density", 9),
            })
            continue
        elements.append({
            **common, "type": "text",
            "content": item["content"],
            "fontFamily": _FONT_FAMILY_CSS.get(item.get("fontFamily"), _FONT_FAMILY_CSS["default"]),
            "fontSize": item["fontSize"], "fontWeight": item["fontWeight"], "fontStyle": item["fontStyle"],
            "lineHeight": item.get("lineHeight", 1.2), "letterSpacing": item.get("letterSpacing", 0),
            "color": item["color"], "align": item["align"],
        })

    return {"version": 1, "width": 1080, "height": 1350, "background": background_color, "elements": elements}


import threading

_out_lock = threading.Lock()

def out_safe(obj: dict):
    """out() thread-safe (múltiplas threads podem chamar ao mesmo tempo)."""
    with _out_lock:
        out(obj)


def fetch_image_for_slide(args_tuple):
    """
    FASE 1 — Checagem de Checkpoint Local e chamada de API se necessário.
    Roda em paralelo. Retorna (idx, img_bytes | None, from_cache: bool).
    """
    idx, s, out_dir, preset_name, force_regenerate = args_tuple
    num = s.get("num", str(idx).zfill(2))
    layout = s.get("layout", "fullbleed")
    if not layout_uses_generated_image(layout):
        return idx, None, False

    # 0. Imagem curada (Pinterest): usada no lugar da geração por IA
    curated = s.get("curated_image_path")
    if curated and Path(curated).exists():
        out_safe({"type": "log", "msg": f"  S{idx:02d} usando imagem curada do Pinterest"})
        return idx, Path(curated).read_bytes(), False

    # 1. Verificação de Checkpoint estrito (apenas raw-XX.jpg criado na mesma sessão de geração)
    raw_file = out_dir / f"raw-{num}.jpg"
    
    # Não reutiliza slide-{num}.jpg antigo para garantir que novos carrosséis gerem fotos 100% inéditas
    if not force_regenerate and raw_file.exists() and raw_file.stat().st_size > 1024:
        try:
            cached_bytes = raw_file.read_bytes()
            out_safe({"type": "log", "msg": f"  S{idx:02d} imagem recuperada do checkpoint bruto (resume)"})
            return idx, cached_bytes, True
        except Exception:
            pass

    # 2. Se não existir no cache local, chama a API OpenAI
    prompt = s.get("prompt", "")
    s_title = s.get("title", "")
    quality = s.get("imageQuality", None)
    slide_preset = s.get("preset") or preset_name
    prompt_final = build_prompt(
        prompt or f"Symbolic editorial portrait and visual metaphor for: {s_title}",
        slide_preset,
        title=s_title,
        body=s.get("body", ""),
        layout=layout,
        visual_plan=s.get("visual_plan"),
    )
    references_enabled = os.getenv("ENABLE_STYLE_REFERENCE_IMAGES", "false").lower() == "true"
    reference, reference_id = select_reference(s) if references_enabled else (None, None)
    reference_paths = [str(reference)] if reference and reference.exists() else None
    if reference_id:
        out_safe({"type": "log", "msg": f"  S{idx:02d} memoria visual: {reference_id}"})
    return idx, gen(prompt_final, quality=quality or "high", size="1024x1536", reference_paths=reference_paths), False


def main():
    from concurrent.futures import ThreadPoolExecutor, as_completed

    parser = argparse.ArgumentParser()
    parser.add_argument("--data", help="JSON com o payload do carrossel (legado)")
    parser.add_argument(
        "--data-stdin",
        action="store_true",
        help="Lê o payload JSON pela entrada padrão (mais seguro no Windows)",
    )
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Valida e dirige o roteiro sem gerar imagens nem criar arquivos",
    )
    args = parser.parse_args()

    try:
        raw_payload = sys.stdin.read() if args.data_stdin else args.data
        if not raw_payload:
            raise ValueError("Payload JSON não informado")
        payload = json.loads(raw_payload)
    except json.JSONDecodeError as e:
        out({"type": "error", "msg": f"JSON inválido: {e}"})
        sys.exit(1)
    except ValueError as e:
        out({"type": "error", "msg": str(e)})
        sys.exit(1)

    title     = payload.get("title", "Carrossel sem título")
    theme     = payload.get("theme", slugify(title))
    fmt       = payload.get("format", "B")
    caption   = payload.get("caption", "")
    notes     = payload.get("notes", "")
    rev_score = payload.get("revisor_score", "")
    slides    = payload.get("slides", [])
    active_preset = payload.get("preset") or payload.get("template") or "bella_editorial_luxo"
    force_regenerate = bool(payload.get("forceRegenerate", False))

    if not slides:
        out({"type": "error", "msg": "Nenhum slide no payload"})
        sys.exit(1)

    slides, deck_direction = direct_deck(slides, active_preset, int(payload.get("noImageSlidesCount") or 0))
    payload["slides"] = slides
    out({"type": "log", "msg": f"Direção-mestra: {deck_direction['theme']} · motivo: {deck_direction['motif']}"})

    if args.validate_only:
        out({
            "type": "validated",
            "total": len(slides),
            "title": title,
            "preset": active_preset,
            "art_direction": deck_direction.get("art_direction"),
        })
        return

    slug = slugify(title)
    carousel_id = payload.get("id")
    if not carousel_id:
        carousel_id = f"carrossel-{slug}"
    else:
        carousel_id = str(carousel_id)

    # Tudo fica dentro do próprio projeto (ROOT/storage/carousels), em qualquer sistema:
    # fora de pastas sincronizadas (OneDrive já causou perda de carrosséis) e sem depender
    # de o servidor estar instalado em /app. Em Docker (/app/backend) o resultado é o mesmo.
    out_dir = ROOT / "storage" / "carousels" / f"{carousel_id}-{slug}"
    out_dir.mkdir(parents=True, exist_ok=True)

    total = len(slides)
    out({"type": "start", "total": total, "title": title, "out_dir": str(out_dir)})

    if payload.get("imageSource") == "pinterest":
        try:
            from core.curadoria.curator import curate_images
            curate_images(slides, out_dir, payload, lambda m: out({"type": "log", "msg": m}), layout_uses_generated_image)
        except Exception as exc:
            out({"type": "log", "msg": f"Curadoria Pinterest falhou ({str(exc)[:120]})."})
        # Fonte Pinterest = só Pinterest: lâmina sem imagem curada fica só com tipografia, nunca vira imagem de IA.
        from core.util.deck_director import convert_missing_to_image_free
        converted = convert_missing_to_image_free(slides, active_preset)
        if converted:
            out({"type": "log", "msg": f"Sem imagem do Pinterest para a(s) lâmina(s) {', '.join(map(str, converted))}: ficam só com tipografia (nenhuma imagem foi gerada por IA)."})

    quality = payload.get("imageQuality", None)

    # Anuncia todos como "gerando" imagem
    for idx, s in enumerate(slides, 1):
        s["imageQuality"] = quality
        out({"type": "slide", "num": idx, "total": total,
             "estado": s.get("estado", f"S{idx}"), "status": "gerando"})

    # ══════════════════════════════════════════════════════════════════════════
    # FASE 1: API calls em paralelo (com detecção de Checkpoint/Resume local)
    # MAX_WORKERS paralelos para as chamadas à OpenAI
    # ══════════════════════════════════════════════════════════════════════════
    MAX_API_WORKERS = min(5, total)
    raw_images: dict[int, bytes | None] = {}

    # Slides da mesma família de cena compartilham a fotografia-base. O corte,
    # contraste e a tipografia mudam depois, criando continuidade sem duplicar
    # custo nem inventar uma personagem nova a cada página.
    scene_members: dict[str, list[int]] = {}
    leaders: list[tuple[int, dict]] = []
    for idx, slide in enumerate(slides, 1):
        if not layout_uses_generated_image(slide.get("layout", "fullbleed")):
            raw_images[idx] = None
            continue
        # Bella Essencial segue a "isolation rule": cada lâmina é um brief visual
        # independente (ver prompt em deck_director.py), então nunca compartilha
        # a foto-base entre cenas — mesmo quando o roteiro repete a letra de CENA.
        if active_preset in ("bella_essencial", "bella_tipografico"):
            scene_key = f"SLIDE-{idx}"
        else:
            scene_key = slide.get("scene") or f"SLIDE-{idx}"
        scene_members.setdefault(scene_key, []).append(idx)
        if len(scene_members[scene_key]) == 1:
            leaders.append((idx, slide))

    with ThreadPoolExecutor(max_workers=min(MAX_API_WORKERS, max(1, len(leaders)))) as pool:
        futures = {pool.submit(fetch_image_for_slide, (idx, s, out_dir, active_preset, force_regenerate)): (idx, s.get("scene") or f"SLIDE-{idx}")
                   for idx, s in leaders}
        for future in as_completed(futures):
            from_cache = False
            try:
                idx, img_bytes, from_cache = future.result()
            except Exception as e:
                idx, _ = futures[future]
                img_bytes = None
                out_safe({"type": "log", "msg": f"  S{idx:02d} API erro: {e}"})
            _, scene_key = futures[future]
            for member_idx in scene_members.get(scene_key, [idx]):
                raw_images[member_idx] = img_bytes
            status_icon = "ok (checkpoint)" if from_cache else ("ok" if img_bytes else "erro")
            out_safe({"type": "log",
                      "msg": f"  Cena {scene_key} imagem {status_icon} · usada em {len(scene_members.get(scene_key, [idx]))} lâmina(s)"})

    # ══════════════════════════════════════════════════════════════════════════
    # FASE 2: Composição sequencial com Pillow (CPU+memória — 1 por vez)
    # Evita OOM no free tier do Render (512 MB)
    # ══════════════════════════════════════════════════════════════════════════
    out({"type": "log", "msg": "Compondo slides..."})
    ok_count = 0

    for idx in range(1, total + 1):
        s       = slides[idx - 1]
        num     = s.get("num", str(idx).zfill(2))
        estado  = s.get("estado", f"S{idx}")
        layout  = s.get("layout", "fullbleed")
        s_title = s.get("title", "")
        body    = s.get("body", "")
        img_bytes = raw_images.get(idx)

        # Mapear layout do frontend para o modo do motor v3
        mode = layout
        if layout in ("fullbleed", "image", "default"):
            mode = "fullbleed"
        elif layout == "text_only":
            mode = "text_only"
            img_bytes = None

        if not img_bytes and layout_uses_generated_image(layout) and mode not in ("brands_split", "brands_editorial", "brands_outro"):
            out({"type": "slide", "num": idx, "total": total, "estado": estado,
                 "status": "erro", "msg": "Falha na geração de imagem"})
            continue

        preset = s.get("preset") or payload.get("preset") or ("brands_decoded_principal" if "brands" in str(fmt).lower() else "bella_organico_terracota")
        design_report = []
        try:
            final_img = compose(
                img_bytes, s_title, body, mode, preset,
                deck_direction=s.get("deck_direction") or deck_direction,
                text_anchor=s.get("text_anchor"),
                report=design_report,
                type_spec=s.get("visual_plan") if isinstance(s.get("visual_plan"), dict) else None,
            )
        except Exception as e:
            out({"type": "slide", "num": idx, "total": total, "estado": estado,
                 "status": "erro", "msg": f"Composição falhou: {e}"})
            continue

        out_file = out_dir / f"slide-{num}.jpg"
        raw_file = out_dir / f"raw-{num}.jpg"
        try:
            # Salvar a imagem base sem texto (Raw Cache)
            if img_bytes:
                raw_file.write_bytes(img_bytes)

            if isinstance(final_img, bytes):
                out_file.write_bytes(final_img)
            else:
                final_img.save(str(out_file), "JPEG", quality=95)

            # Salvar metadados do slide para permitir edição posterior com textos e prompt preenchidos
            try:
                meta_file = out_file.with_suffix(".meta.json")
                is_type_layout = str(layout).startswith("bella_type_")
                meta_data = {
                    "title": re.sub(r"\*+|\[\[|\]\]", "", s_title) if is_type_layout else s_title,
                    "body": re.sub(r"\*+|\[\[|\]\]", "", body) if is_type_layout else body,
                    "layout": layout,
                    "preset": preset,
                    "prompt": s.get("prompt", f"Cinematic dark esoteric illustration, dramatic volumetric light, deep emotional atmosphere. Abstract visual metaphor for: {s_title}")
                    ,"scene": s.get("scene")
                    ,"visual_role": s.get("visual_role")
                    ,"visual_plan": s.get("visual_plan")
                    ,"deck_direction": s.get("deck_direction")
                    ,"design": build_editable_design(design_report, has_photo=bool(img_bytes), visual_plan=s.get("visual_plan"))
                }
                if s.get("image_source"):
                    meta_data["image_source"] = s["image_source"]
                if is_type_layout:
                    meta_data["title_markup"] = s_title
                    meta_data["body_markup"] = body
                meta_file.write_text(json.dumps(meta_data, ensure_ascii=False, indent=2), encoding="utf-8")
            except Exception:
                pass

            ok_count += 1
            out({"type": "slide", "num": idx, "total": total, "estado": estado,
                 "status": "ok", "file": str(out_file)})
        except Exception as e:
            out({"type": "slide", "num": idx, "total": total, "estado": estado,
                 "status": "erro", "msg": f"Salvar falhou: {e}"})

        # Libera memória imediatamente após salvar
        del final_img, img_bytes
        raw_images[idx] = None

    # ── Registro no dashboard ─────────────────────────────────────────────────
    if IS_WIN and register and not payload.get("skipRegister", False):
        try:
            entry = register(
                title=title, theme=theme, slides_dir=str(out_dir),
                format=fmt, caption=caption, revisor_score=rev_score,
                notes=notes,
                status="pronto" if ok_count == total else "rascunho",
            )
            out({"type": "done", "id": entry["id"], "slides_dir": str(out_dir),
                 "total_ok": ok_count, "total": total})
        except Exception as e:
            out({"type": "error", "msg": f"Registro local falhou: {e}"})
            sys.exit(1)
    else:
        out({"type": "done", "slides_dir": str(out_dir),
             "total_ok": ok_count, "total": total,
             "title": title, "theme": theme, "format": fmt,
             "caption": caption, "notes": notes, "revisor_score": rev_score})


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        # O worker precisa receber uma mensagem legível em vez de perder o
        # traceback quando uma falha inesperada acontece antes dos slides.
        out({"type": "error", "msg": f"Falha interna do pipeline: {exc}"})
        raise
