import unittest
from pathlib import Path


class TestReelsClonerTabs(unittest.TestCase):
    def setUp(self):
        # Localiza o arquivo ReelsCloner.jsx a partir do diretório do teste
        self.reels_cloner_path = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'ReelsCloner.jsx'
        self.assertTrue(self.reels_cloner_path.exists(), f"ReelsCloner.jsx não encontrado em {self.reels_cloner_path}")
        with open(self.reels_cloner_path, encoding='utf-8') as f:
            self.content = f.read()

    def test_active_section_state_exists(self):
        """Verifica se o estado activeSection foi declarado no componente"""
        self.assertIn('activeSection', self.content)
        self.assertIn("useState('cloner')", self.content)

    def test_tabs_buttons_exist(self):
        """Verifica se os botões de abas para Clonar Reels e Histórico existem com IDs apropriados"""
        self.assertIn('id="tab-cloner"', self.content)
        self.assertIn('id="tab-history"', self.content)
        self.assertIn('Clonar Reels', self.content)
        self.assertIn('Histórico', self.content)

    def test_conditional_rendering_exists(self):
        """Verifica se a renderização condicional das seções é feita com base no activeSection"""
        self.assertIn("activeSection === 'cloner'", self.content)
        self.assertIn("activeSection === 'history'", self.content)

if __name__ == '__main__':
    unittest.main()
