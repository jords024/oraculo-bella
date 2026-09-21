"""
Teste unitário para a sincronização imediata do Nome da Empresa (companyName) com o título da aba e o cache no localStorage.
"""
import unittest
from pathlib import Path


class TestCompanyNameTabSync(unittest.TestCase):
    def setUp(self):
        self.app_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "src" / "App.jsx"
        )
        self.assertTrue(self.app_path.exists(), f"App.jsx não encontrado em {self.app_path}")
        with open(self.app_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_localstorage_branding_cache(self):
        """Verifica se o branding é lido e salvo no localStorage para persistência de título."""
        self.assertIn("localStorage.getItem('fo_branding')", self.content, "Leitura do fo_branding no localStorage não encontrada em App.jsx.")
        self.assertIn("localStorage.setItem('fo_branding'", self.content, "Escrita do fo_branding no localStorage não encontrada em App.jsx.")

    def test_company_name_syncs_with_title(self):
        """Verifica se o document.title utiliza dinamicamente branding.companyName."""
        self.assertIn("const titleName = branding?.companyName", self.content, "Sincronização de document.title com companyName não encontrada em App.jsx.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
