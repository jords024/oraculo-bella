import os
import pytest

FRONTEND_COMPONENTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'components')
)

def test_edit_slide_modal_files_exist():
    """Valida se todos os módulos do EditSlideModal foram criados corretamente."""
    expected_files = [
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'editSlideConstants.js'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'EditSlideLoadingOverlay.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'EditSlideHeader.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'EditSlideTextTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'EditSlideImageTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'EditSlidePreview.jsx'),
    ]

    for file_path in expected_files:
        assert os.path.exists(file_path), f"Arquivo obrigatório não encontrado: {file_path}"

def test_edit_slide_modal_line_limits():
    """Valida se nenhum arquivo do EditSlideModal excede o limite de 500 linhas."""
    edit_files = [
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'editSlideConstants.js'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'EditSlideLoadingOverlay.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'EditSlideHeader.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'EditSlideTextTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'EditSlideImageTab.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal', 'EditSlidePreview.jsx'),
    ]

    for file_path in edit_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = sum(1 for _ in f)
        assert lines <= 500, f"Arquivo {os.path.basename(file_path)} ultrapassou o limite de 500 linhas: {lines} linhas"

def test_edit_slide_modal_imports_and_exports():
    """Valida se os exports e imports dos componentes estão íntegros."""
    modal_main = os.path.join(FRONTEND_COMPONENTS_DIR, 'EditSlideModal.jsx')
    with open(modal_main, 'r', encoding='utf-8') as f:
        content = f.read()

    assert "export default function EditSlideModal" in content
    assert "import { PRESET_DEFAULTS, getDefaultPositions } from './EditSlideModal/editSlideConstants'" in content
    assert "import EditSlideLoadingOverlay from './EditSlideModal/EditSlideLoadingOverlay'" in content
    assert "import EditSlideHeader from './EditSlideModal/EditSlideHeader'" in content
    assert "import EditSlideTextTab from './EditSlideModal/EditSlideTextTab'" in content
    assert "import EditSlideImageTab from './EditSlideModal/EditSlideImageTab'" in content
    assert "import EditSlidePreview from './EditSlideModal/EditSlidePreview'" in content
