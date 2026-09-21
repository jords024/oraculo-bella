"""
Teste de smoke rápido: valida endpoints críticos sem gerar carrossel real.
NÃO dispara SSE nem criação de slides.
"""
import json
import unittest
import urllib.request

BASE = "http://localhost:3131"


def login():
    req = urllib.request.Request(
        f"{BASE}/auth/login",
        data=json.dumps({"username": "aryarajmarketing@gmail.com", "password": "123456"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        return json.loads(r.read())["token"]


class TestSmoke(unittest.TestCase):

    def test_01_login_ok(self):
        """Login retorna token JWT"""
        token = login()
        self.assertIsNotNone(token, "Login deve retornar token")
        print("\n[OK] Login JWT funcionando")

    def test_02_carousels_lista(self):
        """GET /api/carousels retorna lista (pode ser vazia)"""
        token = login()
        req = urllib.request.Request(
            f"{BASE}/api/carousels",
            headers={"Authorization": f"Bearer {token}"},
            method="GET"
        )
        with urllib.request.urlopen(req, timeout=5) as r:
            self.assertEqual(r.status, 200)
            data = json.loads(r.read())
            self.assertIsInstance(data, list)
        print(f"[OK] GET /api/carousels retornou {len(data)} itens")

    def test_03_branding_ok(self):
        """GET /api/settings/branding retorna campos de branding"""
        token = login()
        req = urllib.request.Request(
            f"{BASE}/api/settings/branding",
            headers={"Authorization": f"Bearer {token}"},
            method="GET"
        )
        with urllib.request.urlopen(req, timeout=5) as r:
            self.assertEqual(r.status, 200)
            data = json.loads(r.read())
            self.assertIn("logoText", data)
        print("[OK] GET /api/settings/branding funcionando")

    def test_04_stats_ok(self):
        """GET /api/stats retorna estatísticas"""
        token = login()
        req = urllib.request.Request(
            f"{BASE}/api/stats",
            headers={"Authorization": f"Bearer {token}"},
            method="GET"
        )
        with urllib.request.urlopen(req, timeout=5) as r:
            self.assertEqual(r.status, 200)
        print("[OK] GET /api/stats funcionando")


if __name__ == "__main__":
    unittest.main()
