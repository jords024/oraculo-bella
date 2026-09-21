"""
Teste unitário para o Popup Modal de Carregamento ao recriar/recompor slide no EditSlideModal.jsx.
"""
import unittest
from pathlib import Path


class TestEditSlideModalLoadingPopup(unittest.TestCase):
    def setUp(self):
        self.file_path = (
            Path(__file__).resolve().parents[2]
            / "frontend" / "src" / "components" / "EditSlideModal.jsx"
        )
        self.assertTrue(self.file_path.exists(), f"EditSlideModal.jsx não encontrado em {self.file_path}")
        with open(self.file_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_popup_overlay_rendered_when_saving(self):
        """Verifica se o overlay/popup de saving está implementado no modal."""
        self.assertIn("saving &&", self.content, "Condicional de saving para exibir o popup não encontrada.")

    def test_popup_mentions_slide_number(self):
        """Verifica se o popup exibe a identificação do slide que está sendo recriado."""
        self.assertIn("slideDisplayNum", self.content, "Lógica para exibir número do slide no popup não encontrada.")

    def test_popup_has_backdrop_and_spinner(self):
        """Verifica presença do spinner de animação e fundo escuro (backdrop) centralizado."""
        self.assertIn("animation: 'spin", self.content, "Animação de spinner do popup não encontrada.")
        self.assertIn("backdropFilter", self.content, "Efeito de blur/backdrop do popup não encontrado.")


if __name__ == "__main__":
    unittest.main(verbosity=2)
