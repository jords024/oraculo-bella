"""
Teste unitário para a propriedade key única na tag <img> do Lightbox.jsx.
"""
import unittest
from pathlib import Path


class TestLightboxImageKeyFix(unittest.TestCase):
    def setUp(self):
        self.file_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "src" / "components" / "Lightbox.jsx"
        )
        self.assertTrue(self.file_path.exists(), f"Lightbox.jsx não encontrado em {self.file_path}")
        with open(self.file_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_img_tag_has_unique_key(self):
        """Verifica se a tag <img> possui a propriedade key única baseada em carouselId e currentSlide."""
        self.assertIn('key={`${carouselId}-${currentSlide}-${imageVersion}`}', self.content, "Propriedade key não encontrada na tag <img> do Lightbox.jsx.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
