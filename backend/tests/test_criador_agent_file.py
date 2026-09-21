"""
Teste unitário para existência do arquivo de agent criador.md e mapeamento no display_names.json
"""
import json
import unittest
from pathlib import Path


class TestCriadorAgentFile(unittest.TestCase):
    def setUp(self):
        self.agent_file = (
            Path(__file__).resolve().parents[2] / "backend" / "agents" / "criador.md"
        )
        self.names_file = (
            Path(__file__).resolve().parents[2] / "backend" / "agents" / "display_names.json"
        )

    def test_criador_md_exists(self):
        """Verifica se o arquivo criador.md existe em backend/agents."""
        self.assertTrue(self.agent_file.exists(), f"criador.md não encontrado em {self.agent_file}")

    def test_criador_md_contains_cta(self):
        """Verifica se criador.md possui a estrutura de S10 e CTA."""
        with open(self.agent_file, encoding="utf-8") as f:
            content = f.read()
        self.assertIn("S10 — CTA FIXO", content)
        self.assertIn("COMENTE", content)

    def test_criador_in_display_names(self):
        """Verifica se criador está mapeado no display_names.json."""
        with open(self.names_file, encoding="utf-8") as f:
            data = json.load(f)
        self.assertIn("criador", data)
        self.assertEqual(data["criador"], "CRIADOR HauCacau (Agente Mestre)")

if __name__ == "__main__":
    unittest.main(verbosity=2)
