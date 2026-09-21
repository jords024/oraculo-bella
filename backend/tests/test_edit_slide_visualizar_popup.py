"""
Teste unitário para a mensagem diferenciada no popup de carregamento na ação Visualizar.
"""
import unittest
from pathlib import Path


class TestEditSlideModalVisualizarPopup(unittest.TestCase):
    def setUp(self):
        self.file_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "src" / "components" / "EditSlideModal.jsx"
        )
        self.assertTrue(self.file_path.exists(), f"EditSlideModal.jsx não encontrado em {self.file_path}")
        with open(self.file_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_loading_action_state_exists(self):
        """Verifica se o estado loadingAction existe no EditSlideModal.jsx."""
        self.assertIn("loadingAction", self.content, "Estado loadingAction não encontrado em EditSlideModal.jsx.")

    def test_visualizar_text_in_popup(self):
        """Verifica se a mensagem 'Abrindo Visualização...' é exibida ao clicar em Visualizar."""
        self.assertIn("Abrindo Visualização...", self.content, "Mensagem 'Abrindo Visualização...' não encontrada no popup.")
        self.assertIn("para visualização", self.content, "Texto 'para visualização' não encontrado no popup.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
