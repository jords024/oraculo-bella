import unittest
from pathlib import Path

class TestImageLightboxModal(unittest.TestCase):
    def test_lightbox_component_exists_and_conforms(self):
        modal_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Biblioteca' / 'ImageLightboxModal.jsx'
        self.assertTrue(modal_file.exists())
        code = modal_file.read_text(encoding='utf-8')
        
        # Validações de UI / Experiência do usuário (backdrop e sem fechar ao clicar no painel)
        self.assertIn('ImageLightboxModal', code)
        self.assertIn('e.stopPropagation()', code)
        self.assertIn('Copiar Link', code)
        self.assertIn('Baixar Imagem', code)
        self.assertIn('Fechar', code)

    def test_image_card_has_maximize_button(self):
        card_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Biblioteca' / 'ImageCard.jsx'
        self.assertTrue(card_file.exists())
        code = card_file.read_text(encoding='utf-8')
        self.assertIn('Maximizar visualização', code)
        self.assertIn('onPreview(image)', code)

    def test_biblioteca_modals_integrates_lightbox(self):
        modals_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Biblioteca' / 'BibliotecaModals.jsx'
        self.assertTrue(modals_file.exists())
        code = modals_file.read_text(encoding='utf-8')
        self.assertIn('ImageLightboxModal', code)
        self.assertIn('lightboxModalOpen', code)

if __name__ == '__main__':
    unittest.main()
