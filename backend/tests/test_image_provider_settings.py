import unittest
from pathlib import Path
import os
import sys

backend_dir = Path(__file__).resolve().parents[1]
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

class TestImageProviderSettings(unittest.TestCase):
    def test_general_tab_has_select_provider_feedback(self):
        general_tab = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Settings' / 'GeneralTab.jsx'
        self.assertTrue(general_tab.exists())
        code = general_tab.read_text(encoding='utf-8')
        self.assertIn('selectProvider', code)
        self.assertIn('ACTIVE_IMAGE_PROVIDER', code)
        self.assertIn('Chaves de Imagem & IA', code)

    def test_gen_image_openai_resolves_active_provider(self):
        gen_file = Path(__file__).resolve().parents[1] / 'core' / 'util' / 'gen_image_openai.py'
        self.assertTrue(gen_file.exists())
        code = gen_file.read_text(encoding='utf-8')
        self.assertIn('os.getenv("ACTIVE_IMAGE_PROVIDER"', code)
        self.assertIn('dall-e-2', code)
        self.assertIn('dall-e-3', code)

if __name__ == '__main__':
    unittest.main()
