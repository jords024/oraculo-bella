"""
Teste unitário para a manutenção estática do título 'Oraculo' na aba do navegador,
garantindo a remoção de MutationObservers ruidosos que causavam oscilação rápida do título.
"""
import unittest
from pathlib import Path


class TestStaticOraculoTitle(unittest.TestCase):
    def setUp(self):
        self.main_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "src" / "main.jsx"
        )
        self.login_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "public" / "login.html"
        )
        self.index_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "index.html"
        )

    def test_index_html_has_oraculo_title(self):
        """Verifica se index.html tem <title>Oraculo</title> estático."""
        content = self.index_path.read_text(encoding="utf-8")
        self.assertIn("<title>Oraculo</title>", content)

    def test_login_html_has_oraculo_title(self):
        """Verifica se login.html tem <title>Oraculo</title> estático sem MutationObserver ruidoso."""
        content = self.login_path.read_text(encoding="utf-8")
        self.assertIn("<title>Oraculo</title>", content)
        self.assertNotIn("MutationObserver", content)

    def test_main_jsx_has_static_title(self):
        """Verifica se main.jsx possui document.title = 'Oraculo' sem MutationObserver ruidoso."""
        content = self.main_path.read_text(encoding="utf-8")
        self.assertIn('document.title = "Oraculo"', content)
        self.assertNotIn("MutationObserver", content)

if __name__ == "__main__":
    unittest.main(verbosity=2)
