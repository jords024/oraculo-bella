import http.cookiejar
import json
import unittest
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

class TestFinancialAPI(unittest.TestCase):
    def setUp(self):
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.cookie_jar),
            NoRedirectHandler()
        )

    def test_financial_summary_endpoint(self):
        """Verifica se o endpoint GET /api/financial/summary retorna todos os campos e cálculos esperados"""
        login_url = "http://localhost:3131/auth/login"
        financial_url = "http://localhost:3131/api/financial/summary"

        login_data = json.dumps({
            "username": "aryarajmarketing@gmail.com",
            "password": "123456"
        }).encode("utf-8")

        try:
            # 1. Login
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

            # 2. Chamada ao endpoint /api/financial/summary
            headers = {"Authorization": f"Bearer {token}"} if token else {}
            fin_req = urllib.request.Request(financial_url, headers=headers, method="GET")
            with urllib.request.urlopen(fin_req, timeout=5) as fin_resp:
                self.assertEqual(fin_resp.status, 200)
                data = json.loads(fin_resp.read().decode("utf-8"))

                # Validação da estrutura principal
                self.assertIn("summary", data, "Campo 'summary' ausente")
                self.assertIn("providers", data, "Campo 'providers' ausente")
                self.assertIn("byStatus", data, "Campo 'byStatus' ausente")
                self.assertIn("topThemes", data, "Campo 'topThemes' ausente")
                self.assertIn("carousels", data, "Campo 'carousels' ausente")

                summary = data["summary"]
                self.assertIn("totalCarousels", summary)
                self.assertIn("totalSlides", summary)
                self.assertIn("totalPaidSlides", summary)
                self.assertIn("totalFreeSlides", summary)
                self.assertIn("totalCostUsd", summary)
                self.assertIn("totalCostBrl", summary)
                self.assertIn("totalSavedUsd", summary)
                self.assertIn("totalSavedBrl", summary)
                self.assertIn("avgCostPerCarouselBrl", summary)
                self.assertIn("avgCostPerSlideBrl", summary)
                self.assertIn("usdRate", summary)
                self.assertEqual(summary["usdRate"], 5.00)

                # Validar tipos
                self.assertIsInstance(summary["totalCarousels"], int)
                self.assertIsInstance(summary["totalSlides"], int)
                self.assertTrue(isinstance(summary["totalCostBrl"], (int, float)))
                self.assertTrue(isinstance(summary["totalSavedBrl"], (int, float)))
                self.assertIsInstance(data["providers"], list)
                self.assertIsInstance(data["carousels"], list)

                # Valida itens de carrosséis se houver
                if len(data["carousels"]) > 0:
                    first_c = data["carousels"][0]
                    self.assertIn("id", first_c)
                    self.assertIn("title", first_c)
                    self.assertIn("imageProvider", first_c)
                    self.assertIn("costBrl", first_c)
                    self.assertIn("costUsd", first_c)
                    self.assertIn("paidSlides", first_c)
                    self.assertIn("freeSlides", first_c)

                print("\n[OK] Teste de Financial API passou com sucesso! Resumo:", json.dumps(summary, indent=2))
        except Exception as e:
            self.fail(f"Falha no teste da API Financeira: {e}")

if __name__ == '__main__':
    unittest.main()
