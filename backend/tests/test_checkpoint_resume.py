"""
Teste Unitário: Verificação do Mecanismo de Checkpoint & Resume no criador_pipeline.py
Garante que imagens já existentes no disco não chamam a API OpenAI novamente após um restart.
"""

import os
import sys
import unittest
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from core.criador_pipeline import fetch_image_for_slide


class TestCheckpointResume(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.out_dir = Path(self.temp_dir.name)

        # Simula que o slide 01 já foi gerado antes do restart
        self.existing_raw_01 = self.out_dir / "raw-01.jpg"
        self.existing_raw_01.write_bytes(b"EXISTING_IMAGE_DATA_BYTES_TEST_" * 50)  # > 1024 bytes

    def tearDown(self):
        self.temp_dir.cleanup()

    @patch("core.criador_pipeline.gen")
    def test_slide_already_on_disk_uses_checkpoint_without_api_call(self, mock_gen):
        slide_01 = {"num": "01", "title": "Slide 1 Já Pronto", "prompt": "Prompt 1"}

        # Executa fetch para slide 1 (que já existe no disco)
        idx, img_bytes, from_cache = fetch_image_for_slide((1, slide_01, self.out_dir))

        # Deve recuperar do disco
        self.assertTrue(from_cache)
        self.assertEqual(img_bytes, self.existing_raw_01.read_bytes())
        # Não deve ter chamado a API da OpenAI
        mock_gen.assert_not_called()

    @patch("core.criador_pipeline.gen")
    def test_slide_not_on_disk_calls_api(self, mock_gen):
        mock_gen.return_value = b"NEW_API_GENERATED_BYTES"
        slide_02 = {"num": "02", "title": "Slide 2 Faltante", "prompt": "Prompt 2"}

        # Executa fetch para slide 2 (que NÃO existe no disco)
        idx, img_bytes, from_cache = fetch_image_for_slide((2, slide_02, self.out_dir))

        # Deve chamar a API
        self.assertFalse(from_cache)
        self.assertEqual(img_bytes, b"NEW_API_GENERATED_BYTES")
        mock_gen.assert_called_once()


if __name__ == "__main__":
    unittest.main()
