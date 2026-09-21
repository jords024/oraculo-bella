"""
Testes unitários para a correção da tela preta no Lightbox.

Cobre:
  - Opção A (frontend): estado imageError no Lightbox.jsx
  - Opção B (backend): proxy de imagem via b2.getImageStream em vez de redirect
"""
import unittest
from pathlib import Path

LIGHTBOX_PATH = (
    Path(__file__).resolve().parents[2] / "frontend" / "src" / "components" / "Lightbox.jsx"
)
CAROUSELS_ROUTE_PATH = (
    Path(__file__).resolve().parents[1] / "dashboard" / "routes" / "carousels.js"
)
B2_PATH = (
    Path(__file__).resolve().parents[1] / "dashboard" / "b2.js"
)


class TestLightboxImageError(unittest.TestCase):
    """Opção A — Frontend: estado imageError para evitar tela preta."""

    def setUp(self):
        self.assertTrue(LIGHTBOX_PATH.exists(), f"Lightbox.jsx não encontrado em {LIGHTBOX_PATH}")
        with open(LIGHTBOX_PATH, encoding="utf-8") as f:
            self.content = f.read()

    def test_image_error_state_declared(self):
        """Estado imageError deve ser declarado via useState."""
        self.assertIn(
            "useState(false)",
            self.content,
            "imageError useState(false) não encontrado em Lightbox.jsx"
        )
        self.assertIn(
            "imageError",
            self.content,
            "Estado imageError não encontrado em Lightbox.jsx"
        )

    def test_set_image_error_on_onerror(self):
        """onError da tag img deve chamar setImageError(true) para acionar o estado de erro."""
        self.assertIn(
            "setImageError(true)",
            self.content,
            "setImageError(true) não encontrado no handler onError da imagem"
        )

    def test_image_error_resets_on_index_change(self):
        """Ao trocar de slide, imageError deve ser resetado para false."""
        self.assertIn(
            "setImageError(false)",
            self.content,
            "setImageError(false) não encontrado nos useEffects de reset"
        )

    def test_error_ui_renders_retry_button(self):
        """A UI de erro deve conter um botão de retry."""
        self.assertIn(
            "Tentar novamente",
            self.content,
            "Botão 'Tentar novamente' não encontrado no painel de erro do Lightbox"
        )

    def test_error_ui_renders_error_message(self):
        """A UI de erro deve exibir mensagem de erro ao usuário."""
        self.assertIn(
            "Erro ao carregar imagem",
            self.content,
            "Mensagem 'Erro ao carregar imagem' não encontrada no painel de erro"
        )

    def test_image_loading_state_still_exists(self):
        """Estado imageLoading deve continuar existindo (não foi removido)."""
        self.assertIn(
            "imageLoading",
            self.content,
            "Estado imageLoading foi removido — não deveria ter sido"
        )

    def test_error_state_not_shown_when_loading(self):
        """O painel de erro (imageError) e o spinner (imageLoading) são condições independentes."""
        self.assertIn("imageError ?", self.content)
        self.assertIn("imageLoading &&", self.content)


class TestBackendImageProxy(unittest.TestCase):
    """Opção B — Backend: proxy de imagem em vez de redirect 302."""

    def setUp(self):
        self.assertTrue(CAROUSELS_ROUTE_PATH.exists(), "carousels.js não encontrado")
        with open(CAROUSELS_ROUTE_PATH, encoding="utf-8") as f:
            self.carousels_content = f.read()

        self.assertTrue(B2_PATH.exists(), "b2.js não encontrado")
        with open(B2_PATH, encoding="utf-8") as f:
            self.b2_content = f.read()

    def test_no_redirect_302_for_b2_images(self):
        """A rota de imagem não deve mais fazer res.redirect(302) para URLs do MinIO."""
        # Verifica que o redirect 302 foi removido da rota de imagem
        # O redirect para download pode ainda existir, mas não deve ser no bloco isUploadedToB2
        lines = self.carousels_content.split("\n")
        in_image_route = False
        redirect_in_image_route = False
        for i, line in enumerate(lines):
            if '/api/carousels/:id/image/:filename' in line:
                in_image_route = True
            if in_image_route and 'res.redirect(302' in line:
                redirect_in_image_route = True
                break
            # Para quando encontra a próxima rota
            if in_image_route and i > 10 and line.strip().startswith("router."):
                break
        self.assertFalse(
            redirect_in_image_route,
            "Ainda há res.redirect(302) na rota /api/carousels/:id/image/:filename — deve usar proxy"
        )

    def test_proxy_uses_get_image_stream(self):
        """A rota de imagem deve usar b2.getImageStream para fazer proxy interno."""
        self.assertIn(
            "b2.getImageStream",
            self.carousels_content,
            "b2.getImageStream não encontrado na rota de imagem — proxy não implementado"
        )

    def test_proxy_pipes_stream_to_response(self):
        """O stream da imagem deve ser direcionado (pipe) para a resposta HTTP."""
        self.assertIn(
            "stream.pipe(res)",
            self.carousels_content,
            "stream.pipe(res) não encontrado — o proxy não está transmitindo a imagem"
        )

    def test_proxy_has_fallback_on_error(self):
        """Em caso de erro no proxy MinIO, deve haver fallback para disco local."""
        self.assertIn(
            "Imagem indisponível no armazenamento remoto",
            self.carousels_content,
            "Mensagem de fallback de erro não encontrada na rota de imagem"
        )

    def test_get_image_stream_exists_in_b2(self):
        """b2.js deve exportar a função getImageStream para suportar o proxy."""
        self.assertIn(
            "export async function getImageStream",
            self.b2_content,
            "Função getImageStream não exportada em b2.js"
        )

    def test_get_image_stream_uses_get_object_command(self):
        """getImageStream deve usar GetObjectCommand do SDK S3 para obter o stream."""
        self.assertIn(
            "GetObjectCommand",
            self.b2_content,
            "GetObjectCommand não encontrado em b2.js"
        )

    def test_get_image_stream_returns_body(self):
        """getImageStream deve retornar res.Body (o stream legível do S3)."""
        self.assertIn(
            "return res.Body",
            self.b2_content,
            "getImageStream não retorna res.Body em b2.js"
        )

    def test_content_type_set_in_proxy(self):
        """O proxy deve definir o Content-Type correto (image/png ou image/jpeg)."""
        self.assertIn(
            "Content-Type",
            self.carousels_content,
            "Content-Type não está sendo definido na rota de imagem proxy"
        )
        self.assertIn(
            "image/png",
            self.carousels_content,
            "Tipo image/png não configurado no proxy"
        )
        self.assertIn(
            "image/jpeg",
            self.carousels_content,
            "Tipo image/jpeg não configurado no proxy"
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
