import unittest
from pathlib import Path

class TestRoutesIntegrity(unittest.TestCase):
    def test_carousels_modular_files_exist(self):
        root = Path(__file__).resolve().parents[1] / 'dashboard' / 'routes' / 'carousels'
        self.assertTrue((root / 'index.js').exists(), 'carousels/index.js não existe')
        self.assertTrue((root / 'carouselsCrud.js').exists(), 'carousels/carouselsCrud.js não existe')
        self.assertTrue((root / 'carouselsMedia.js').exists(), 'carousels/carouselsMedia.js não existe')
        self.assertTrue((root / 'carouselsPublish.js').exists(), 'carousels/carouselsPublish.js não existe')
        self.assertTrue((root / 'carouselsGenerate.js').exists(), 'carousels/carouselsGenerate.js não existe')

    def test_gitignore_does_not_ignore_routes(self):
        import subprocess
        root = Path(__file__).resolve().parents[2]
        target_file = root / 'backend' / 'dashboard' / 'routes' / 'carousels' / 'index.js'
        res = subprocess.run(['git', 'check-ignore', str(target_file)], cwd=str(root), capture_output=True, text=True)
        self.assertNotEqual(res.returncode, 0, 'O arquivo carousels/index.js está sendo ignorado pelo .gitignore!')

if __name__ == '__main__':
    unittest.main()
