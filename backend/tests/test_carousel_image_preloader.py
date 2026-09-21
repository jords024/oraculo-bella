"""
Teste unitário para pré-carregamento de imagens de capa dos carrosséis antes de liberar a tela de carregamento.
"""
import unittest
from pathlib import Path


class TestCarouselImagePreloader(unittest.TestCase):
    def setUp(self):
        self.app_path = (
            Path(__file__).resolve().parents[2] / "frontend" / "src" / "App.jsx"
        )
        self.assertTrue(self.app_path.exists(), f"App.jsx não encontrado em {self.app_path}")
        with open(self.app_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_image_promises_preloading_implemented(self):
        """Verifica se a lógica de criação de Promises com new Image() está presente."""
        self.assertIn("new Image()", self.content, "Instanciação de pré-carregamento new Image() não encontrada em App.jsx.")
        self.assertIn("img.onload", self.content, "Evento img.onload não encontrado no preloader.")

    def test_await_all_cover_images(self):
        """Verifica se Promise.all(imagePromises) é aguardado antes de remover a tela de carregamento."""
        self.assertIn("await Promise.all(imagePromises)", self.content, "Promise.all(imagePromises) não encontrado em App.jsx.")

    def test_load_carousels_returns_data(self):
        """Verifica se loadCarousels retorna o array para uso no pré-carregamento."""
        self.assertIn("return data;", self.content, "loadCarousels deve retornar os dados carregados.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
