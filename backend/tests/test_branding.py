import json
import unittest
import urllib.request

BASE = "http://localhost:3131"

def login():
    req = urllib.request.Request(
        f"{BASE}/auth/login",
        data=json.dumps({"username": "aryarajmarketing@gmail.com", "password": "123456"}).encode('utf-8'),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        return json.loads(r.read().decode('utf-8'))["token"]

class TestBrandingAPI(unittest.TestCase):
    def setUp(self):
        self.branding_url = f"{BASE}/api/settings/branding"
        self.token = login()

    def test_get_and_post_branding(self):
        """Valida que podemos salvar e ler a configuração de identidade visual com o novo campo companyName"""
        headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}

        # 1. Obter a configuração atual (para restaurar depois)
        get_req = urllib.request.Request(self.branding_url, headers=headers, method="GET")
        with urllib.request.urlopen(get_req, timeout=5) as get_resp:
            self.assertEqual(get_resp.status, 200)
            original_data = json.loads(get_resp.read().decode("utf-8"))

        # 2. Modificar as configurações incluindo companyName
        test_data = original_data.copy()
        test_data["companyName"] = "Minha Empresa de Teste"
        test_data["logoText"] = "TESTLOGO"

        post_payload = json.dumps(test_data).encode("utf-8")
        post_req = urllib.request.Request(
            self.branding_url,
            data=post_payload,
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(post_req, timeout=5) as post_resp:
            self.assertEqual(post_resp.status, 200)
            post_res_data = json.loads(post_resp.read().decode("utf-8"))
            self.assertTrue(post_res_data.get("ok"))

        # 3. Validar se a configuração foi atualizada
        with urllib.request.urlopen(get_req, timeout=5) as verify_resp:
            self.assertEqual(verify_resp.status, 200)
            verify_data = json.loads(verify_resp.read().decode("utf-8"))
            self.assertEqual(verify_data.get("companyName"), "Minha Empresa de Teste")
            self.assertEqual(verify_data.get("logoText"), "TESTLOGO")

        # 4. Restaurar a configuração original
        restore_payload = json.dumps(original_data).encode("utf-8")
        restore_req = urllib.request.Request(
            self.branding_url,
            data=restore_payload,
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(restore_req, timeout=5) as restore_resp:
            self.assertEqual(restore_resp.status, 200)

        print("\n[OK] Teste da API de Identidade Visual (Branding / companyName) passou com sucesso!")

    def test_public_branding(self):
        """Valida que o endpoint de branding é público e não requer autenticação"""
        req = urllib.request.Request(self.branding_url, method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertIn("logoText", data)
            print("\n[OK] Teste de API Pública de Branding passou com sucesso!")

if __name__ == '__main__':
    unittest.main()
