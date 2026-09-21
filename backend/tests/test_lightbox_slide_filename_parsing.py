"""
Teste unitário para tratamento de slides como objetos ({filename: 'slide-01.jpg'}) ou strings no Lightbox.
"""
import unittest
from pathlib import Path


class TestLightboxSlideFilenameParsing(unittest.TestCase):
    def setUp(self):
        self.file_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "src" / "components" / "Lightbox.jsx"
        )
        self.assertTrue(self.file_path.exists(), f"Lightbox.jsx não encontrado em {self.file_path}")
        with open(self.file_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_get_slide_filename_function_exists(self):
        """Verifica se a função getSlideFilename tratando objetos vs strings existe."""
        self.assertIn("getSlideFilename", self.content, "Função getSlideFilename não encontrada no Lightbox.jsx.")
        self.assertIn("typeof item === 'string'", self.content, "Checagem de tipo string não encontrada em getSlideFilename.")
        self.assertIn("item.filename", self.content, "Extração de item.filename não encontrada em getSlideFilename.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
