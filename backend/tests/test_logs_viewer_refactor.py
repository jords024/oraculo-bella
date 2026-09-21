import os
import pytest

FRONTEND_COMPONENTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'components')
)

def test_logs_viewer_files_exist():
    """Valida se todos os módulos do LogsViewer foram criados corretamente."""
    expected_files = [
        os.path.join(FRONTEND_COMPONENTS_DIR, 'LogsViewer.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'LogsViewer', 'ConfirmModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'LogsViewer', 'LogsPasteModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'LogsViewer', 'LogsFilterBar.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'LogsViewer', 'LogsTable.jsx'),
    ]

    for file_path in expected_files:
        assert os.path.exists(file_path), f"Arquivo obrigatório não encontrado: {file_path}"

def test_logs_viewer_line_limits():
    """Valida se nenhum arquivo do LogsViewer excede o limite de 500 linhas."""
    log_files = [
        os.path.join(FRONTEND_COMPONENTS_DIR, 'LogsViewer.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'LogsViewer', 'ConfirmModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'LogsViewer', 'LogsPasteModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'LogsViewer', 'LogsFilterBar.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'LogsViewer', 'LogsTable.jsx'),
    ]

    for file_path in log_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = sum(1 for _ in f)
        assert lines <= 500, f"Arquivo {os.path.basename(file_path)} ultrapassou o limite de 500 linhas: {lines} linhas"

def test_logs_viewer_imports_and_exports():
    """Valida se os exports e imports dos componentes estão íntegros."""
    logs_main = os.path.join(FRONTEND_COMPONENTS_DIR, 'LogsViewer.jsx')
    with open(logs_main, 'r', encoding='utf-8') as f:
        content = f.read()

    assert "export default function LogsViewer" in content
    assert "import ConfirmModal from './LogsViewer/ConfirmModal'" in content
    assert "import LogsPasteModal from './LogsViewer/LogsPasteModal'" in content
    assert "import LogsFilterBar from './LogsViewer/LogsFilterBar'" in content
    assert "import LogsTable from './LogsViewer/LogsTable'" in content
