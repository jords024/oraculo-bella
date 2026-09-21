"""
Módulo de Composição Visual de Slides (Pillow Engine).
Exporta layouts, efeitos, renderizadores e presets unificados.
"""

from .presets import (
    W, H,
    MARGIN_C, MARGIN_L, MARGIN_R,
    MAX_TW_C, MAX_TW_L,
    PRESETS, DEFAULT_PRESET,
    get_preset
)
from .effects import (
    dark_gradient,
    add_vignette,
    fill_edges_black,
    add_film_grain,
    _watermarks,
    make_cosmic_bg
)
from .text_renderer import (
    load_font,
    parse_markup,
    seg_font,
    measure_segment,
    wrap_markup_lines,
    line_px_height,
    render_markup_block,
    render_title,
    fit_title_size
)
from .engine import (
    compose_fullbleed,
    compose_dramatico,
    compose_etereo,
    compose_text_only,
    compose_card,
    compose
)

__all__ = [
    "W", "H",
    "MARGIN_C", "MARGIN_L", "MARGIN_R",
    "MAX_TW_C", "MAX_TW_L",
    "PRESETS", "DEFAULT_PRESET",
    "get_preset",
    "dark_gradient",
    "add_vignette",
    "fill_edges_black",
    "add_film_grain",
    "_watermarks",
    "make_cosmic_bg",
    "load_font",
    "parse_markup",
    "seg_font",
    "measure_segment",
    "wrap_markup_lines",
    "line_px_height",
    "render_markup_block",
    "render_title",
    "fit_title_size",
    "compose_fullbleed",
    "compose_dramatico",
    "compose_etereo",
    "compose_text_only",
    "compose_card",
    "compose"
]
