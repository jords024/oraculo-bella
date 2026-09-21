import os
import pytest

FRONTEND_COMPONENTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'components')
)

def test_pipeline_modal_files_exist():
    """Valida se todos os módulos do PipelineModal foram criados corretamente."""
    expected_files = [
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'PipelineOverviewTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'PipelineAgentsTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'PipelineSlidesTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'PipelineChatTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'PipelineLogsTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'MaximizedPromptModal.jsx'),
    ]

    for file_path in expected_files:
        assert os.path.exists(file_path), f"Arquivo obrigatório não encontrado: {file_path}"

def test_pipeline_modal_line_limits():
    """Valida se nenhum arquivo do PipelineModal excede o limite de 500 linhas."""
    pipeline_files = [
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'PipelineOverviewTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'PipelineAgentsTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'PipelineSlidesTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'PipelineChatTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'PipelineLogsTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal', 'MaximizedPromptModal.jsx'),
    ]

    for file_path in pipeline_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = sum(1 for _ in f)
        assert lines <= 500, f"Arquivo {os.path.basename(file_path)} ultrapassou o limite de 500 linhas: {lines} linhas"

def test_pipeline_modal_imports_and_exports():
    """Valida se os exports e imports dos componentes estão íntegros."""
    modal_main = os.path.join(FRONTEND_COMPONENTS_DIR, 'PipelineModal.jsx')
    with open(modal_main, 'r', encoding='utf-8') as f:
        content = f.read()

    assert "export default function PipelineModal" in content
    assert "import PipelineOverviewTab from './PipelineModal/PipelineOverviewTab'" in content
    assert "import PipelineAgentsTab from './PipelineModal/PipelineAgentsTab'" in content
    assert "import PipelineSlidesTab from './PipelineModal/PipelineSlidesTab'" in content
    assert "import PipelineChatTab from './PipelineModal/PipelineChatTab'" in content
    assert "import PipelineLogsTab from './PipelineModal/PipelineLogsTab'" in content
    assert "import MaximizedPromptModal from './PipelineModal/MaximizedPromptModal'" in content
