"""Direção de arte em nível de carrossel para Isabella Dalcin.

O objetivo deste módulo é impedir que cada slide seja tratado como uma peça
isolada. Ele cria continuidade de cena, motivo material e ritmo visual antes
de qualquer chamada ao gerador de imagens.
"""

from __future__ import annotations

import re
import hashlib
from copy import deepcopy


ROLE_MAP = {
    1: ("cover_photo", "A"),
    2: ("mechanism_manifesto", None),
    3: ("symbolic_collage", "A"),
    4: ("typographic_climax", None),
    5: ("intimate_turn", "B"),
    6: ("editorial_split", "B"),
    7: ("photo_manifesto", "C"),
    8: ("truth_pause", None),
    9: ("possibility", "C"),
    10: ("airy_release", "D"),
}

# Cada duração possui uma dramaturgia completa. Antes, carrosséis curtos
# simplesmente recebiam os primeiros layouts da sequência de dez; assim, um
# deck de cinco páginas terminava no papel de "virada íntima" e nunca chegava
# ao fechamento. Agora o arco é condensado, mas sempre preserva capa, virada e
# conclusão.
SEQUENCE_PLANS = {
    3: (1, 4, 10),
    5: (1, 2, 3, 4, 10),
    7: (1, 2, 3, 4, 6, 8, 10),
    10: tuple(range(1, 11)),
}


ART_DIRECTIONS = (
    {
        "id": "ilustracao_ritual_elemental",
        "label": "ilustração ritual elemental",
        "language": "high-end painterly editorial illustration where one elemental force organizes a psychologically precise scene; women have agency, nature behaves symbolically, circular geometry structures relation or passage, and tactile pigments keep the image human rather than fantasy-like",
        "cover": "an expansive illustrated world with a low organic horizon, atmospheric negative space and one unforgettable relational or ritual gesture",
        "cover_human_policy": "A woman, dyad or small circle may appear in expressive action and environmental scale; never use a generic portrait, priestess costume or decorative mysticism.",
    },
    {
        "id": "surrealismo_natural_relacional",
        "label": "surrealismo natural relacional",
        "language": "natural surrealism and refined analog collage: landscape, bodies and living matter form one emotional ecosystem; circles, reflections and thresholds reveal love, union and return without literal hearts or ornamental symbols",
        "cover": "a quiet impossible landscape in three visual zones — atmosphere, relational threshold and living matter — with editorial scale and deliberate silence",
        "cover_human_policy": "Prefer a shared gesture, mirrored posture or small figures in relation to the landscape; a solitary woman is allowed only when solitude is the exact thesis.",
    },
    {
        "id": "collage_poetico",
        "label": "colagem poética editorial",
        "language": "mixed-media editorial collage with torn paper, translucent layers, imperfect cut edges, ink gestures and one emotionally charged figurative fragment; tactile, sophisticated, never scrapbook-like",
        "cover": "an expansive constructed world made of layered landscape fragments, scale shifts and a small human silhouette or expressive hands",
        "cover_human_policy": "Do not use a photographed woman on this cover. Let fragments, scale, material and absence carry the emotion.",
    },
    {
        "id": "surrealismo_simbolico",
        "label": "surrealismo simbólico",
        "language": "poetic surreal tableau, dream logic, symbolic scale, painterly atmosphere and one impossible but emotionally precise event; neither stock photography nor fantasy cliché",
        "cover": "a wide dreamlike universe where environment and symbolic transformation carry the thesis; the person may be small, partially hidden or absent",
        "cover_human_policy": "Do not include a human figure on this cover. Build the emotional contradiction through environment, threshold, impossible scale and symbolic transformation.",
    },
    {
        "id": "materia_escultorica",
        "label": "matéria escultórica",
        "language": "conceptual editorial still life and sculptural material study using cloth, clay, wax, paper, water, stone or botanical matter; dramatic spatial composition with human traces instead of a conventional portrait",
        "cover": "a monumental material metaphor staged as an expansive installation with depth, shadow and scale",
        "cover_human_policy": "No person on the cover. Human presence may be suggested only by traces, scale or a recent gesture left in the material.",
    },
    {
        "id": "grafismo_expressivo",
        "label": "grafismo expressivo",
        "language": "bold graphic editorial image combining flat color fields, organic shapes, ink, grain, cropped figurative details and dynamic negative space; contemporary magazine art direction, not corporate vector art",
        "cover": "a large graphic gesture crosses the frame and interacts with a fragmented body, silhouette or object to create motion and tension",
        "cover_human_policy": "Avoid a conventional woman portrait. Prefer a cropped trace, abstract silhouette or object interacting with the graphic field.",
    },
    {
        "id": "cinema_em_movimento",
        "label": "cinema em movimento",
        "language": "expressive cinematic image with environmental scale, authentic movement, unusual viewpoint, motion softness and emotionally specific body language; documentary-poetic rather than posed portraiture",
        "cover": "a wide environmental moment in progress, with the figure embedded in a world rather than presented against a backdrop",
        "cover_human_policy": "A person is allowed only as a small environmental figure in authentic motion, never as the main portrait subject.",
    },
)


