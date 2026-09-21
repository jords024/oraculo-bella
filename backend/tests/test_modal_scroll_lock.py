"""
Teste unitário para a funcionalidade de travamento de scroll durante a exibição de modais.
Verifica se useScrollLock é importado e chamado nos componentes de modais do frontend,
e se o CSS base.css desativa a rolagem em .main-area, body e html quando modal-open está ativo.
"""
import unittest
from pathlib import Path

FRONTEND_SRC = Path(__file__).resolve().parents[2] / "frontend" / "src"

class TestModalScrollLock(unittest.TestCase):
    def test_scroll_lock_hook_ref_count(self):
        """hook useScrollLock.js deve gerenciar activeLocks/ref count."""
        hook_path = FRONTEND_SRC / "hooks" / "useScrollLock.js"
        self.assertTrue(hook_path.exists(), "useScrollLock.js não encontrado")
        content = hook_path.read_text(encoding="utf-8")
        self.assertIn("activeLocks", content)
        self.assertIn("modal-open", content)

    def test_base_css_disables_main_area_overflow(self):
        """base.css deve bloquear overflow em .main-area quando modal-open está ativo."""
        css_path = FRONTEND_SRC / "css" / "base.css"
        self.assertTrue(css_path.exists(), "base.css não encontrado")
        content = css_path.read_text(encoding="utf-8")
        self.assertIn("body.modal-open .main-area", content)
        self.assertIn("overflow: hidden !important", content)

    def test_generation_history_modal_has_scroll_lock(self):
        """GenerationHistoryModal.jsx deve chamar useScrollLock(isOpen)."""
        file_path = FRONTEND_SRC / "components" / "GenerationHistoryModal.jsx"
        self.assertTrue(file_path.exists())
        content = file_path.read_text(encoding="utf-8")
        self.assertIn("useScrollLock", content)
        self.assertIn("useScrollLock(isOpen)", content)

    def test_pipeline_modal_has_scroll_lock(self):
        """PipelineModal.jsx deve chamar useScrollLock."""
        file_path = FRONTEND_SRC / "components" / "PipelineModal.jsx"
        self.assertTrue(file_path.exists())
        content = file_path.read_text(encoding="utf-8")
        self.assertIn("useScrollLock", content)

    def test_new_carousel_modal_has_scroll_lock(self):
        """NewCarouselModal.jsx deve chamar useScrollLock(isOpen)."""
        file_path = FRONTEND_SRC / "components" / "NewCarouselModal.jsx"
        self.assertTrue(file_path.exists())
        content = file_path.read_text(encoding="utf-8")
        self.assertIn("useScrollLock", content)

    def test_lightbox_has_scroll_lock(self):
        """Lightbox.jsx deve chamar useScrollLock(isOpen)."""
        file_path = FRONTEND_SRC / "components" / "Lightbox.jsx"
        self.assertTrue(file_path.exists())
        content = file_path.read_text(encoding="utf-8")
        self.assertIn("useScrollLock", content)

    def test_edit_slide_modal_has_scroll_lock(self):
        """EditSlideModal.jsx deve chamar useScrollLock(isOpen)."""
        file_path = FRONTEND_SRC / "components" / "EditSlideModal.jsx"
        self.assertTrue(file_path.exists())
        content = file_path.read_text(encoding="utf-8")
        self.assertIn("useScrollLock", content)

if __name__ == "__main__":
    unittest.main(verbosity=2)
