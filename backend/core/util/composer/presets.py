"""
Presets Visuais e Constantes de Dimensão para Composição de Slides.
"""

from core.util.fonts import get_fonts as _get_fonts

W, H = 1080, 1350
MARGIN_C = 92    # margem para texto centralizado
MARGIN_L = 84    # margem esquerda para texto left-aligned
MARGIN_R = 84    # margem direita
MAX_TW_C = W - MARGIN_C * 2   # 920px centralizado
MAX_TW_L = W - MARGIN_L - MARGIN_R  # 936px left

_FONTS = _get_fonts()
F_HEAVY = _FONTS["heavy"]
F_HEAVY_IT = _FONTS["heavy_it"]
F_BOLD = _FONTS["bold"]
F_REGULAR = _FONTS["regular"]
F_MARK = _FONTS["mark"]
F_SERIF = _FONTS.get("serif", F_REGULAR)
F_SERIF_BOLD = _FONTS.get("serif_bold", F_BOLD)
F_SERIF_IT = _FONTS.get("serif_it", F_HEAVY_IT)

PRESETS = {
    "bella_organico_terracota": {
        "bg"              : (250, 246, 240, 255),   # #FAF6F0 Creme Luxuoso Orgânico
        "accent_color"    : (193, 120,  79, 255),   # #C1784F Terracota
        "title_color"     : (43,   26,  18, 255),   # Marrom Terra Profundo
        "body_color"      : (60,   42,  30, 255),   # Terra Suave
        "bold_color"      : (193, 120,  79, 255),   # Terracota
        "italic_color"    : (92,  122,  94, 255),   # Verde-musgo
        "watermark_color" : (193, 120,  79, 220),   # Terracota suave
        "card_bg"         : (255, 255, 255, 255),   # Branco puro
        "card_border"     : (193, 120,  79, 140),
        "badge_bg"        : (193, 120,  79, 255),   # Terracota
        "badge_text"      : (250, 246, 240, 255),   # Creme
        "gradient_tint"   : (43,   26,  18),
        "gradient_start"  : 0.35,
        "gradient_max"    : 240,
        "title_px"        : 78,
        "title_min_px"    : 38,
        "body_px"         : 36,
        "body_min_px"     : 28,
        "film_grain"      : False,
        "vignette"        : False,
        "font_family"     : "serif",
    },

    "bella_verde_musgo": {
        "bg"              : (92,  122,  94, 255),   # #5C7A5E Verde-musgo Botânico
        "accent_color"    : (193, 120,  79, 255),   # #C1784F Terracota
        "title_color"     : (250, 246, 240, 255),   # Creme
        "body_color"      : (240, 235, 228, 255),
        "bold_color"      : (255, 255, 255, 255),
        "italic_color"    : (201, 151,  58, 255),   # Âmbar
        "watermark_color" : (250, 246, 240, 200),
        "card_bg"         : (250, 246, 240, 255),
        "card_border"     : (193, 120,  79, 140),
        "badge_bg"        : (193, 120,  79, 255),
        "badge_text"      : (250, 246, 240, 255),
        "gradient_tint"   : (35,   55,  38),
        "gradient_start"  : 0.35,
        "gradient_max"    : 245,
        "title_px"        : 78,
        "title_min_px"    : 38,
        "body_px"         : 36,
        "body_min_px"     : 28,
        "film_grain"      : False,
        "vignette"        : False,
        "font_family"     : "serif",
    },

    "bella_ambar_sagrado": {
        "bg"              : (45,   30,  15, 255),   # Âmbar Profundo
        "accent_color"    : (201, 151,  58, 255),   # #C9973A Âmbar Dourado
        "title_color"     : (250, 246, 240, 255),   # Creme
        "body_color"      : (240, 230, 215, 255),
        "bold_color"      : (201, 151,  58, 255),
        "italic_color"    : (193, 120,  79, 255),
        "watermark_color" : (201, 151,  58, 220),
        "card_bg"         : (250, 246, 240, 255),
        "card_border"     : (201, 151,  58, 140),
        "badge_bg"        : (201, 151,  58, 255),
        "badge_text"      : (250, 246, 240, 255),
        "gradient_tint"   : (45,   30,  15),
        "gradient_start"  : 0.35,
        "gradient_max"    : 245,
        "title_px"        : 78,
        "title_min_px"    : 38,
        "body_px"         : 36,
        "body_min_px"     : 28,
        "film_grain"      : False,
        "vignette"        : False,
        "font_family"     : "serif",
    },

    "brands_decoded_principal": {
        "bg"              : (13,  13,  13, 255),    # #0D0D0D Deep charcoal
        "accent_color"    : (255, 51,   0, 255),    # #FF3300 Vibrant Red-Orange
        "title_color"     : (255, 255, 255, 255),
        "body_color"      : (240, 240, 240, 255),
        "bold_color"      : (255, 255, 255, 255),
        "italic_color"    : (255, 120,  80, 255),
        "watermark_color" : (255, 255, 255, 200),
        "card_bg"         : (244, 241, 234, 255),   # #F4F1EA Off-White/Beige
        "card_border"     : (255,  51,   0, 180),
        "badge_bg"        : (255,  51,   0, 255),
        "badge_text"      : (255, 255, 255, 255),
        "gradient_tint"   : (13,  13,  13),
        "gradient_start"  : 0.35,
        "gradient_max"    : 245,
        "title_px"        : 84,
        "title_min_px"    : 40,
        "body_px"         : 36,
        "body_min_px"     : 28,
        "film_grain"      : False,
        "vignette"        : True,
        "font_family"     : "condensed",
    },

    "brands_decoded_autoral": {
        "bg"              : (43,  14,   9, 255),    # #2B0E09 Deep Burgundy / Bordeaux
        "accent_color"    : (230, 46,   0, 255),    # #E62E00 Terracotta / Crimson
        "title_color"     : (255, 255, 255, 255),
        "body_color"      : (245, 239, 235, 255),   # #F5EFEB Luxury Cream
        "bold_color"      : (255, 215, 180, 255),
        "italic_color"    : (255, 140, 100, 255),
        "watermark_color" : (230, 180, 150, 200),
        "card_bg"         : (245, 239, 235, 255),   # #F5EFEB Cream
        "card_border"     : (230,  46,   0, 180),
        "badge_bg"        : (230,  46,   0, 255),
        "badge_text"      : (255, 255, 255, 255),
        "gradient_tint"   : (43,  14,   9),
        "gradient_start"  : 0.32,
        "gradient_max"    : 250,
        "title_px"        : 80,
        "title_min_px"    : 38,
        "body_px"         : 36,
        "body_min_px"     : 28,
        "film_grain"      : False,
        "vignette"        : True,
        "font_family"     : "serif",
    },

    "manuscrito_sagrado": {
        "bg"              : (8,   6,   4,  255),
        "title_color"     : (255, 255, 255, 255),
        "body_color"      : (240, 232, 208, 255),
        "bold_color"      : (255, 255, 255, 255),
        "italic_color"    : (230, 215, 175, 255),
        "watermark_color" : (180, 150,  60, 200),
        "card_bg"         : (12,  10,   6,  255),
        "card_border"     : (201, 160,  53, 100),
        "gradient_tint"   : (30,  18,   2),
        "gradient_start"  : 0.36,
        "gradient_max"    : 238,
        "title_px"        : 76,
        "title_min_px"    : 36,
        "body_px"         : 40,
        "body_min_px"     : 30,
        "film_grain"      : False,
        "vignette"        : True,
    },

    "cinematografico": {
        "bg"              : (4,   4,   8,  255),
        "title_color"     : (255, 255, 255, 255),
        "body_color"      : (210, 225, 248, 255),
        "bold_color"      : (255, 255, 255, 255),
        "italic_color"    : (180, 210, 255, 255),
        "watermark_color" : (80, 130, 220, 160),
        "card_bg"         : (6,   6,  14,  255),
        "card_border"     : (26,  110, 255,  90),
        "gradient_tint"   : (2,   4,  22),
        "gradient_start"  : 0.38,
        "gradient_max"    : 240,
        "title_px"        : 76,
        "title_min_px"    : 36,
        "body_px"         : 40,
        "body_min_px"     : 30,
        "film_grain"      : False,
        "vignette"        : True,
    },

    "cinematografico_crimson": {
        "bg"              : (6,   2,   2,  255),
        "title_color"     : (255, 255, 255, 255),
        "body_color"      : (245, 220, 220, 255),
        "bold_color"      : (255, 255, 255, 255),
        "italic_color"    : (255, 190, 190, 255),
        "watermark_color" : (180,  60,  60, 180),
        "card_bg"         : (14,   4,   4,  255),
        "card_border"     : (200,  30,  30,  90),
        "gradient_tint"   : (20,   2,   2),
        "gradient_start"  : 0.36,
        "gradient_max"    : 240,
        "title_px"        : 76,
        "title_min_px"    : 36,
        "body_px"         : 40,
        "body_min_px"     : 30,
        "film_grain"      : False,
        "vignette"        : True,
    },

    "esoterico_minimalista": {
        "bg"              : (4,   2,   8,  255),
        "title_color"     : (255, 255, 255, 255),
        "body_color"      : (230, 222, 248, 255),
        "bold_color"      : (255, 255, 255, 255),
        "italic_color"    : (210, 195, 245, 255),
        "watermark_color" : (140,  90, 200, 170),
        "card_bg"         : (8,   4,  16,  255),
        "card_border"     : (120,  60, 200,  90),
        "gradient_tint"   : (12,   4,  22),
        "gradient_start"  : 0.30,
        "gradient_max"    : 252,
        "title_px"        : 76,
        "title_min_px"    : 36,
        "body_px"         : 40,
        "body_min_px"     : 30,
        "film_grain"      : False,
        "vignette"        : True,
    },

    "dramatico": {
        "bg"              : (2,   2,   3,  255),
        "title_color"     : (255, 255, 255, 255),
        "body_color"      : (238, 234, 222, 255),
        "bold_color"      : (255, 255, 255, 255),
        "italic_color"    : (230, 210, 160, 255),
        "watermark_color" : (160, 130,  50, 180),
        "card_bg"         : (6,   6,   8,  255),
        "card_border"     : (180, 140,  40,  80),
        "gradient_tint"   : (0,   0,   0),
        "gradient_start"  : 0.30,
        "gradient_max"    : 252,
        "title_px"        : 84,
        "title_min_px"    : 38,
        "body_px"         : 44,
        "body_min_px"     : 32,
        "film_grain"      : True,
        "vignette"        : True,
    },

    "etereo_luminoso": {
        "bg"              : (8,   7,   5,  255),
        "title_color"     : (255, 255, 255, 255),
        "body_color"      : (245, 238, 220, 255),
        "bold_color"      : (255, 255, 255, 255),
        "italic_color"    : (240, 220, 170, 255),
        "watermark_color" : (190, 160,  80, 190),
        "card_bg"         : (14,  12,   8,  255),
        "card_border"     : (210, 175,  70,  90),
        "gradient_tint"   : (20,  14,   4),
        "gradient_start"  : 0.38,
        "gradient_max"    : 232,
        "title_px"        : 76,
        "title_min_px"    : 36,
        "body_px"         : 42,
        "body_min_px"     : 32,
        "film_grain"      : False,
        "vignette"        : False,
    },
}