def _choose_art_direction(slides: list[dict]) -> dict:
    """Escolhe uma linguagem estável por conteúdo, mas variável entre conteúdos."""
    signature = " | ".join(
        f"{slide.get('title', '')}::{slide.get('body', '')}" for slide in slides
    ).strip().lower()
    digest = hashlib.sha256(signature.encode("utf-8")).digest()
    return ART_DIRECTIONS[int.from_bytes(digest[:2], "big") % len(ART_DIRECTIONS)]


def _pick(signature: str, pool: tuple[str, ...]) -> str:
    """Escolhe um item da lista de forma estável por conteúdo, mas variável
    entre carrosséis diferentes — evita repetir sempre o mesmo motivo dentro
    de uma mesma categoria temática."""
    digest = hashlib.sha256(signature.encode("utf-8")).digest()
    return pool[int.from_bytes(digest[:2], "big") % len(pool)]


_ELEMENTAL_FORCES = {
    "terra": {
        "pattern": r"sustent|seguran[cç]|pertenc|raiz|casa|corpo|limite|dinheiro|prosper",
        "language": "Earth — sustaining weight, soil, roots, clay, seed and grounded belonging",
        "palette": "forest green, olive, cocoa, warm ivory and mineral black",
    },
    "agua": {
        "pattern": r"sent|emo[cç]|acolh|receb|flux|choro|integra|rela[cç]|amor",
        "language": "Water — integration, reflection, mist, current, shared vessel and emotional reciprocity",
        "palette": "mineral blue, mist grey, deep green, warm ivory and graphite",
    },
    "fogo": {
        "pattern": r"transform|raiva|desejo|coragem|ruptura|escolh|pot[eê]ncia|verdade",
        "language": "Fire — transformation, ember, wax, amber light and the courage to change form",
        "palette": "amber, terracotta, wine, charcoal and parchment",
    },
    "ar": {
        "pattern": r"liberdade|movimento|voz|respir|leve|solt|mudan[cç]|partida",
        "language": "Air — movement, fabric, visible wind, grass, sky and the release of a fixed shape",
        "palette": "blue grey, cool ivory, muted green and ink black",
    },
    "eter": {
        "pattern": r"espiritual|consci[eê]ncia|campo|uni[aã]o|conex|inteir|presen[cç]|sil[eê]ncio",
        "language": "Ether — connection, circular field, luminous void, orbit, reflection and wholeness",
        "palette": "ivory, ink, olive, deep mineral blue and restrained gold",
    },
}


def _choose_elemental_force(slides: list[dict]) -> tuple[str, dict]:
    source = " ".join(f"{slide.get('title', '')} {slide.get('body', '')}" for slide in slides).lower()
    scored = [(name, force, len(re.findall(force["pattern"], source))) for name, force in _ELEMENTAL_FORCES.items()]
    best_score = max(score for _, _, score in scored) if scored else 0
    if best_score:
        name, force, _ = next(item for item in scored if item[2] == best_score)
        return name, force
    signature = "::".join(slide.get("title", "") for slide in slides)
    name = _pick(signature, tuple(_ELEMENTAL_FORCES.keys()))
    return name, _ELEMENTAL_FORCES[name]


