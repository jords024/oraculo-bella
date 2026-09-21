import unittest
from pathlib import Path

class TestOpenAIImageGenerationParams(unittest.TestCase):
    def test_gen_image_openai_has_no_invalid_response_format(self):
        gen_file = Path(__file__).resolve().parents[1] / 'core' / 'util' / 'gen_image_openai.py'
        self.assertTrue(gen_file.exists())
        code = gen_file.read_text(encoding='utf-8')
        self.assertNotIn('kwargs["response_format"]', code, 'Não deve passar response_format para OpenAI')
        self.assertIn('item.url', code, 'Deve suportar URL retornado por padrão pela OpenAI')
        self.assertIn('item.b64_json', code, 'Deve suportar b64_json se presente')

    def test_pipeline_haucacau_has_no_invalid_response_format(self):
        pipe_file = Path(__file__).resolve().parents[1] / 'core' / 'agentes' / 'pipeline_haucacau.py'
        self.assertTrue(pipe_file.exists())
        code = pipe_file.read_text(encoding='utf-8')
        self.assertNotIn('response_format="b64_json"', code)
        self.assertIn('item.url', code)

if __name__ == '__main__':
    unittest.main()
