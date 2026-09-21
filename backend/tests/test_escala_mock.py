import json
import unittest
import urllib.parse
import urllib.request


class TestEscalaMock(unittest.TestCase):
    def test_escala_criar_mock(self):
        """Verifica se o endpoint de criação de carrossel mockado no teste de escala funciona corretamente para super admin usando JWT"""
        login_url = "http://localhost:3131/auth/login"
        escala_url = "http://localhost:3131/api/escala/criar-mock"

        # 1. Login usando as credenciais do arquivo acesso-sistema.md
        login_payload = {
            "username": "aryarajmarketing@gmail.com",
            "password": "123456"
        }

        try:
            login_data = json.dumps(login_payload).encode("utf-8")
            login_req = urllib.request.Request(
                login_url,
                data=login_data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )

            token = None
            with urllib.request.urlopen(login_req, timeout=5) as login_resp:
                self.assertEqual(login_resp.status, 200)
                resp_json = json.loads(login_resp.read().decode("utf-8"))
                token = resp_json.get("token")

            self.assertIsNotNone(token, "Token JWT não foi retornado no login")

            # 2. Enviar requisição para criar mock com cabeçalho Bearer Token
            payload = {
                "title": "Mentalidade de Escassez Lote Teste",
                "format": "B",
                "slides": [
                    {"num": 1, "title_text": "Slide 1 Teste", "text": "Corpo do slide 1"},
                    {"num": 2, "title_text": "Slide 2 Teste", "text": "Corpo do slide 2"}
                ]
            }

            payload_data = json.dumps(payload).encode("utf-8")
            escala_req = urllib.request.Request(
                escala_url,
                data=payload_data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {token}"
                },
                method="POST"
            )

            with urllib.request.urlopen(escala_req, timeout=5) as escala_resp:
                self.assertEqual(escala_resp.status, 200)
                data = json.loads(escala_resp.read().decode("utf-8"))

                # Validações da resposta
                self.assertTrue(data.get("ok"))
                carousel = data.get("carousel")
                self.assertIsNotNone(carousel)
                self.assertEqual(carousel.get("title"), "Mentalidade de Escassez Lote Teste")
                self.assertEqual(carousel.get("format"), "B")
                self.assertEqual(carousel.get("status"), "generating")
                self.assertEqual(carousel.get("totalSlides"), 2)
                self.assertEqual(carousel.get("cost"), 2 * 0.08)

                print("\n[OK] Teste de Escala Mock API passou com sucesso! Carrossel criado:", carousel["id"])

        except Exception as e:
            self.fail(f"Falha ao rodar teste de escala mock: {e}")

if __name__ == '__main__':
    unittest.main()