_UNIVERSE_BUCKETS = (
    {
        "pattern": r"prosper|dinheiro|cobrar|riqueza",
        "theme": "prosperidade sem autoabandono",
        "motifs": (
            "moedas antigas parcialmente cobertas por terra úmida",
            "raízes grossas atravessando um vaso de cerâmica rachado",
            "sementes guardadas em uma tigela de barro à luz da janela",
            "um tecido cru pendurado, atravessado por sol filtrado da tarde",
        ),
        "gestures": (
            "uma mulher adulta sustenta o próprio olhar com serenidade e vulnerabilidade",
            "uma mulher adulta segura algo pequeno e valioso nas duas mãos, sem mostrá-lo por completo",
        ),
    },
    {
        "pattern": r"\blimite(s)?\b|dizer n[aã]o|colocar (um )?limite|rejei[cç]",
        "theme": "limite sem culpa",
        "motifs": (
            "um portão de madeira entreaberto contra luz baixa",
            "duas mãos que se soltam devagar sobre uma mesa de madeira",
            "uma linha reta traçada na areia molhada",
            "um tecido terracota dobrado ao meio sobre uma pedra",
        ),
        "gestures": (
            "uma mulher adulta interrompe um gesto automático e retorna a atenção para si",
            "uma mulher adulta observa a própria mão parar no ar antes de agir por hábito",
        ),
    },
    {
        "pattern": r"agradar|boa mo[cç]a|v[ií]nculo|pertenc",
        "theme": "pertencimento sem submissão",
        "motifs": (
            "duas cadeiras próximas, viradas em direções ligeiramente diferentes",
            "um espelho antigo embaçado por respiração",
            "uma porta entreaberta com luz de dois ambientes distintos",
        ),
        "gestures": (
            "uma mulher adulta desvia o peso do corpo de um gesto de agrado automático",
            "uma mulher adulta observa seu próprio reflexo sem ajustar a postura",
        ),
    },
    {
        "pattern": r"cansa|esgot|descans|sobrecarga|bateria",
        "theme": "o corpo pedindo retorno",
        "motifs": (
            "um tecido pesado escorregando devagar de sobre os ombros",
            "uma xícara esfriando ao lado de uma janela embaçada",
            "uma cadeira vazia em luz baixa de fim de tarde",
            "água parada refletindo um teto alto e silencioso",
        ),
        "gestures": (
            "uma mulher adulta desacelera o corpo e permite que o peso deixe os ombros",
            "uma mulher adulta fecha os olhos por um instante em pleno movimento do dia",
        ),
    },
    {
        "pattern": r"ciclo|intui|corpo feminino|hormon|l[uú]a",
        "theme": "o corpo que sabe antes da mente",
        "motifs": (
            "a lua refletida em uma bacia rasa de água parada",
            "pétalas secas dispostas sobre papel artesanal áspero",
            "um calendário lunar desenhado à mão em papel envelhecido",
        ),
        "gestures": (
            "uma mulher adulta pousa a mão sobre o próprio ventre em silêncio",
            "uma mulher adulta observa o próprio corpo sem pressa, à luz natural",
        ),
    },
    {
        "pattern": r"espiritual|integra[cç][aã]o|busca|retiro|desperta",
        "theme": "integração depois da experiência",
        "motifs": (
            "um livro antigo aberto sobre uma mesa, páginas movidas pelo vento",
            "incenso se dissipando contra a luz de uma janela",
            "uma porta simples entreaberta para um jardim comum",
        ),
        "gestures": (
            "uma mulher adulta volta a uma tarefa comum com presença renovada",
            "uma mulher adulta caminha devagar por um espaço familiar, sem pressa de partir",
        ),
    },
)

_DEFAULT_UNIVERSE = {
    "theme": "retorno à própria presença",
    "motifs": (
        "uma tigela de barro rachada e reparada com ouro visível (kintsugi)",
        "raízes expostas emergindo de terra seca e rachada",
        "um tecido de linho cru dobrado sobre uma mesa de madeira envelhecida",
        "luz de fim de tarde atravessando uma cortina fina e translúcida",
    ),
    "gestures": (
        "uma mulher adulta revela uma emoção contida por meio do olhar e das mãos",
        "uma mulher adulta permanece parada um instante a mais do que o automático pediria",
    ),
}


