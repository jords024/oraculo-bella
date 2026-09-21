import unittest
from pathlib import Path

class TestLoginFooterBranding(unittest.TestCase):
    def setUp(self):
        root = Path(__file__).resolve().parents[2]
        self.login_jsx_path = root / 'frontend' / 'src' / 'components' / 'Login.jsx'
        self.login_html_path = root / 'frontend' / 'public' / 'login.html'

    def test_login_jsx_footer_note(self):
        self.assertTrue(self.login_jsx_path.exists(), f'Login.jsx não encontrado em {self.login_jsx_path}')
        content = self.login_jsx_path.read_text(encoding='utf-8')
        self.assertNotIn('@afonteoculta', content, 'Login.jsx ainda contém @afonteoculta')
        self.assertIn('Oraculo · Plataforma Interna', content, 'Login.jsx não contém o rodapé padrão Oraculo · Plataforma Interna')

    def test_login_html_footer_note(self):
        self.assertTrue(self.login_html_path.exists(), f'login.html não encontrado em {self.login_html_path}')
        content = self.login_html_path.read_text(encoding='utf-8')
        self.assertNotIn('@afonteoculta', content, 'login.html ainda contém @afonteoculta')
        self.assertIn('Oraculo · Plataforma Interna', content, 'login.html não contém o rodapé padrão Oraculo · Plataforma Interna')

if __name__ == '__main__':
    unittest.main()
