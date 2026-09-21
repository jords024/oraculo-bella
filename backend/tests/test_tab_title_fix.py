"""
Teste unitário para a remoção do piscar do título da aba do navegador (document.title).
"""
import unittest
from pathlib import Path


class TestTabTitleFix(unittest.TestCase):
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

    def test_static_index_title(self):
        """Verifica se o index.html inicial não contém 'Fonte Oculta' hardcoded."""
        self.assertNotIn("Fonte Oculta — Dashboard", self.index_content, "index.html ainda possui 'Fonte Oculta' no <title>.")

    def test_app_title_fallback(self):
        """Verifica se o App.jsx usa logoText ou 'Haucacau' ao invés de 'FONTE'."""
        self.assertIn("branding?.companyName || branding?.logoText || 'Haucacau'", self.app_content, "Lógica de fallback de título no App.jsx inconsistente.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