def _creative_universe(slides: list[dict]) -> dict:
    """Escolhe tema, motivo material e gesto humano a partir do conteúdo.

    Cada categoria temática guarda uma LISTA de motivos possíveis (nunca um
    único motivo fixo) para que carrosséis de temas parecidos não repitam a
    mesma composição visual — o motivo específico varia por hash do próprio
    conteúdo, então é estável para o mesmo carrossel mas diferente entre
    carrosséis distintos, mesmo dentro da mesma categoria.
    """
    source = " ".join(
        f"{slide.get('title', '')} {slide.get('body', '')}" for slide in slides
    ).lower()
    signature = " | ".join(
        f"{slide.get('title', '')}::{slide.get('body', '')}" for slide in slides
    ).strip().lower()

    bucket = next(
        (b for b in _UNIVERSE_BUCKETS if re.search(b["pattern"], source)),
        None,
    )
    if bucket is None:
        theme, motifs, gestures = _DEFAULT_UNIVERSE["theme"], _DEFAULT_UNIVERSE["motifs"], _DEFAULT_UNIVERSE["gestures"]
    else:
        theme, motifs, gestures = bucket["theme"], bucket["motifs"], bucket["gestures"]

    return {
        "theme": theme,
        "motif": _pick(signature, motifs),
        "gesture": _pick(signature + "::gesture", gestures),
    }


TYPE_LAYOUTS = (
    "bella_type_cover", "bella_type_fragments", "bella_type_escalation", "bella_type_pause", "bella_type_close",
)
_TYPE_MIDDLE_CYCLE = ("bella_type_fragments", "bella_type_escalation", "bella_type_pause")


def _type_layout(index: int, total: int, declared, previous) -> str:
    """Capa e fechamento são fixos; o miolo respeita a escolha do Oráculo e evita repetir o vizinho."""
    if index == 1:
        return "bella_type_cover"
    if index == total:
        return "bella_type_close"
    middle = declared if declared in _TYPE_MIDDLE_CYCLE else None
    if middle is None or middle == previous:
        middle = next((layout for layout in _TYPE_MIDDLE_CYCLE[(index - 2) % 3:] + _TYPE_MIDDLE_CYCLE[:(index - 2) % 3]
                       if layout != previous), _TYPE_MIDDLE_CYCLE[0])
    return middle


