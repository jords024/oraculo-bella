import unittest
from pathlib import Path

class TestRetryConfirmationModal(unittest.TestCase):
    def test_modal_component_exists_and_has_required_structure(self):
        modal_path = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Dashboard' / 'modals' / 'RetryConfirmationModal.jsx'
        self.assertTrue(modal_path.exists(), 'RetryConfirmationModal.jsx não existe')
        
        code = modal_path.read_text(encoding='utf-8')
        self.assertIn('export default function RetryConfirmationModal', code)
        self.assertIn('Confirmar Recriação', code)
        self.assertIn('Cancelar', code)
        self.assertIn('setRetryTargetId(null)', code)
        self.assertIn('confirmRetry(id)', code)
        self.assertIn('form-modal open', code)

    def test_dashboard_modals_includes_retry_modal(self):
        dash_modals = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Dashboard' / 'DashboardModals.jsx'
        self.assertTrue(dash_modals.exists())
        code = dash_modals.read_text(encoding='utf-8')
        self.assertIn('import RetryConfirmationModal from \'./modals/RetryConfirmationModal\';', code)
        self.assertIn('<RetryConfirmationModal', code)

    def test_dashboard_triggers_modal_on_retry(self):
        dash_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Dashboard.jsx'
        self.assertTrue(dash_file.exists())
        code = dash_file.read_text(encoding='utf-8')
        self.assertIn('retryTargetId', code)
        self.assertIn('onRetryGeneration={setRetryTargetId}', code)

if __name__ == '__main__':
    unittest.main()
