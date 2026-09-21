import json
import unittest
import urllib.request


class TestCopyModelAPI(unittest.TestCase):
    def setUp(self):
        self.base_url = "http://localhost:3131"
        self.login_url = f"{self.base_url}/auth/login"
        self.keys_url = f"{self.base_url}/api/settings/keys"

        # Efetua login para obter o token JWT
        login_payload = json.dumps({
            "username": "aryarajmarketing@gmail.com",
            "password": "123456"
        }).encode("utf-8")

        login_req = urllib.request.Request(
            self.login_url,
            data=login_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(login_req, timeout=5) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                self.token = res_data["token"]
        except Exception as e:
            self.fail(f"Falha ao realizar login no setup do teste: {e}")

    def test_copy_model_persistence(self):
        """Valida que o activeCopyModel pode ser lido e atualizado via API"""

        # 1. GET inicial das configurações
        get_req = urllib.request.Request(
            self.keys_url,
            headers={"Authorization": f"Bearer {self.token}"},
            method="GET"
        )
        with urllib.request.urlopen(get_req, timeout=5) as get_resp:
            self.assertEqual(get_resp.status, 200)
            data = json.loads(get_resp.read().decode("utf-8"))
            self.assertIn("activeCopyModel", data)
            original_model = data["activeCopyModel"]

        try:
            # 2. Atualiza o modelo de copy
            test_model = "gpt-4o-mini"
            payload = json.dumps({"COPY_GENERATION_MODEL": test_model}).encode("utf-8")
            post_req = urllib.request.Request(
                self.keys_url,
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.token}"
                },
                method="POST"
            )
            with urllib.request.urlopen(post_req, timeout=5) as post_resp:
                self.assertEqual(post_resp.status, 200)
                post_data = json.loads(post_resp.read().decode("utf-8"))
                self.assertTrue(post_data.get("ok"))

            # 3. GET para confirmar a persistência
            with urllib.request.urlopen(get_req, timeout=5) as confirm_resp:
                self.assertEqual(confirm_resp.status, 200)
                confirm_data = json.loads(confirm_resp.read().decode("utf-8"))
                self.assertEqual(confirm_data["activeCopyModel"], test_model)

        finally:
            # 4. Restaura o modelo original no banco/env
            restore_payload = json.dumps({"COPY_GENERATION_MODEL": original_model}).encode("utf-8")
            restore_req = urllib.request.Request(
                self.keys_url,
                data=restore_payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.token}"
                },
                method="POST"
            )
            with urllib.request.urlopen(restore_req, timeout=5) as restore_resp:
                pass

        print("\n[OK] Teste de API do Modelo de Copy passou com sucesso!")

if __name__ == "__main__":
    unittest.main()
