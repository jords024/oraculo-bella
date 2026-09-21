"""Direção fotográfica coerente com a identidade visual selecionada."""

import json
import re

_CAMERA = (
    "Vertical portrait composition, 4:5 ratio, 1080x1350 pixels. "
    "Native vertical framing composed in-camera, never stretched or squeezed. "
    "Premium editorial photography, tactile natural textures, intentional negative space. "
)

_STYLE_PROFILES = {
    "bella_editorial_luxo": (
        "Adaptive high-end editorial art direction for Isabella Dalcin: expressive, psychologically precise, tactile and authored. "
        "The visual medium must follow the supplied carousel art direction and may be collage, surreal tableau, sculptural material, "
        "graphic image or cinematic photography. Warm ivory, ink black and restrained accent color; never a repeated house photo recipe. "
    ),
    "bella_essencial": (
        "Bella Essencial art direction: concept-first, sensitive esoteric editorial imagery with psychological meaning. "
        "Invent one unique visual law for this carousel and express it through refined photographic surrealism, analog collage, "
        "hand-painted mineral texture or an impossible but emotionally intelligible environment. Preserve that law across the sequence, "
        "but vary gesture, scale, crop and symbolic state. When a person appears, the gaze or gesture must carry real inner tension. "
        "Do not promote a literal noun from the copy into the main subject unless it reveals the psychological conflict by itself. "
        "No generic portrait, wellness stock image, decorative mysticism or collage of unrelated symbols. "
    ),
    "bella_organico_terracota": (
        "Earthy organic editorial, sun-baked terracotta, raw linen, clay, skin and roots, "
        "soft imperfect daylight, grounded intimate atmosphere, artisanal tactility. "
    ),
    "bella_verde_musgo": (
        "Poetic botanical editorial, deep moss green, muted sage and warm cream, "
        "pressed leaves, living plants and natural cycles, diffused forest light, elegant calm. "
    ),
    "bella_ambar_sagrado": (
        "Luminous amber editorial, honey gold, parchment and deep umber, filtered late-afternoon sun, "
        "subtle sacred symbolism, mature warmth, contemplative and expansive atmosphere. "
    ),
}

_COMPOSITION = (
    "Compose deliberately for an editorial poster, with a clear focal point and a real low-detail zone "
    "for the typography described by the art direction. The image must feel authored, not like a generic stock photograph. "
)

_EXPANSIVE_COVER = (
    "Cover art direction: create an expansive expressive world, never a close portrait or a fixed photographic recipe. "
    "The scene may be mixed-media collage, surreal construction, sculptural installation, bold graphic composition or a wide cinematic moment, "
    "according to the carousel art direction. Build visible depth, atmosphere, movement and a sense of discovery. "
    "A person is optional; when present, show full body, partial gesture or small figure occupying at most 35 percent of the frame. "
    "Let scale, material transformation and one poetic metaphor carry the emotion instead of relying only on a face. "
    "Reserve a generous naturally calm region for an oversized editorial headline integrated with the composition. "
    "Never use a head-and-shoulders crop, seated studio portrait, plain wall backdrop, generic lifestyle pose or repeated woman-on-wall composition. "
)

_ESSENTIAL_COVER = (
    "Essential cover composition: the image occupies the upper visual field and must carry the hook by itself. "
    "Use the full frame for one emotionally expressive symbolic scene with depth, scale and a strong focal point. "
    "The cover must reveal an invisible psychological truth, not merely display the object named in the script. "
    "Do not reserve empty space for typography and do not add a dark blur, gradient panel or fake text area inside the image; "
    "the design system will place all copy in a separate clean band below the photograph. "
    "A person is optional and must never be a generic posed portrait. "
)

_RESTRICTIONS = (
    "Absolutely no text, letters, words, numbers, logos, watermarks or readable symbols. "
    "No 3D-render look, no cartoon aesthetic, no interface elements. "
    "Avoid the overused recipe of a woman bound or tethered by threads, ropes or ribbons walking away down an "
    "ornate palace corridor with arched doorways — this exact composition has already been used repeatedly and must not recur."
)


def _pick(signature: str, pool: tuple[str, ...]) -> str:
    import hashlib
    digest = hashlib.sha256(signature.encode("utf-8")).digest()
    return pool[int.from_bytes(digest[:2], "big") % len(pool)]


