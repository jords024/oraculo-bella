import unittest
from pathlib import Path
from PIL import Image, ImageDraw
import sys

# Ensure backend root is in path
backend_dir = Path(__file__).resolve().parents[1]
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from core.util.fonts import get_fonts
from core.util.composer.text_renderer import load_font, render_title, render_markup_block
from core.util.composer.presets import get_preset

class TestFontResolutionAndRendering(unittest.TestCase):
    def test_bundled_fonts_exist(self):
        fonts = get_fonts()
        self.assertIn("heavy", fonts)
        self.assertIn("bold", fonts)
        self.assertIn("regular", fonts)
        
        # Verify that all resolved paths actually exist on disk
        for font_type, path_str in fonts.items():
            self.assertTrue(Path(path_str).exists(), f"Fonte {font_type} apontando para caminho inexistente: {path_str}")

    def test_load_font_returns_correct_size(self):
        font_76 = load_font("non_existent_file.ttf", 76)
        font_40 = load_font("non_existent_file.ttf", 40)
        
        # Create a test image to measure bounding boxes
        img = Image.new("RGBA", (1080, 1350), (0, 0, 0, 255))
        draw = ImageDraw.Draw(img)
        
        bbox_76 = draw.textbbox((0, 0), "Título Grande de Teste", font=font_76)
        h_76 = bbox_76[3] - bbox_76[1]
        
        bbox_40 = draw.textbbox((0, 0), "Corpo de texto normal de teste", font=font_40)
        h_40 = bbox_40[3] - bbox_40[1]
        
        # Height of 76px font should be > 50px (never 10px from load_default)
        self.assertGreater(h_76, 50, f"Altura da fonte de 76px ficou em apenas {h_76}px (falha no carregamento TTF)")
        self.assertGreater(h_40, 25, f"Altura da fonte de 40px ficou em apenas {h_40}px (falha no carregamento TTF)")
        self.assertGreater(h_76, h_40, "A fonte de 76px deve ser significativamente maior que a de 40px")

    def test_compose_real_title_and_body_rendering(self):
        img = Image.new("RGBA", (1080, 1350), (0, 0, 0, 255))
        draw = ImageDraw.Draw(img)
        preset = get_preset("manuscrito_sagrado")
        
        end_y = render_title(draw, "O Elo Invisível entre Espiritualidade e Riqueza", 76, 84, 900, (255, 255, 255, 255))
        self.assertGreater(end_y, 900 + 70, "O título renderizado deve ocupar espaço real correspondente a 76px")

if __name__ == '__main__':
    unittest.main()