def direct_deck(slides: list[dict], preset_name: str, no_image_count: int = 0) -> tuple[list[dict], dict]:
    """Enriquece slides com um plano visual único e cenas recorrentes."""
    directed = deepcopy(slides)
    universe = _creative_universe(directed)
    art = _choose_art_direction(directed)
    elemental_name, elemental = _choose_elemental_force(directed)
    deck = {
        **universe,
        "art_direction_id": art["id"],
        "art_direction": art["label"],
        "visual_language": art["language"],
        "cover_language": art["cover"],
        "cover_human_policy": art["cover_human_policy"],
        "elemental_force": elemental_name,
        "elemental_language": elemental["language"],
        "palette": elemental["palette"],
        "texture": "grão orgânico, matéria tátil, bordas imperfeitas e contraste editorial",
        "sacerdotal_rule": "Presença sacerdotal através de gesto consciente, circularidade, cuidado da matéria e passagem; nunca figurino de fantasia ou misticismo decorativo.",
        "cover_revelation_rule": "A primeira capa traduz headline e ganho em uma visão sensível, expressiva, sacerdotal e psicodélica: presença viva, emoção reconhecível, uma metáfora central e transformação entre estados. Nunca objeto isolado, pose genérica ou psicodelia decorativa.",
        "relational_rule": "Amor e união por reciprocidade, proximidade, gesto compartilhado, posturas espelhadas ou ecossistema interdependente; nunca coração literal.",
    }

    sequence_plan = SEQUENCE_PLANS.get(len(directed))
    if sequence_plan is None:
        sequence_plan = tuple(range(1, min(len(directed), 9) + 1)) + ((10,) if directed else ())
        sequence_plan = sequence_plan[:len(directed)]

    essential_plans = {
        3: (1, 4, 5),
        5: (1, 2, 3, 4, 5),
        7: (1, 2, 3, 2, 3, 4, 5),
        10: (1, 2, 3, 2, 3, 4, 2, 3, 4, 5),
    }
    essential_plan = essential_plans.get(len(directed))

    previous_type_layout = None
    for index, slide in enumerate(directed, 1):
        sequence_no = sequence_plan[index - 1]
        role, fallback_scene = ROLE_MAP[sequence_no]

        if preset_name == "bella_tipografico":
            type_layout = _type_layout(index, len(directed), slide.get("layout"), previous_type_layout)
            previous_type_layout = type_layout
            slide["layout"] = type_layout
            plan = slide.get("visual_plan") if isinstance(slide.get("visual_plan"), dict) else {}
            if plan.get("text_side") not in ("left", "right"):
                plan["text_side"] = "right" if type_layout == "bella_type_close" else "left"
            slide["visual_plan"] = plan
            slide["scene"] = None
            slide["visual_role"] = type_layout.replace("bella_", "")
            slide["deck_direction"] = deck
            continue

        # O Editorial Bella sempre usa a gramática sequencial. Isto também
        # corrige roteiros antigos que chegavam como card/fullbleed genéricos.
        if preset_name == "bella_editorial_luxo":
            slide["layout"] = f"bella_sequence_{sequence_no:02d}"
        elif preset_name == "bella_essencial":
            essential_no = essential_plan[index - 1] if essential_plan else (1 if index == 1 else 5 if index == len(directed) else 2 + ((index - 2) % 3))
            slide["layout"] = f"bella_essential_{essential_no:02d}"

        declared_scene = str(slide.get("scene") or "").strip().upper()
        scene_id = declared_scene if declared_scene in {"A", "B", "C", "D"} else fallback_scene
        slide["scene"] = scene_id
        slide["visual_role"] = role
        slide["deck_direction"] = deck

        if scene_id:
            if preset_name == "bella_essencial":
                continuity = (
                    "Bella Essential isolation rule: the supplied copy is the source of truth. Treat this slide's VISUAL direction as a raw brief, "
                    "and elevate it when it merely illustrates a literal noun instead of revealing the psychological conflict. "
                    "Never import a subject, symptom, decorative object or material motif from another carousel. "
                    "Keep continuity through palette, tactile light and material atmosphere; vary subject, scale and action according "
                    "to the precise meaning of this page. Do not generate typography inside the image. "
                )
                if index == 1:
                    continuity += f"NON-NEGOTIABLE COVER REVELATION: {deck['cover_revelation_rule']} "
            else:
                continuity = (
                    f"Master visual universe: {deck['theme']}. Recurring material motif: {deck['motif']}. "
                    f"Dominant elemental force: {deck['elemental_language']}. Palette: {deck['palette']}. "
                    f"{deck['sacerdotal_rule']} {deck['relational_rule']} "
                    f"Art direction for this entire carousel: {deck['visual_language']}. "
                    f"Cover language: {deck['cover_language']}. "
                    f"Recurring human direction: {deck['gesture']}. Scene family {scene_id}; preserve the same "
                    "visual world, atmosphere and material motif when this family repeats. If a person exists, preserve identity "
                    "and wardrobe; a person is not mandatory. Change scale, crop or symbolic state when the scene returns. "
                )
                if index == 1:
                    continuity += f"NON-NEGOTIABLE COVER REVELATION: {deck['cover_revelation_rule']} Cover human policy: {deck['cover_human_policy']} "
            slide["prompt"] = f"{continuity}{slide.get('prompt', '')}".strip()

    _apply_no_image(directed, preset_name, no_image_count)
    return directed, deck


_PAPER_CYCLE = ("papel", "areia", "cacau", "musgo")


def _spread(candidates: list[int], k: int) -> list[int]:
    """Escolhe k posições espaçadas por igual, para o ritmo foto/cor alternar."""
    if k <= 0:
        return []
    if k >= len(candidates):
        return list(candidates)
    step = len(candidates) / k
    return [candidates[int((i + 0.5) * step)] for i in range(k)]


def _pick_far(candidates: list[int], existing: list[int], k: int, total: int) -> list[int]:
    """Escolhe, um a um, a lâmina mais distante das que já ficam sem imagem (e das bordas)."""
    chosen: list[int] = []
    for _ in range(k):
        taken = [-1, total, *existing, *chosen]
        options = [c for c in candidates if c not in chosen]
        if not options:
            break
        chosen.append(max(options, key=lambda c: (min(abs(c - t) for t in taken), -c)))
    return chosen


