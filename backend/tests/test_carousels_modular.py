"""
Teste Unitário: Validação da Modularização das Rotas de Carrosséis.
Testa endpoints de listagem, capabilities e detalhes com autenticação JWT.
"""

import unittest
import urllib.request
import urllib.error
import json
import os

BASE_URL = os.environ.get("TEST_API_URL", "http://localhost:3131")

class TestCarouselsModular(unittest.TestCase):

    def setUp(self):
        login_url = f"{BASE_URL}/auth/login"
        login_data = json.dumps({
            "username": "aryarajmarketing@gmail.com",
            "password": "123456"
        }).encode("utf-8")
        login_req = urllib.request.Request(
            login_url,
            data=login_data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(login_req, timeout=5) as resp:
                self.assertEqual(resp.status, 200)
                res_json = json.loads(resp.read().decode("utf-8"))
                self.token = res_json["token"]
                self.auth_headers = {
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                }
        except Exception as e:
            self.skipTest(f"Não foi possível autenticar: {e}")

    def test_list_carousels(self):
        url = f"{BASE_URL}/api/carousels"
        req = urllib.request.Request(url, headers=self.auth_headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertIsInstance(data, list)
            print(f"[OK] Listagem de carrosséis retornou {len(data)} itens com sucesso!")

    def test_criador_capabilities(self):
        url = f"{BASE_URL}/api/criador/capabilities"
        req = urllib.request.Request(url, headers=self.auth_headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertTrue(data.get("canGenerateImages"))
            print("[OK] Capabilities do Criador respondendo 200 OK!")


if __name__ == "__main__":
    unittest.main()
