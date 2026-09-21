"""
Teste unitário para a remoção do window.confirm e implementação do popup de confirmação centralizado no Lightbox.
"""
import unittest
from pathlib import Path


class TestLightboxCustomDeleteModal(unittest.TestCase):
    def setUp(self):
        self.file_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "src" / "components" / "Lightbox.jsx"
        )
        self.assertTrue(self.file_path.exists(), f"Lightbox.jsx não encontrado em {self.file_path}")
        with open(self.file_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_no_window_confirm(self):
        """Garante que window.confirm não é utilizado para confirmar deleção."""
        self.assertNotIn("confirm(", self.content, "confirm() ainda está presente em Lightbox.jsx.")

    def test_delete_modal_state(self):
        """Verifica existência do estado isDeleteModalOpen."""
        self.assertIn("isDeleteModalOpen", self.content, "Estado isDeleteModalOpen não encontrado em Lightbox.jsx.")

    def test_modal_backdrop_click_prevention(self):
        """Verifica se o evento e.stopPropagation está configurado para não fechar ao clicar fora."""
        self.assertIn("onClick={(e) => e.stopPropagation()}", self.content, "Trava e.stopPropagation() não encontrada no modal.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