def _free_layout(preset_name: str, index: int, total: int, order: int, previous: str | None) -> str:
    """Layout sem imagem (fundo de cor + tipografia) próprio de cada preset."""
    if preset_name == "bella_tipografico":
        if index == 1:
            return "bella_type_coverpaper"
        if index == total:
            return "bella_type_closepaper"
        return next(l for l in _TYPE_MIDDLE_CYCLE[order % 3:] + _TYPE_MIDDLE_CYCLE[:order % 3] if l != previous)
    if preset_name == "bella_essencial":
        return "bella_essential_04"
    if preset_name == "bella_editorial_luxo":
        if index == total:
            return "bella_sequence_10"
        return ("bella_sequence_04", "bella_sequence_02", "bella_sequence_08")[order % 3]
    return "text_only"


def _photo_layout(preset_name: str, index: int, total: int, order: int) -> str:
    """Layout com imagem, usado quando um slide sem imagem precisa voltar a ter foto."""
    if preset_name == "bella_tipografico":
        return "bella_type_cover" if index == 1 else "bella_type_close" if index == total else "bella_type_photo"
    if preset_name == "bella_essencial":
        return "bella_essential_01" if index == 1 else "bella_essential_05" if index == total else f"bella_essential_0{2 + order % 2}"
    if preset_name == "bella_editorial_luxo":
        return "bella_sequence_01" if index == 1 else "bella_sequence_09" if index == total else ("bella_sequence_03", "bella_sequence_05", "bella_sequence_06", "bella_sequence_07")[order % 4]
    return "fullbleed"


def _apply_no_image(directed: list[dict], preset_name: str, count: int) -> None:
    """Garante exatamente `count` lâminas só com fundo de cor (0 = padrão do preset).

    Vale para todos os presets: escolhe lâminas espaçadas, preferindo o miolo e
    poupando capa e fechamento, e troca para o layout sem imagem do preset.
    """
    total = len(directed)
    count = max(0, min(int(count or 0), total))
    if count == 0 or total == 0:
        return

    free_now = [i for i, s in enumerate(directed) if not layout_uses_generated_image(s.get("layout", "fullbleed"))]
    middle = list(range(1, total - 1))

    if len(free_now) < count:
        photo = [i for i in range(total) if i not in free_now]
        preferred = [i for i in photo if i in middle]
        pool = preferred + [i for i in (total - 1, 0) if i in photo and i not in preferred]
        need = min(count - len(free_now), len(preferred))
        chosen = _spread(sorted(preferred), need) if not free_now else _pick_far(preferred, free_now, need, total)
        for i in pool:
            if len(chosen) >= count - len(free_now):
                break
            if i not in chosen:
                chosen.append(i)
        previous = None
        for order, i in enumerate(sorted(chosen)):
            layout = _free_layout(preset_name, i + 1, total, order, previous)
            previous = layout
            directed[i]["layout"] = layout
    elif len(free_now) > count:
        extra = len(free_now) - count
        preferred = [i for i in free_now if i in middle] or free_now
        for order, i in enumerate(_spread(sorted(preferred), extra)):
            directed[i]["layout"] = _photo_layout(preset_name, i + 1, total, order)

    paper_order = 0
    for slide in directed:
        free = not layout_uses_generated_image(slide.get("layout", "fullbleed"))
        slide["no_image"] = free
        if free and str(slide.get("layout", "")).startswith("bella_type_"):
            plan = slide.get("visual_plan") if isinstance(slide.get("visual_plan"), dict) else {}
            plan.setdefault("palette", _PAPER_CYCLE[paper_order % len(_PAPER_CYCLE)])
            slide["visual_plan"] = plan
            paper_order += 1


def layout_uses_generated_image(layout: str) -> bool:
    """Layouts puramente tipográficos não gastam uma geração de imagem."""
    return layout not in {
        "text_only",
        "bella_sequence_02",
        "bella_sequence_04",
        "bella_sequence_08",
        "bella_sequence_10",
        "bella_essential_04",
        "bella_type_fragments",
        "bella_type_escalation",
        "bella_type_pause",
        "bella_type_coverpaper",
        "bella_type_closepaper",
    }
