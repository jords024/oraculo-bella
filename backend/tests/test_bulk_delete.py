import http.cookiejar
import json
import unittest
import urllib.parse
import urllib.request


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def http_error_302(self, req, fp, code, msg, headers):
        return fp

class TestBulkDeleteAPI(unittest.TestCase):
    def setUp(self):
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.cookie_jar),
            NoRedirectHandler()
        )
        self.login_url = "http://localhost:3131/auth/login"
        self.carousels_url = "http://localhost:3131/api/carousels"
        self.bulk_delete_url = "http://localhost:3131/api/carousels/bulk-delete"

        # Efetua login antes de rodar o teste
        login_data = urllib.parse.urlencode({
            "username": "aryarajmarketing@gmail.com",
            "password": "123456"
        }).encode("utf-8")

        login_req = urllib.request.Request(
            self.login_url,
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST"
        )
        with self.opener.open(login_req, timeout=5) as resp:
            self.assertEqual(resp.status, 302)

    def test_create_and_bulk_delete(self):
        """Cria dois carrosséis de teste e os deleta em lote validando a operação"""

        # 1. Criar Carrossel A
        payload_a = json.dumps({
            "title": "Carrossel de Teste Bulk A",
            "theme": "teste-bulk-a",
            "format": "B"
        }).encode("utf-8")
        req_a = urllib.request.Request(
            self.carousels_url,
            data=payload_a,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with self.opener.open(req_a, timeout=5) as resp_a:
            self.assertEqual(resp_a.status, 200)
            data_a = json.loads(resp_a.read().decode("utf-8"))
            id_a = data_a["id"]
            self.assertTrue(id_a.startswith("carrossel-"))

        # 2. Criar Carrossel B
        payload_b = json.dumps({
            "title": "Carrossel de Teste Bulk B",
            "theme": "teste-bulk-b",
            "format": "A"
        }).encode("utf-8")
        req_b = urllib.request.Request(
            self.carousels_url,
            data=payload_b,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with self.opener.open(req_b, timeout=5) as resp_b:
            self.assertEqual(resp_b.status, 200)
            data_b = json.loads(resp_b.read().decode("utf-8"))
            id_b = data_b["id"]
            self.assertTrue(id_b.startswith("carrossel-"))

        # 3. Deletar os dois carrosséis criados usando a API bulk-delete
        bulk_payload = json.dumps({
            "ids": [id_a, id_b]
        }).encode("utf-8")
        bulk_req = urllib.request.Request(
            self.bulk_delete_url,
            data=bulk_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with self.opener.open(bulk_req, timeout=5) as bulk_resp:
            self.assertEqual(bulk_resp.status, 200)
            bulk_data = json.loads(bulk_resp.read().decode("utf-8"))

            # Validações da resposta
            self.assertTrue(bulk_data["ok"])
            self.assertEqual(bulk_data["deletedCount"], 2)
            self.assertIn("carrosséis apagados com sucesso", bulk_data["message"])

        # 4. Validar se os carrosséis sumiram da listagem geral
        list_req = urllib.request.Request(self.carousels_url, method="GET")
        with self.opener.open(list_req, timeout=5) as list_resp:
            self.assertEqual(list_resp.status, 200)
            list_data = json.loads(list_resp.read().decode("utf-8"))

            remaining_ids = [c["id"] for c in list_data]
            self.assertNotIn(id_a, remaining_ids, "O carrossel A não deveria constar na lista após a deleção")
            self.assertNotIn(id_b, remaining_ids, "O carrossel B não deveria constar na lista após a deleção")

        print("\n[OK] Teste de Deleção em Lote (Bulk Delete) passou com sucesso!")

if __name__ == '__main__':
    unittest.main()
