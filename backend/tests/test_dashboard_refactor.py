import os
import pytest

FRONTEND_COMPONENTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'src', 'components')
)

def test_dashboard_files_exist():
    """Valida se todos os módulos do Dashboard foram criados corretamente."""
    expected_files = [
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'GeneratingBadge.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'DashboardStats.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'DashboardFilters.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'DashboardPagination.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'CarouselCard.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'DashboardModals.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'modals', 'DeleteConfirmationModals.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'modals', 'CarouselDetailsModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'modals', 'CaptionEditModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'modals', 'PublishModals.jsx'),
    ]

    for file_path in expected_files:
        assert os.path.exists(file_path), f"Arquivo obrigatório não encontrado: {file_path}"

def test_dashboard_line_limits():
    """Valida se nenhum arquivo do Dashboard excede o limite de 500 linhas."""
    dashboard_files = [
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'GeneratingBadge.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'DashboardStats.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'DashboardFilters.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'DashboardPagination.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'CarouselCard.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'DashboardModals.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'modals', 'DeleteConfirmationModals.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'modals', 'CarouselDetailsModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'modals', 'CaptionEditModal.jsx'),
        os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard', 'modals', 'PublishModals.jsx'),
    ]

    for file_path in dashboard_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = sum(1 for _ in f)
        assert lines <= 500, f"Arquivo {os.path.basename(file_path)} ultrapassou o limite de 500 linhas: {lines} linhas"

def test_dashboard_imports_and_exports():
    """Valida se os exports e imports dos componentes estão íntegros."""
    dashboard_main = os.path.join(FRONTEND_COMPONENTS_DIR, 'Dashboard.jsx')
    with open(dashboard_main, 'r', encoding='utf-8') as f:
        content = f.read()

    assert "export default function Dashboard" in content
    assert "import DashboardStats from './Dashboard/DashboardStats'" in content
    assert "import DashboardFilters from './Dashboard/DashboardFilters'" in content
    assert "import CarouselCard from './Dashboard/CarouselCard'" in content
    assert "import DashboardPagination from './Dashboard/DashboardPagination'" in content
    assert "import DashboardModals from './Dashboard/DashboardModals'" in content
