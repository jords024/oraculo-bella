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

class TestNoImageSlidesCount(unittest.TestCase):
    def test_create_carousel_with_no_image_slides(self):
        token = login()
        url = f"{BASE}/api/carousels"
        payload = {
            "title": "Teste Slides Fundo Preto",
            "theme": "teste-fundo-preto",
            "totalSlides": 10,
            "noImageSlidesCount": 10,
            "imageQuality": "high"
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}'
            },
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            res_data = json.loads(resp.read().decode('utf-8'))
            self.assertIn("id", res_data)
            self.assertEqual(res_data.get("no_image_slides_count"), 10)
            self.assertEqual(res_data.get("totalSlides"), 10)
            print(f"\n[TEST OK] Carrossel {res_data['id']} criado com sucesso com no_image_slides_count = 10")

if __name__ == "__main__":
    unittest.main()
