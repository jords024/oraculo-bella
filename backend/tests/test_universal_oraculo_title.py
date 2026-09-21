"""
Teste unitário para a fixação do título universal da aba do navegador como 'Oraculo'.
"""
import unittest
from pathlib import Path


class TestUniversalOraculoTitle(unittest.TestCase):
    def setUp(self):
        self.index_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "index.html"
        )
        with open(self.index_path, encoding="utf-8") as f:
            self.index_content = f.read()

        self.app_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "src" / "App.jsx"
        )
        with open(self.app_path, encoding="utf-8") as f:
            self.app_content = f.read()

    def test_static_title_is_oraculo(self):
        """Verifica se a tag <title> do index.html é estritamente 'Oraculo'."""
        self.assertIn("<title>Oraculo</title>", self.index_content, "index.html deve possuir <title>Oraculo</title>.")

    def test_app_title_is_fixed_oraculo(self):
        """Verifica se o App.jsx define document.title = 'Oraculo' de forma universal."""
        self.assertIn('document.title = "Oraculo";', self.app_content, "App.jsx deve definir document.title = 'Oraculo'.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
