import json
import unittest
import urllib.parse
import urllib.request


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def http_error_302(self, req, fp, code, msg, headers):
        return fp
    def http_error_301(self, req, fp, code, msg, headers):
        return fp
    def http_error_303(self, req, fp, code, msg, headers):
        return fp
    def http_error_307(self, req, fp, code, msg, headers):
        return fp

class TestBackups(unittest.TestCase):
    def setUp(self):
        self.super_opener = urllib.request.build_opener(NoRedirectHandler())
        self.login_url = "http://localhost:3131/auth/login"
        self.config_url = "http://localhost:3131/api/backups/config"
        self.list_url = "http://localhost:3131/api/backups/list"

        # Login via JSON JWT payload
        login_data = json.dumps({
            "username": "aryarajmarketing@gmail.com",
            "password": "123456"
        }).encode("utf-8")
        login_req = urllib.request.Request(
            self.login_url,
            data=login_data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with self.super_opener.open(login_req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            res_json = json.loads(resp.read().decode("utf-8"))
            self.assertIn("token", res_json)
            self.token = res_json["token"]
            self.auth_headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }

    def test_backup_endpoints(self):
        # 1. Carrega a configuração padrão de backup
        req_config = urllib.request.Request(self.config_url, headers=self.auth_headers, method="GET")
        with self.super_opener.open(req_config, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            config = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(config["id"], 1)
            self.assertIn("enabled", config)
            self.assertIn("frequency", config)

        # 2. Atualiza a configuração de backup
        update_payload = json.dumps({
            "enabled": True,
            "frequency": "minutes",
            "interval_val": 15,
            "s3_folder": "test_backups/",
            "retention": 10
        }).encode("utf-8")
        req_update = urllib.request.Request(
            self.config_url,
            data=update_payload,
            headers=self.auth_headers,
            method="POST"
        )
        with self.super_opener.open(req_update, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            res_data = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(res_data["ok"])

        # 3. Verifica se as alterações foram salvas
        with self.super_opener.open(req_config, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            config = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(config["enabled"])
            self.assertEqual(config["frequency"], "minutes")
            self.assertEqual(config["interval_val"], 15)
            self.assertEqual(config["s3_folder"], "test_backups/")
            self.assertEqual(config["retention"], 10)

        # 4. Verifica a listagem de logs de backup
        req_list = urllib.request.Request(self.list_url, headers=self.auth_headers, method="GET")
        with self.super_opener.open(req_list, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            backup_list = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(isinstance(backup_list, list))

        # 5. Testa o endpoint de exclusão em massa (bulk-delete) com lista vazia (deve falhar com 400)
        req_bulk_fail = urllib.request.Request(
            "http://localhost:3131/api/backups/bulk-delete",
            data=json.dumps({"filenames": []}).encode("utf-8"),
            headers=self.auth_headers,
            method="POST"
        )
        try:
            with self.super_opener.open(req_bulk_fail, timeout=5) as resp:
                self.assertEqual(resp.status, 400)
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)

        # Restaura a configuração original para não sujar o banco de dados do desenvolvedor
        restore_payload = json.dumps({
            "enabled": config["enabled"],
            "frequency": config["frequency"],
            "interval_val": config["interval_val"],
            "s3_folder": config["s3_folder"],
            "retention": config["retention"]
        }).encode("utf-8")
        req_restore = urllib.request.Request(
            self.config_url,
            data=restore_payload,
            headers=self.auth_headers,
            method="POST"
        )
        with self.super_opener.open(req_restore, timeout=5) as resp:
            self.assertEqual(resp.status, 200)

        print("[OK] Teste de backup endpoints passou com sucesso!")

if __name__ == "__main__":
    unittest.main()
