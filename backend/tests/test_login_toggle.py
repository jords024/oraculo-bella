import unittest
from pathlib import Path


class TestLoginPageTogglePassword(unittest.TestCase):
    def setUp(self):
        # Localiza o arquivo login.html a partir do diretório do teste
        self.login_html_path = Path(__file__).resolve().parents[2] / 'frontend' / 'public' / 'login.html'
        self.assertTrue(self.login_html_path.exists(), f"login.html não encontrado em {self.login_html_path}")
        with open(self.login_html_path, encoding='utf-8') as f:
            self.content = f.read()

    def test_password_input_exists(self):
        """Verifica se o input do tipo password com o id correto existe"""
        self.assertIn('id="passwordInput"', self.content)
        self.assertIn('type="password"', self.content)

    def test_toggle_button_exists(self):
        """Verifica se o botão de alternar visualização da senha existe e tem o id correto"""
        self.assertIn('id="togglePassword"', self.content)
        self.assertIn('id="eyeIcon"', self.content)

    def test_javascript_logic_present(self):
        """Verifica se a lógica em JavaScript para alternar o tipo de input e SVG está presente"""
        self.assertIn('passwordInput.getAttribute(\'type\')', self.content)
        self.assertIn('passwordInput.setAttribute(\'type\'', self.content)
        self.assertIn('eyeIcon.innerHTML = eyeOpenSvg', self.content)
        self.assertIn('eyeIcon.innerHTML = eyeClosedSvg', self.content)
        self.assertIn('togglePassword.addEventListener(\'click\'', self.content)

if __name__ == '__main__':
    unittest.main()
