import unittest
from pathlib import Path

class TestApiKeysSecurity(unittest.TestCase):
    def test_settings_keys_backend_does_not_leak_raw_secrets(self):
        settings_file = Path(__file__).resolve().parents[1] / 'dashboard' / 'routes' / 'services' / 'settingsApiKeys.js'
        self.assertTrue(settings_file.exists())
        code = settings_file.read_text(encoding='utf-8')
        
        # Garante que não envia o valor puro no GET
        self.assertIn("value: isPublicConfig ? rawVal : ''", code)
        self.assertIn("masked: isSet ? maskValue(rawVal) : ''", code)
        
        # Garante que o POST ignora se o payload for uma máscara
        self.assertIn("strVal.includes('••')", code)

    def test_general_tab_frontend_protects_keys(self):
        tab_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Settings' / 'GeneralTab.jsx'
        self.assertTrue(tab_file.exists())
        code = tab_file.read_text(encoding='utf-8')
        
        # Garante que não há o botão ingênuo de reveal de texto plano da chave bruta
        self.assertNotIn("input.type = input.type === 'password' ? 'text' : 'password'", code)
        self.assertIn("Trocar Chave", code)
        self.assertIn("Protegida", code)

if __name__ == '__main__':
    unittest.main()