PRESETS["sagrado"] = PRESETS["manuscrito_sagrado"]
PRESETS["bella_editorial_luxo"] = {
    **PRESETS["bella_organico_terracota"],
    "bg": (18, 17, 15, 255),
    "accent_color": (184, 98, 62, 255),
    "title_color": (250, 247, 241, 255),
    "body_color": (236, 230, 220, 255),
    "bold_color": (255, 255, 255, 255),
    "italic_color": (222, 198, 172, 255),
    "watermark_color": (235, 226, 214, 205),
    "gradient_tint": (12, 10, 8),
    "gradient_start": 0.44,
    "gradient_max": 232,
    "title_px": 82,
    "title_min_px": 40,
    "body_px": 33,
    "body_min_px": 25,
    "film_grain": True,
    "vignette": True,
    "font_family": "serif",
}
PRESETS["bella_essencial"] = {
    **PRESETS["bella_editorial_luxo"],
    "bg": (17, 16, 15, 255),
    "accent_color": (184, 98, 62, 255),
    "title_color": (247, 242, 233, 255),
    "body_color": (247, 242, 233, 255),
    "gradient_start": 0.68,
    "gradient_max": 255,
    "title_px": 64,
    "title_min_px": 43,
    "body_px": 34,
    "body_min_px": 27,
    "film_grain": False,
    "vignette": False,
    "font_family": "sans",
}
DEFAULT_PRESET = "bella_organico_terracota"

def get_preset(name: str) -> dict:
    return PRESETS.get(name, PRESETS[DEFAULT_PRESET])
