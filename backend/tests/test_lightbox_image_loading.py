"""
Teste unitário para a tela de carregamento de imagem no Lightbox.
Atualizado para cobrir também o estado imageError (correção da tela preta).
"""
import unittest
from pathlib import Path


class TestLightboxImageLoading(unittest.TestCase):
    def setUp(self):
        self.file_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "src" / "components" / "Lightbox.jsx"
        )
        self.assertTrue(self.file_path.exists(), f"Lightbox.jsx não encontrado em {self.file_path}")
        with open(self.file_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_image_loading_state_exists(self):
        """Verifica se o estado imageLoading existe em Lightbox.jsx."""
        self.assertIn("imageLoading", self.content, "Estado imageLoading não encontrado em Lightbox.jsx.")

    def test_onload_handler_resets_loading(self):
        """Verifica se o evento onLoad desativa o estado de carregamento."""
        self.assertIn("onLoad={() => setImageLoading(false)}", self.content, "onLoad handler não encontrado na tag img.")

    def test_loading_spinner_text(self):
        """Verifica se a tela de carregamento contém o texto 'Carregando Imagem...'."""
        self.assertIn("Carregando Imagem...", self.content, "Texto 'Carregando Imagem...' não encontrado na overlay de carregamento.")

    def test_image_error_state_exists(self):
        """Verifica se o estado imageError existe para evitar tela preta em falhas de carga."""
        self.assertIn("imageError", self.content, "Estado imageError não encontrado em Lightbox.jsx.")

    def test_onerror_sets_image_error_true(self):
        """Verifica se onError seta imageError para true (exibir painel de erro em vez de tela preta)."""
        self.assertIn("setImageError(true)", self.content, "setImageError(true) não encontrado no onError da imagem.")

    def test_error_panel_has_retry_button(self):
        """Verifica se o painel de erro tem botão de tentar novamente."""
        self.assertIn("Tentar novamente", self.content, "Botão de retry não encontrado no painel de erro.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
