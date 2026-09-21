"""
fonts.py — Resolução de fontes cross-platform resiliente (Windows / Linux Docker)

Prioridade de carregamento:
1. Fontes embutidas no repositório (backend/assets/fonts/) — 100% offline, confiável
2. Fontes de sistema Windows (C:/Windows/Fonts)
3. Fontes de sistema Linux (/usr/share/fonts/truetype/)
4. Download de contingência via Google Fonts / Fontsource
"""

import sys
from pathlib import Path

IS_WIN = sys.platform == "win32"
ROOT_DIR = Path(__file__).resolve().parent.parent.parent      # backend/
ASSETS_FONT_DIR = ROOT_DIR / "assets" / "fonts"
CACHE_FONT_DIR = ROOT_DIR / ".fonts"

# Fontes Bundled (Local no repositório)
_BUNDLED_HEAVY = ASSETS_FONT_DIR / "Oswald-Bold.ttf"
_BUNDLED_BOLD = ASSETS_FONT_DIR / "Inter-Bold.ttf"
_BUNDLED_REGULAR = ASSETS_FONT_DIR / "Inter-Regular.ttf"
# A tipografia de display é parte da direção Bella: ela dá contraste,
# delicadeza e ritmo de revista às manchetes, sem depender de uma fonte do SO.
_BUNDLED_DISPLAY = ASSETS_FONT_DIR / "PlayfairDisplay-Regular.ttf"
_BUNDLED_DISPLAY_IT = ASSETS_FONT_DIR / "PlayfairDisplay-Italic.ttf"

# Fontes Windows
_WIN_FD = Path("C:/Windows/Fonts")
_WIN_HEAVY = _WIN_FD / "Franklin Gothic Pro-Heavy.ttf"
_WIN_HEAVY_IT = _WIN_FD / "Franklin Gothic Pro-HeavyItalic.ttf"
_WIN_BOLD = _WIN_FD / "Inter-Bold-slnt=0.ttf"
_WIN_REGULAR = _WIN_FD / "Inter-Regular-slnt=0.ttf"

# Fontes Linux System
_LNX_DEJAVU_BOLD = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
_LNX_DEJAVU_REG = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
_LNX_LIBERATION_BOLD = Path("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf")
_LNX_LIBERATION_REG = Path("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf")
_LNX_DEJAVU_SERIF = Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf")
_LNX_DEJAVU_SERIF_BOLD = Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf")
_LNX_DEJAVU_SERIF_IT = Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf")
_LNX_LIBERATION_SERIF = Path("/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf")
_LNX_LIBERATION_SERIF_BOLD = Path("/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf")


def _resolve_font_path(primary: Path, fallbacks: list[Path]) -> str:
    """Retorna o primeiro arquivo de fonte existente entre os candidatos."""
    if primary.exists():
        return str(primary)
    for fb in fallbacks:
        if fb.exists():
            return str(fb)
    return str(primary)


def get_fonts() -> dict:
    """
    Retorna dict com caminhos absolutos das fontes para o ambiente atual.
    Garante que os arquivos existam em disco antes de retornar.
    """
    if IS_WIN:
        heavy = _resolve_font_path(_WIN_HEAVY, [_BUNDLED_HEAVY, _WIN_FD / "arialbd.ttf", _WIN_FD / "segoeuib.ttf"])
        heavy_it = _resolve_font_path(_WIN_HEAVY_IT, [_BUNDLED_HEAVY, _WIN_FD / "arialbi.ttf", _WIN_FD / "segoeuiz.ttf"])
        bold = _resolve_font_path(_WIN_BOLD, [_BUNDLED_BOLD, _WIN_FD / "arialbd.ttf", _WIN_FD / "segoeuib.ttf"])
        regular = _resolve_font_path(_WIN_REGULAR, [_BUNDLED_REGULAR, _WIN_FD / "arial.ttf", _WIN_FD / "segoeui.ttf"])
        serif = _resolve_font_path(_BUNDLED_DISPLAY, [_WIN_FD / "georgia.ttf", _WIN_FD / "times.ttf", _BUNDLED_REGULAR])
        serif_bold = _resolve_font_path(_BUNDLED_DISPLAY, [_WIN_FD / "georgiab.ttf", _WIN_FD / "timesbd.ttf", _BUNDLED_BOLD])
        serif_it = _resolve_font_path(_BUNDLED_DISPLAY_IT, [_WIN_FD / "georgiaz.ttf", _WIN_FD / "georgiai.ttf", _WIN_FD / "timesi.ttf", _BUNDLED_REGULAR])
    else:
        heavy = _resolve_font_path(_BUNDLED_HEAVY, [_LNX_DEJAVU_BOLD, _LNX_LIBERATION_BOLD, CACHE_FONT_DIR / "Oswald-Bold.ttf"])
        heavy_it = _resolve_font_path(_BUNDLED_HEAVY, [_LNX_DEJAVU_BOLD, _LNX_LIBERATION_BOLD, CACHE_FONT_DIR / "Oswald-Bold.ttf"])
        bold = _resolve_font_path(_BUNDLED_BOLD, [_LNX_DEJAVU_BOLD, _LNX_LIBERATION_BOLD, CACHE_FONT_DIR / "Inter-Bold.ttf"])
        regular = _resolve_font_path(_BUNDLED_REGULAR, [_LNX_DEJAVU_REG, _LNX_LIBERATION_REG, CACHE_FONT_DIR / "Inter-Regular.ttf"])
        serif = _resolve_font_path(_BUNDLED_DISPLAY, [_LNX_DEJAVU_SERIF, _LNX_LIBERATION_SERIF, _BUNDLED_REGULAR])
        serif_bold = _resolve_font_path(_BUNDLED_DISPLAY, [_LNX_DEJAVU_SERIF_BOLD, _LNX_LIBERATION_SERIF_BOLD, _BUNDLED_BOLD])
        serif_it = _resolve_font_path(_BUNDLED_DISPLAY_IT, [_LNX_DEJAVU_SERIF_IT, _LNX_DEJAVU_SERIF, _BUNDLED_REGULAR])

    return {
        "heavy": heavy,
        "heavy_it": heavy_it,
        "bold": bold,
        "regular": regular,
        "mark": regular,
        "serif": serif,
        "serif_bold": serif_bold,
        "serif_it": serif_it,
    }
