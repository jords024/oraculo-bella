import http.cookiejar
import json
import unittest
import urllib.parse
import urllib.request


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def http_error_302(self, req, fp, code, msg, headers):
        # Retorna a resposta de redirect sem lançar exceção
        return fp
    def http_error_301(self, req, fp, code, msg, headers):
        return fp
    def http_error_303(self, req, fp, code, msg, headers):
        return fp
    def http_error_307(self, req, fp, code, msg, headers):
        return fp

class TestStatsAPI(unittest.TestCase):
    def setUp(self):
        # Configurar cookie jar para manter a sessão (cookie fo_sess)
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.cookie_jar),
            NoRedirectHandler()
        )

    def test_stats_keys(self):
        """Verifica se as chaves necessárias para o Frontend do Dashboard estão presentes na API de Stats após autenticação"""
        login_url = "http://localhost:3131/auth/login"
        stats_url = "http://localhost:3131/api/stats"

        # Dados de login (usando credenciais padrão do ambiente de desenvolvimento)
        login_data = json.dumps({
            "username": "aryarajmarketing@gmail.com",
            "password": "123456"
        }).encode("utf-8")

        try:
            # 1. Faz o Login para obter o token JWT
            login_req = urllib.request.Request(
                login_url,
                data=login_data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            token = ""
            with urllib.request.urlopen(login_req, timeout=5) as login_resp:
                self.assertEqual(login_resp.status, 200)
                body = json.loads(login_resp.read().decode("utf-8"))
                token = body.get("token", "")

            # 2. Faz a chamada ao endpoint de stats usando o token obtido
            headers = {"Authorization": f"Bearer {token}"} if token else {}
            stats_req = urllib.request.Request(stats_url, headers=headers, method="GET")
            with urllib.request.urlopen(stats_req, timeout=5) as stats_resp:
                self.assertEqual(stats_resp.status, 200)
                data = json.loads(stats_resp.read().decode("utf-8"))

                # Campos necessários pelo Frontend Dashboard.jsx
                self.assertIn("total", data, "Campo 'total' ausente no JSON do stats")
                self.assertIn("slides", data, "Campo 'slides' ausente no JSON do stats")
                self.assertIn("aprovados", data, "Campo 'aprovados' ausente no JSON do stats")
                self.assertIn("publicados", data, "Campo 'publicados' ausente no JSON do stats")
                self.assertIn("cost", data, "Campo 'cost' ausente no JSON do stats")

                # Valida tipos de dados
                self.assertIsInstance(data["total"], int)
                self.assertIsInstance(data["slides"], int)
                self.assertIsInstance(data["aprovados"], int)
                self.assertIsInstance(data["publicados"], int)
                self.assertTrue(isinstance(data["cost"], (int, float)))

                # Valida dados não negativos
                self.assertGreaterEqual(data["total"], 0, "Total deve ser >= 0")
                self.assertGreaterEqual(data["slides"], 0, "Slides deve ser >= 0")
                self.assertGreaterEqual(data["aprovados"], 0, "Aprovados deve ser >= 0")

                print("\n[OK] Teste de Stats API passou com sucesso! Resposta:", json.dumps(data, indent=2))
        except Exception as e:
            self.fail(f"Falha ao conectar com o backend ou processar a resposta: {e}")

if __name__ == '__main__':
    unittest.main()
