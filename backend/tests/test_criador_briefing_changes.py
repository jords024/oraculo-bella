"""
Testes para as alterações no Criador:
1. Botão "Salvar rascunho" foi removido do Criador.jsx
2. Pergunta sobre quantidade de slides e fundo preto foi removida do agentPrompts.js
3. O agente agora decide sozinho quantidade de slides e fundo preto
4. Apenas a pergunta de formato do roteiro permanece
"""
import unittest
from pathlib import Path


class TestCriadorSalvarRascunho(unittest.TestCase):
    """Verifica que o botão Salvar rascunho foi removido do Criador.jsx."""

    def setUp(self):
        self.criador_path = (
            Path(__file__).resolve().parents[2]
            / "frontend" / "src" / "components" / "Criador.jsx"
        )
        self.assertTrue(self.criador_path.exists(), f"Criador.jsx não encontrado em {self.criador_path}")
        with open(self.criador_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_salvar_rascunho_button_removed(self):
        """O botão '+ Salvar rascunho' NÃO deve existir no Criador."""
        self.assertNotIn(
            "Salvar rascunho",
            self.content,
            "O botão '+ Salvar rascunho' ainda está presente no Criador.jsx e deveria ter sido removido."
        )

    def test_copiar_tudo_button_still_exists(self):
        """O botão 'Copiar tudo' deve continuar existindo."""
        self.assertIn(
            "Copiar tudo",
            self.content,
            "O botão 'Copiar tudo' foi removido indevidamente do Criador.jsx."
        )

    def test_copy_button_shows_toast(self):
        """O botão Copiar tudo deve chamar showToast após copiar."""
        self.assertIn(
            "showToast",
            self.content,
            "showToast não é chamado no Criador.jsx."
        )
        # Verifica que o showToast está próximo ao writeText (no mesmo onClick)
        import re
        copy_with_toast = re.search(
            r'navigator\.clipboard\.writeText.*showToast|showToast.*navigator\.clipboard\.writeText',
            self.content,
            re.DOTALL
        )
        self.assertIsNotNone(
            copy_with_toast,
            "O botão Copiar tudo não está disparando showToast após copiar o conteúdo."
        )

    def test_handle_save_draft_not_called_from_button(self):
        """handleSaveDraft não deve ser chamado a partir de um botão visível ao usuário."""
        # A função pode ainda existir no código, mas não deve estar em botão de UI
        import re
        button_with_save_draft = re.search(
            r'<button[^>]*>[^<]*[Ss]alvar\s+rascunho[^<]*</button>',
            self.content
        )
        self.assertIsNone(
            button_with_save_draft,
            "Encontrado botão com texto 'Salvar rascunho' no JSX do Criador."
        )


class TestAgentPromptsSlidesBriefing(unittest.TestCase):
    """Verifica que o agentPrompts.js não pergunta mais sobre slides e fundo preto."""

    def setUp(self):
        self.prompts_path = (
            Path(__file__).resolve().parents[2]
            / "backend" / "dashboard" / "agentPrompts.js"
        )
        self.assertTrue(self.prompts_path.exists(), f"agentPrompts.js não encontrado em {self.prompts_path}")
        with open(self.prompts_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_slides_quantity_question_removed(self):
        """A pergunta sobre quantidade de slides NÃO deve existir no briefing."""
        self.assertNotIn(
            "Quantidade de Slides:",
            self.content,
            "A pergunta 'Quantidade de Slides:' ainda está no agentPrompts.js e deveria ter sido removida."
        )

    def test_black_background_question_removed(self):
        """A pergunta sobre fundo preto/escuro NÃO deve estar no contexto de pergunta ao usuário."""
        # A instrução de perguntar ao usuário sobre fundo preto foi removida
        self.assertNotIn(
            "quantos devem ter fundo escuro/preto",
            self.content,
            "A pergunta sobre fundo preto ainda está no agentPrompts.js e deveria ter sido removida."
        )

    def test_agent_decides_slides_autonomously(self):
        """O prompt deve indicar que o agente decide slides e fundo preto autonomamente."""
        self.assertIn(
            "você decide sozinho",
            self.content,
            "A instrução de que o agente decide slides autonomamente não foi encontrada no agentPrompts.js."
        )

    def test_agent_decides_black_bg_autonomously(self):
        """O prompt deve indicar que o agente decide o fundo preto sem perguntar ao usuário."""
        self.assertIn(
            "não pergunte ao usuário",
            self.content,
            "A instrução de não perguntar ao usuário sobre fundo preto não foi encontrada."
        )

    def test_format_question_still_exists(self):
        """A pergunta sobre formato do roteiro (A, B, C, D) deve CONTINUAR existindo e ser estritamente obrigatória."""
        self.assertIn(
            "formato de roteiro",
            self.content.lower(),
            "A pergunta sobre formato do roteiro (A/B/C/D) foi removida indevidamente do agentPrompts.js."
        )

    def test_strictly_forbidden_to_skip_format(self):
        """O agente deve ser proibido de assumir o formato ou pular a pergunta."""
        self.assertIn(
            "STRICTLY PROIBIDO",
            self.content,
            "Regra estrita proibindo o agente de assumir o formato não encontrada no prompt."
        )

    def test_format_options_still_present(self):
        """As opções de formato (Tese, Demolição, Lista, História) devem continuar no prompt."""
        self.assertIn("Tese + Tradução", self.content)
        self.assertIn("Demolição + Reconstrução", self.content)
        self.assertIn("Lista Revelação", self.content)
        self.assertIn("História + Verdade", self.content)


if __name__ == "__main__":
    unittest.main(verbosity=2)
