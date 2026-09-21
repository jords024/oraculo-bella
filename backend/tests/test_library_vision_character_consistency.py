import unittest
from pathlib import Path

class TestLibraryVisionCharacterConsistency(unittest.TestCase):
    def test_library_chat_has_character_consistency_directives(self):
        chat_file = Path(__file__).resolve().parents[1] / 'dashboard' / 'routes' / 'library' / 'libraryChat.js'
        self.assertTrue(chat_file.exists())
        code = chat_file.read_text(encoding='utf-8')
        
        # Garante que não há mais textos engessados/hardcoded de banco de carro, barba ou corrente de prata
        self.assertNotIn("car interior driver seat setting", code)
        self.assertNotIn("silver chain necklace", code)
        
        # Garante diretrizes universais de preservação de estilo (anime, cartoon, 3D, foto) e modificação direcionada
        self.assertIn("Art Style & Medium Fidelity", code)
        self.assertIn("Subject & Identity Consistency", code)
        self.assertIn("Targeted Transformation", code)
        self.assertIn("detail: 'high'", code)

if __name__ == '__main__':
    unittest.main()
