"""
Teste unitário para validação da atualização do modelo de imagem em regen-slide.py.
"""
import unittest
from pathlib import Path


class TestRegenSlideScript(unittest.TestCase):
    def setUp(self):
        self.script_path = (
            Path(__file__).resolve().parents[2] / "backend" / "regen-slide.py"
        )
        self.assertTrue(self.script_path.exists(), f"regen-slide.py não encontrado em {self.script_path}")
        with open(self.script_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_supports_all_layouts(self):
        """Verifica se regen-slide.py aceita dramatico, etereo, text_only, fullbleed e card."""
        for layout in ["fullbleed", "dramatico", "etereo", "text_only", "card"]:
            self.assertIn(f'"{layout}"', self.content, f"Layout {layout} não encontrado no choices do regen-slide.py.")

    def test_supports_gpt_image_models(self):
        """Verifica se regen-slide.py suporta gpt-image-1 e gpt-image-2."""
        self.assertIn('"gpt-image-1"', self.content, "gpt-image-1 deve ser suportado no regen-slide.py")
        self.assertIn('"gpt-image-2"', self.content, "gpt-image-2 deve ser suportado no regen-slide.py")

if __name__ == "__main__":
    unittest.main(verbosity=2)