_MATERIAL_POOLS = {
    "prosperity": (
        "half-buried antique coins in damp earth",
        "thick roots breaking through a cracked clay vessel",
        "seeds kept in a bowl of unglazed clay near a window",
        "raw linen cloth hanging, cut by filtered afternoon light",
    ),
    "exhaustion": (
        "a heavy cloth slipping slowly off the shoulders",
        "a cooling cup beside a fogged window",
        "an empty chair in low late-afternoon light",
        "still water reflecting a tall quiet ceiling",
    ),
    "boundary": (
        "a wooden gate left ajar against low light",
        "two hands slowly letting go of each other on a wooden table",
        "a straight line drawn in wet sand",
        "a folded terracotta cloth resting on stone",
    ),
    "default": (
        "a cracked clay bowl repaired with visible gold seams (kintsugi)",
        "exposed roots emerging from dry, cracked earth",
        "raw linen cloth folded on an aged wooden table",
        "late light crossing a thin translucent curtain",
    ),
}


def _semantic_direction(title: str = "", body: str = "") -> str:
    """Evita que o gerador trate uma copy emocional como decoração de fundo."""
    source = f"{title} {body}".lower()
    signature = f"{title}::{body}".lower()

    if re.search(r"prosper|dinheiro|merec|cobrar|riqueza", source):
        material = _pick(signature, _MATERIAL_POOLS["prosperity"])
        return (
            f"Semantic anchor: prosperity without self-abandonment. Express inner value through a surprising transformation "
            f"involving {material}. A human presence is optional and must "
            "serve the concept rather than become another posed portrait. This is inner worth, never luxury ostentation. "
        )
    if re.search(r"cansa[cç]|esgot|bateria|descans|sobrecarga", source):
        material = _pick(signature, _MATERIAL_POOLS["exhaustion"])
        return (
            f"Semantic anchor: exhaustion asking for care. Show a human presence caught between weight and relief, "
            f"using softened light, a slowed gesture, and a tactile detail such as {material} rather than a generic sad interior. "
        )
    if re.search(r"culpa|agradar|aceitar|\blimite(s)?\b|dizer n[aã]o|colocar (um )?limite", source):
        material = _pick(signature, _MATERIAL_POOLS["boundary"])
        return (
            f"Semantic anchor: the boundary between pleasing others and returning to oneself. Make the tension visible "
            f"through gaze, posture, a threshold, a reflected self, or a detail such as {material}. Vary which of these "
            "carries the tension — do not default to a bound or tied figure every time. "
        )
    material = _pick(signature, _MATERIAL_POOLS["default"])
    return (
        f"Semantic anchor: translate the emotional tension of the source copy into an original visual metaphor, "
        f"optionally anchored on a detail such as {material}. "
        "Use a specific human expression, gesture, material and light; never use a decorative interior or stock pose as filler. "
    )


def build_prompt(slide_prompt: str, preset_name: str = "bella_editorial_luxo", *, title: str = "", body: str = "", layout: str = "", visual_plan=None) -> str:
    """Combina conceito, sentido da copy e linguagem visual do template ativo."""
    p = (slide_prompt or "").strip()
    for pattern in (
        r"vertical composition,?\s*portrait orientation[.,]?",
        r"square format[.,]?",
        r"portrait orientation[.,]?",
        r"\bno text\b[.,]?",
        r"no watermarks?[.,]?",
        r"no logos?[.,]?",
    ):
        p = re.sub(pattern, "", p, flags=re.IGNORECASE).strip()

    profile = _STYLE_PROFILES.get(preset_name, _STYLE_PROFILES["bella_editorial_luxo"])
    concept = p.rstrip(". ") or "An emotionally resonant symbolic portrait"
    semantic = _semantic_direction(title, body)
    copy_context = f"Source message to embody: {title}. {body}. " if (title or body) else ""
    layout_hint = "" if not layout else f"Editorial slide role: {layout}. "
    plan_hint = ""
    if isinstance(visual_plan, dict) and visual_plan:
        allowed = {key: visual_plan.get(key) for key in (
            "visual_role", "subject", "action", "environment", "material_anchor", "crop_focus",
            "mood", "accent", "photo_treatment", "text_density", "continuity_key", "unique_detail",
            "emotional_intent", "care_signal", "sensory_focus", "light", "lens", "composition",
            "human_presence", "authenticity_detail", "anti_corporate_guard"
        ) if visual_plan.get(key) not in (None, "")}
        plan_hint = f"Structured visual plan: {json.dumps(allowed, ensure_ascii=False)}. "
    if layout == "bella_essential_01":
        cover_direction = _ESSENTIAL_COVER
    elif layout in {"bella_sequence_01", "bella_editorial_cover"}:
        cover_direction = _EXPANSIVE_COVER
    else:
        cover_direction = ""
    return (
        f"{_CAMERA}{profile}{layout_hint}{plan_hint}{cover_direction}{copy_context}{semantic}"
        f"Scene concept from the art director: {concept}. {_COMPOSITION}{_RESTRICTIONS}"
    )
