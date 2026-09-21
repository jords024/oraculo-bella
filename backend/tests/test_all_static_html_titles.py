"""
Teste unitário para varrer TODOS os arquivos HTML das pastas frontend/public, frontend/dist e frontend/index.html
para garantir que a tag <title> seja estritamente 'Oraculo', eliminando qualquer oscilação de título de aba.
"""
import re
import unittest
from pathlib import Path

FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"

class TestAllStaticHtmlTitles(unittest.TestCase):
    def test_all_html_files_have_oraculo_title(self):
        """Verifica se todos os arquivos HTML em frontend possuem <title>Oraculo</title>."""
        html_files = list(FRONTEND_DIR.glob("**/*.html"))
        self.assertTrue(len(html_files) > 0, "Nenhum arquivo HTML encontrado em frontend")

        for html_path in html_files:
            content = html_path.read_text(encoding="utf-8")
            match = re.search(r"<title>(.*?)</title>", content, re.IGNORECASE)
            self.assertIsNotNone(match, f"Elemento <title> não encontrado em {html_path.relative_to(FRONTEND_DIR)}")
            title_text = match.group(1).strip()
            self.assertEqual(
                title_text,
                "Oraculo",
                f"Tag <title> em {html_path.relative_to(FRONTEND_DIR)} é '{title_text}', mas deveria ser estritamente 'Oraculo'"
            )

if __name__ == "__main__":
    unittest.main(verbosity=2)
