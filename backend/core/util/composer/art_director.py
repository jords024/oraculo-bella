"""Regras centrais do Diretor Artístico Bella para geometria e densidade editorial."""

import re
from PIL import Image, ImageOps


def rgba_to_hex(color) -> str:
    """Converte uma tupla RGB(A) do Pillow em hex '#rrggbb' para uso no editor web."""
    try:
        r, g, b = color[0], color[1], color[2]
        return f'#{int(r):02x}{int(g):02x}{int(b):02x}'
    except Exception:
        return '#ffffff'


def clean_editorial_copy(value: str) -> str:
    """Remove marcas técnicas que nunca devem chegar à composição final."""
    text = str(value or '').replace(r'\n', '\n')
    text = re.sub(r'\*\*|__|`', '', text)
    text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
    return re.sub(r'[ \t]+', ' ', text).strip()


def crop_photo(image: Image.Image, size: tuple[int, int], focus=(0.5, 0.42)) -> Image.Image:
    """Preenche o quadro por recorte proporcional; jamais deforma ou estica a foto."""
    normalized = ImageOps.exif_transpose(image).convert('RGBA')
    return ImageOps.fit(normalized, size, method=Image.Resampling.LANCZOS, centering=focus)


def copy_density(title: str, body: str) -> str:
    words = len(f'{title} {body}'.split())
    if words <= 24:
        return 'airy'
    if words <= 48:
        return 'balanced'
    return 'dense'


def editorial_excerpt(value: str, max_words: int = 42) -> str:
    """Evita paredes de texto mantendo frases completas sempre que possível."""
    text = clean_editorial_copy(value)
    words = text.split()
    if len(words) <= max_words:
        return text
    shortened = ' '.join(words[:max_words])
    sentence_end = max(shortened.rfind('.'), shortened.rfind('!'), shortened.rfind('?'))
    return shortened[:sentence_end + 1] if sentence_end > len(shortened) * 0.55 else shortened.rstrip(',:;') + '…'
