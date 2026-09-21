import unittest
from pathlib import Path

class TestFinancialCostsTracking(unittest.TestCase):
    def test_db_schema_has_usage_costs(self):
        db_file = Path(__file__).resolve().parents[1] / 'dashboard' / 'db.js'
        self.assertTrue(db_file.exists())
        code = db_file.read_text(encoding='utf-8')
        self.assertIn('CREATE TABLE IF NOT EXISTS usage_costs', code)
        self.assertIn('total_cost_usd', code)
        self.assertIn('total_cost_brl', code)
        self.assertIn('retry_count', code)

    def test_helpers_has_record_usage_cost(self):
        helpers_file = Path(__file__).resolve().parents[1] / 'dashboard' / 'helpers.js'
        self.assertTrue(helpers_file.exists())
        code = helpers_file.read_text(encoding='utf-8')
        self.assertIn('export async function recordUsageCost', code)
        self.assertIn('totalCostUsd:', code)
        self.assertIn('retryCount:', code)

    def test_financial_route_aggregates_usage_costs(self):
        fin_file = Path(__file__).resolve().parents[1] / 'dashboard' / 'routes' / 'services' / 'financial.js'
        self.assertTrue(fin_file.exists())
        code = fin_file.read_text(encoding='utf-8')
        self.assertIn('usage_costs', code)
        self.assertIn('categoriesBreakdown', code)
        self.assertIn('transactions', code)

    def test_criador_stream_tracks_prompt_cost(self):
        gen_file = Path(__file__).resolve().parents[1] / 'dashboard' / 'routes' / 'carousels' / 'carouselsGenerate.js'
        self.assertTrue(gen_file.exists())
        code = gen_file.read_text(encoding='utf-8')
        self.assertIn('recordUsageCost', code)
        self.assertIn('agent_prompt', code)

    def test_library_chat_tracks_image_cost(self):
        lib_file = Path(__file__).resolve().parents[1] / 'dashboard' / 'routes' / 'library' / 'libraryChat.js'
        self.assertTrue(lib_file.exists())
        code = lib_file.read_text(encoding='utf-8')
        self.assertIn('recordUsageCost', code)
        self.assertIn('image_generation', code)

    def test_frontend_has_transactions_table_and_tabs(self):
        trans_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Financeiro' / 'FinanceiroTransactionsTable.jsx'
        self.assertTrue(trans_file.exists())
        index_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Financeiro' / 'index.jsx'
        code = index_file.read_text(encoding='utf-8')
        self.assertIn('FinanceiroTransactionsTable', code)
        self.assertIn('Extrato de Gastos em Tempo Real', code)

    def test_financeiro_kpi_responsive_grid_and_badges(self):
        css_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'css' / 'tab_financeiro.css'
        self.assertTrue(css_file.exists())
        css = css_file.read_text(encoding='utf-8')
        self.assertIn('.financeiro-kpi-grid', css)
        self.assertIn('repeat(6, minmax(0, 1fr))', css)
        self.assertIn('@media (max-width: 1440px)', css)
        self.assertIn('repeat(3, minmax(0, 1fr))', css)
        self.assertIn('min-width: 0', css)

        stats_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Financeiro' / 'FinanceiroStats.jsx'
        self.assertTrue(stats_file.exists())
        stats_code = stats_file.read_text(encoding='utf-8')
        self.assertIn('Custo Total Geral', stats_code)
        self.assertIn('Economia (Text-Only)', stats_code)
        self.assertIn('Carrosséis & Recriações', stats_code)
        self.assertIn('Imagens de Estúdio', stats_code)
        self.assertIn('Prompts & Conversas IA', stats_code)
        self.assertIn('Custo Médio / Slide', stats_code)

    def test_financeiro_pagination(self):
        index_file = Path(__file__).resolve().parents[2] / 'frontend' / 'src' / 'components' / 'Financeiro' / 'index.jsx'
        self.assertTrue(index_file.exists())
        code = index_file.read_text(encoding='utf-8')
        self.assertIn('DashboardPagination', code)
        self.assertIn("carouselsPageSize, setCarouselsPageSize] = useState('20')", code)
        self.assertIn("transactionsPageSize, setTransactionsPageSize] = useState('20')", code)
        self.assertIn('paginatedCarousels', code)
        self.assertIn('paginatedTransactions', code)
        self.assertIn('totalCarouselsPages', code)
        self.assertIn('totalTransactionsPages', code)

if __name__ == '__main__':
    unittest.main()

