"""
Teste unitário para a remoção total da string legada 'FONTE OCULTA' do estado inicial de branding no App.jsx.
"""
import unittest
from pathlib import Path


class TestInitialBrandingState(unittest.TestCase):
    def setUp(self):
        self.app_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "src" / "App.jsx"
        )
        self.assertTrue(self.app_path.exists(), f"App.jsx não encontrado em {self.app_path}")
        with open(self.app_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_no_legacy_fonte_oculta_in_branding_state(self):
        """Verifica se o estado inicial de useState(branding) não contém mais 'FONTE OCULTA'."""
        self.assertNotIn("companyName: 'FONTE OCULTA'", self.content, "App.jsx ainda possui 'FONTE OCULTA' no useState inicial do branding.")
        self.assertNotIn("logoText: 'FONTE OCULTA'", self.content, "App.jsx ainda possui 'FONTE OCULTA' no logoText inicial do branding.")

    def test_haucacau_in_initial_branding_state(self):
        """Verifica se Haucacau / @HAUCACAU está configurado como o estado inicial padrão de branding."""
        self.assertIn("companyName: 'Haucacau'", self.content, "Haucacau não está no useState inicial do branding em App.jsx.")
        self.assertIn("logoText: '@HAUCACAU'", self.content, "@HAUCACAU não está no useState inicial do branding em App.jsx.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
