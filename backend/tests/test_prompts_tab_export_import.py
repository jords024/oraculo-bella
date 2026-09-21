"""
Testes para:
1. Word-wrap no textarea do editor de prompts (whiteSpace: pre-wrap)
2. Botões de Exportar JSON e Importar JSON no PromptsTab
3. Prop showToast passada do Settings.jsx para PromptsTab
"""
import unittest
from pathlib import Path


class TestPromptsTabWordWrap(unittest.TestCase):
    """Verifica que o textarea do editor usa word-wrap ao invés de scroll horizontal."""

    def setUp(self):
        self.file_path = (
            Path(__file__).resolve().parents[2]
            / "frontend" / "src" / "components" / "Settings" / "PromptsTab.jsx"
        )
        self.assertTrue(self.file_path.exists(), f"PromptsTab.jsx não encontrado em {self.file_path}")
        with open(self.file_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_whitespace_pre_wrap_applied(self):
        """O textarea deve usar whiteSpace: 'pre-wrap' para quebrar linhas longas."""
        self.assertIn(
            "pre-wrap",
            self.content,
            "whiteSpace: 'pre-wrap' não encontrado no PromptsTab.jsx — o textarea ainda usa scroll horizontal."
        )

    def test_overflow_x_hidden(self):
        """overflowX deve ser 'hidden' para eliminar a barra de rolagem horizontal."""
        self.assertIn(
            "overflowX: 'hidden'",
            self.content,
            "overflowX: 'hidden' não encontrado — a barra de scroll horizontal pode aparecer."
        )

    def test_word_break_applied(self):
        """wordBreak: 'break-word' deve estar aplicado para palavras muito longas."""
        self.assertIn(
            "wordBreak: 'break-word'",
            self.content,
            "wordBreak: 'break-word' não encontrado no PromptsTab.jsx."
        )

    def test_whitespace_pre_removed(self):
        """whiteSpace: 'pre' não deve existir mais no textarea (foi substituído por pre-wrap)."""
        import re
        # Busca especificamente por whiteSpace: 'pre', excluindo 'pre-wrap'
        pre_only = re.findall(r"whiteSpace:\s*['\"]pre['\"]", self.content)
        self.assertEqual(
            len(pre_only), 0,
            f"Ainda há {len(pre_only)} ocorrência(s) de whiteSpace: 'pre' (sem -wrap) no PromptsTab.jsx."
        )


class TestPromptsTabExportImport(unittest.TestCase):
    """Verifica que os botões de exportar e importar prompts existem no PromptsTab."""

    def setUp(self):
        self.file_path = (
            Path(__file__).resolve().parents[2]
            / "frontend" / "src" / "components" / "Settings" / "PromptsTab.jsx"
        )
        with open(self.file_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_export_button_exists(self):
        """O botão 'Exportar' deve existir no PromptsTab."""
        self.assertIn(
            "Exportar",
            self.content,
            "Botão 'Exportar' não encontrado no PromptsTab.jsx."
        )

    def test_import_button_exists(self):
        """O botão 'Importar' deve existir no PromptsTab."""
        self.assertIn(
            "Importar",
            self.content,
            "Botão 'Importar' não encontrado no PromptsTab.jsx."
        )

    def test_export_function_exists(self):
        """A função handleExport deve existir e criar um arquivo JSON para download."""
        self.assertIn("handleExport", self.content)
        self.assertIn("URL.createObjectURL", self.content)
        self.assertIn("oraculo-prompts-", self.content)

    def test_import_function_exists(self):
        """A função handleImport deve existir e fazer fetch para salvar os prompts."""
        self.assertIn("handleImport", self.content)
        self.assertIn("FileReader", self.content)
        self.assertIn("/api/settings/prompts", self.content)

    def test_import_input_file_exists(self):
        """Deve existir um input type=file oculto para a importação."""
        self.assertIn('type="file"', self.content)
        self.assertIn('accept=".json,application/json"', self.content)

    def test_show_toast_prop_declared(self):
        """showToast deve ser recebido como prop no PromptsTab."""
        self.assertIn("showToast", self.content)

    def test_export_uses_toast(self):
        """handleExport deve chamar showToast após exportar."""
        import re
        export_with_toast = re.search(
            r'handleExport.*?showToast|showToast.*?handleExport',
            self.content, re.DOTALL
        )
        self.assertIsNotNone(
            export_with_toast,
            "handleExport não chama showToast para confirmar a exportação."
        )


class TestSettingsPassesShowToastToPromptsTab(unittest.TestCase):
    """Verifica que Settings.jsx passa showToast para PromptsTab."""

    def setUp(self):
        self.settings_path = (
            Path(__file__).resolve().parents[2]
            / "frontend" / "src" / "components" / "Settings.jsx"
        )
        with open(self.settings_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_show_toast_passed_to_prompts_tab(self):
        """Settings.jsx deve passar showToast={showToast} para o PromptsTab."""
        import re
        match = re.search(
            r'<PromptsTab[^>]*showToast=\{showToast\}',
            self.content, re.DOTALL
        )
        self.assertIsNotNone(
            match,
            "Settings.jsx não está passando showToast para PromptsTab."
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
