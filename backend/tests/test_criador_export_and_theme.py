import unittest
from pathlib import Path

class TestCriadorEnhancements(unittest.TestCase):
    def test_export_chat_utility_exists(self):
        export_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'utils' / 'exportChat.js'
        self.assertTrue(export_file.exists(), 'exportChat.js não existe')
        code = export_file.read_text(encoding='utf-8')
        self.assertIn('export function exportChatToHtml', code)
        self.assertIn('conversa-criador-', code)
        self.assertIn('text/html;charset=utf-8', code)

    def test_criador_has_export_button_and_theme_handling(self):
        criador_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Criador.jsx'
        self.assertTrue(criador_file.exists())
        code = criador_file.read_text(encoding='utf-8')
        self.assertIn('exportChatToHtml', code)
        self.assertIn('Exportar conversa (HTML)', code)
        self.assertIn('isThemeSelection', code)
        self.assertIn('parseIdeasFromText', code)

    def test_ideas_prompt_is_expert_aligned(self):
        criador_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Criador.jsx'
        code = criador_file.read_text(encoding='utf-8')
        self.assertNotIn('@afonteoculta', code, 'Criador.jsx ainda contém @afonteoculta hardcoded')
        self.assertIn('agente expert', code)

    def test_criador_agent_prompt_immediate_generation(self):
        agent_file = Path(__file__).resolve().parents[2] / 'backend' / 'agents' / 'criador.md'
        self.assertTrue(agent_file.exists())
        prompt = agent_file.read_text(encoding='utf-8')
        self.assertIn('ESCOLHA DE TEMA & GERAÇÃO IMEDIATA DO CARROSSEL', prompt)
        self.assertIn('NUNCA continue listando mais números de temas', prompt)

if __name__ == '__main__':
    unittest.main()
