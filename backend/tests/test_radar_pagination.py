import unittest
from pathlib import Path


class TestRadarPagination(unittest.TestCase):
    def setUp(self):
        # Localiza o arquivo Radar.jsx a partir do diretório do teste
        self.radar_path = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Radar.jsx'
        self.assertTrue(self.radar_path.exists(), f"Radar.jsx não encontrado em {self.radar_path}")
        with open(self.radar_path, encoding='utf-8') as f:
            self.content = f.read()

    def test_pagination_states_exist(self):
        """Verifica se os estados de paginação e itens por página foram declarados no componente"""
        self.assertIn('currentPage', self.content)
        self.assertIn('itemsPerPage', self.content)
        self.assertIn("useState(1)", self.content)
        self.assertIn("useState(10)", self.content)

    def test_dropdown_exists(self):
        """Verifica se o seletor dropdown e as opções de quantidade por página estão presentes"""
        self.assertIn('id="items-per-page-select"', self.content)
        self.assertIn('value={10}', self.content)
        self.assertIn('value={25}', self.content)
        self.assertIn('value={50}', self.content)
        self.assertIn('value={100}', self.content)

    def test_pagination_controls_exist(self):
        """Verifica se os botões de controle de páginas e os IDs apropriados existem"""
        self.assertIn('id="btn-prev-page"', self.content)
        self.assertIn('id="btn-next-page"', self.content)
        self.assertIn('Anterior', self.content)
        self.assertIn('Próximo', self.content)

    def test_slicing_logic_exists(self):
        """Verifica se os dados do radar são fatiados com base no estado da paginação"""
        self.assertIn('.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)', self.content)

if __name__ == '__main__':
    unittest.main()
