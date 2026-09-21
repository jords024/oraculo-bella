import unittest
from pathlib import Path

class TestLibraryChatMessageReferences(unittest.TestCase):
    def test_chat_messages_renders_reference_images(self):
        chat_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Biblioteca' / 'ChatMessages.jsx'
        self.assertTrue(chat_file.exists())
        code = chat_file.read_text(encoding='utf-8')
        
        # Garante que as referências são renderizadas na bolha do usuário
        self.assertIn('msg.references', code)
        self.assertIn('Referência Anexada', code)
        self.assertIn('onPreviewImage', code)

    def test_use_biblioteca_chat_includes_references_in_temp_message(self):
        hook_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Biblioteca' / 'useBibliotecaChat.js'
        self.assertTrue(hook_file.exists())
        code = hook_file.read_text(encoding='utf-8')
        
        self.assertIn('references: currentRefs.map', code)

    def test_backend_library_chat_persists_references_in_user_msg(self):
        backend_file = Path(__file__).resolve().parents[1] / 'dashboard' / 'routes' / 'library' / 'libraryChat.js'
        self.assertTrue(backend_file.exists())
        code = backend_file.read_text(encoding='utf-8')
        
        self.assertIn('references: referencesInfo.map', code)

if __name__ == '__main__':
    unittest.main()
