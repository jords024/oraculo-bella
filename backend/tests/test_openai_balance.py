"""
Testes para a funcionalidade de Saldo OpenAI.

Testa:
1. Backend: GET /api/settings/openai-balance — retorna 403 para usuários comuns
2. Backend: GET /api/settings/openai-balance — retorna 200 com dados para Super Admin
3. Frontend: verifica que o card de saldo OpenAI existe no GeneralTab.jsx
4. Frontend: verifica que o card é condicionado à prop isSuperAdmin
5. Frontend: verifica que o botão de atualizar existe com ID correto
6. Frontend: verifica que o link de fallback para billing existe com ID correto
"""
import json
import unittest
import urllib.error
import urllib.request
from pathlib import Path

BASE_URL = "http://localhost:3131"
LOGIN_URL = f"{BASE_URL}/auth/login"
BALANCE_URL = f"{BASE_URL}/api/settings/openai-balance"

SUPER_ADMIN_EMAIL = "aryarajmarketing@gmail.com"
SUPER_ADMIN_PASS = "123456"


def login_as_super_admin():
    """Faz login como Super Admin via JWT e retorna o token."""
    payload = json.dumps({
        "username": SUPER_ADMIN_EMAIL,
        "password": SUPER_ADMIN_PASS
    }).encode("utf-8")
    req = urllib.request.Request(
        LOGIN_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data.get("token")


class TestOpenAIBalanceBackend(unittest.TestCase):
    """Testa o endpoint de saldo OpenAI no backend."""

    def setUp(self):
        self.super_token = login_as_super_admin()
        self.assertIsNotNone(self.super_token, "Falha ao obter token de Super Admin")

    def test_balance_returns_200_for_super_admin(self):
        """Super Admin deve receber HTTP 200 ao chamar o endpoint de saldo."""
        req = urllib.request.Request(
            BALANCE_URL,
            headers={"Authorization": f"Bearer {self.super_token}"},
            method="GET"
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            # A resposta deve ter sempre o campo 'ok' e 'billingUrl'
            self.assertIn("ok", data)
            self.assertIn("billingUrl", data)
            self.assertTrue(data["billingUrl"].startswith("https://platform.openai.com"))

    def test_balance_response_has_correct_structure(self):
        """A resposta do endpoint deve ter a estrutura esperada (ok=True ou ok=False com error)."""
        req = urllib.request.Request(
            BALANCE_URL,
            headers={"Authorization": f"Bearer {self.super_token}"},
            method="GET"
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data["ok"]:
                # Se conseguiu consultar, deve ter os campos de saldo
                self.assertIn("totalGranted", data)
                self.assertIn("totalUsed", data)
                self.assertIn("totalAvailable", data)
                self.assertIn("billingUrl", data)
            else:
                # Se falhou, deve ter error e billingUrl de fallback
                self.assertIn("error", data)
                self.assertIn("billingUrl", data)

    def test_balance_blocked_for_unauthenticated_user(self):
        """Usuário não autenticado deve receber 401."""
        req = urllib.request.Request(BALANCE_URL, method="GET")
        try:
            urllib.request.urlopen(req, timeout=10)
            self.fail("Deveria ter retornado 401 para requisição sem token")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 401)

    def test_balance_blocked_for_regular_user(self):
        """Usuário comum (não super admin) deve receber 403."""
        # Tenta com um token inválido que simula usuário comum
        fake_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicmVndWxhckB0ZXN0ZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTYwMDAwMDAwMH0.invalidsignature"
        req = urllib.request.Request(
            BALANCE_URL,
            headers={"Authorization": f"Bearer {fake_token}"},
            method="GET"
        )
        try:
            urllib.request.urlopen(req, timeout=10)
            self.fail("Deveria ter retornado 401 ou 403 para token inválido")
        except urllib.error.HTTPError as e:
            self.assertIn(e.code, [401, 403])


class TestOpenAIBalanceFrontend(unittest.TestCase):
    """Testa a presença dos elementos de saldo OpenAI no GeneralTab.jsx."""

    def setUp(self):
        self.general_tab_path = (
            Path(__file__).resolve().parents[2]
            / "frontend" / "src" / "components" / "Settings" / "GeneralTab.jsx"
        )
        self.assertTrue(
            self.general_tab_path.exists(),
            f"GeneralTab.jsx não encontrado em {self.general_tab_path}"
        )
        with open(self.general_tab_path, encoding="utf-8") as f:
            self.content = f.read()

    def test_balance_card_exists(self):
        """Card de saldo OpenAI deve existir no GeneralTab."""
        self.assertIn('openai-balance-card', self.content,
                      "ID 'openai-balance-card' não encontrado no GeneralTab.jsx")

    def test_balance_restricted_to_super_admin(self):
        """O card deve ser condicionado ao isSuperAdmin."""
        self.assertIn('isSuperAdmin', self.content,
                      "Variável 'isSuperAdmin' não encontrada no GeneralTab.jsx")
        self.assertIn('currentUser?.isSuperAdmin', self.content,
                      "Verificação de currentUser?.isSuperAdmin não encontrada")

    def test_refresh_button_exists_with_correct_id(self):
        """Botão de atualizar saldo deve ter ID correto para automação."""
        self.assertIn('btn-refresh-openai-balance', self.content,
                      "ID 'btn-refresh-openai-balance' não encontrado no GeneralTab.jsx")

    def test_billing_fallback_link_exists(self):
        """Link de fallback para o painel de billing da OpenAI deve existir."""
        self.assertIn('btn-openai-billing-link', self.content,
                      "ID 'btn-openai-billing-link' não encontrado no GeneralTab.jsx")
        self.assertIn('platform.openai.com', self.content,
                      "URL do painel OpenAI não encontrada no GeneralTab.jsx")

    def test_load_balance_function_exists(self):
        """Função loadOpenAIBalance deve estar definida no componente."""
        self.assertIn('loadOpenAIBalance', self.content,
                      "Função 'loadOpenAIBalance' não encontrada no GeneralTab.jsx")
        self.assertIn('/api/settings/openai-balance', self.content,
                      "Endpoint da API não referenciado no GeneralTab.jsx")

    def test_balance_state_initialized(self):
        """Estado openaiBalance deve ser inicializado com useState."""
        self.assertIn('openaiBalance', self.content,
                      "Estado 'openaiBalance' não encontrado no GeneralTab.jsx")
        self.assertIn('balanceLoading', self.content,
                      "Estado 'balanceLoading' não encontrado no GeneralTab.jsx")

    def test_currentuser_prop_declared(self):
        """Prop currentUser deve ser declarada no GeneralTab."""
        self.assertIn('currentUser', self.content,
                      "Prop 'currentUser' não declarada no GeneralTab.jsx")

    def test_format_usd_function_exists(self):
        """Função formatUSD deve estar definida para formatar valores monetários."""
        self.assertIn('formatUSD', self.content,
                      "Função 'formatUSD' não encontrada no GeneralTab.jsx")


class TestSettingsComponentPropPassing(unittest.TestCase):
    """Testa se Settings.jsx e App.jsx estão repassando currentUser corretamente."""

    def setUp(self):
        base = Path(__file__).resolve().parents[2] / "frontend" / "src"
        self.settings_path = base / "components" / "Settings.jsx"
        self.app_path = base / "App.jsx"

        for p in [self.settings_path, self.app_path]:
            self.assertTrue(p.exists(), f"Arquivo não encontrado: {p}")

        with open(self.settings_path, encoding="utf-8") as f:
            self.settings_content = f.read()
        with open(self.app_path, encoding="utf-8") as f:
            self.app_content = f.read()

    def test_settings_receives_current_user_prop(self):
        """Settings.jsx deve declarar currentUser como prop."""
        self.assertIn('currentUser', self.settings_content,
                      "Prop 'currentUser' não encontrada em Settings.jsx")

    def test_settings_passes_current_user_to_general_tab(self):
        """Settings.jsx deve repassar currentUser para GeneralTab."""
        self.assertIn('currentUser={currentUser}', self.settings_content,
                      "Settings.jsx não repassa currentUser para GeneralTab")

    def test_app_passes_current_user_to_settings(self):
        """App.jsx deve repassar currentUser para o componente Settings."""
        self.assertIn('currentUser={currentUser}', self.app_content,
                      "App.jsx não repassa currentUser para o componente Settings")


if __name__ == "__main__":
    unittest.main(verbosity=2)
