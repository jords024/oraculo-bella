"""
Teste unitário para validar a correção do React Error #310 e erro 401 de carregamento de imagens.

1. Lightbox.jsx: Todos os useState devem ser declarados antes de qualquer cláusula condicional de return.
2. App.jsx: A URL de pré-carregamento de imagem de capa deve usar /image/ com token em vez de /slide/.
"""
import unittest
from pathlib import Path

FRONTEND_SRC = Path(__file__).resolve().parents[2] / "frontend" / "src"

class TestLightboxHooksAndImageAuthFix(unittest.TestCase):
    def test_lightbox_all_hooks_before_conditional_return(self):
        """Em Lightbox.jsx, nenhum useState deve existir após o 'if (!isOpen)'."""
        lightbox_path = FRONTEND_SRC / "components" / "Lightbox.jsx"
        self.assertTrue(lightbox_path.exists(), "Lightbox.jsx não encontrado")
        content = lightbox_path.read_text(encoding="utf-8")

        # Encontra a posição do 'if (!isOpen'
        return_pos = content.find("if (!isOpen")
        self.assertNotEqual(return_pos, -1, "Cláusula if (!isOpen) não encontrada em Lightbox.jsx")

        # Verifica que nenhum useState aparece APÓS essa linha
        after_return_content = content[return_pos:]
        self.assertNotIn(
            "useState(",
            after_return_content,
            "Erro de Hooks do React (#310): useState encontrado após return condicional em Lightbox.jsx!"
        )

    def test_app_jsx_preloader_uses_image_endpoint(self):
        """Em App.jsx, o pré-carregador deve usar /image/ com token em vez de /slide/."""
        app_path = FRONTEND_SRC / "App.jsx"
        self.assertTrue(app_path.exists(), "App.jsx não encontrado")
        content = app_path.read_text(encoding="utf-8")

        self.assertIn(
            "/api/carousels/${c.id}/image/${coverPath}?token=${token}",
            content,
            "URL de pré-carregamento em App.jsx deve ser /image/ com token"
        )
        self.assertNotIn(
            "/api/carousels/${c.id}/slide/${coverPath}",
            content,
            "URL antiga com /slide/ (retornando 401) ainda está presente em App.jsx"
        )

if __name__ == "__main__":
    unittest.main(verbosity=2)
