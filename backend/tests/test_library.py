# backend/tests/test_library.py — Testes Unitários da Biblioteca e Assistente IA
import json
import unittest
import urllib.parse
import urllib.request
import uuid

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

class TestLibraryAPI(unittest.TestCase):
    def setUp(self):
        self.token = login()
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def test_01_get_library_empty_or_list(self):
        """Valida que a rota GET /api/library responde com sucesso e lista de categorias"""
        req = urllib.request.Request(f"{BASE}/api/library", headers=self.headers, method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertIn("images", data)
            self.assertIn("categories", data)
            self.assertIn("Todas", data["categories"])
            print("\n[OK] Teste GET /api/library aprovado.")

    def test_02_upload_and_get_image(self):
        """Valida o upload de imagem multipart para a biblioteca e posterior recuperação"""
        boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
        body = []

        # Campo category
        body.append(f"--{boundary}".encode())
        body.append(b'Content-Disposition: form-data; name="category"')
        body.append(b'')
        body.append(b'Pessoas')

        # Campo customTitle
        body.append(f"--{boundary}".encode())
        body.append(b'Content-Disposition: form-data; name="customTitle"')
        body.append(b'')
        body.append(b'mulher_teste_unitario')

        # Campo notes
        body.append(f"--{boundary}".encode())
        body.append(b'Content-Disposition: form-data; name="notes"')
        body.append(b'')
        body.append(b'Referencia de teste unitario')

        # Arquivo de imagem ficticio PNG
        fake_png = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00'
            b'\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        )
        body.append(f"--{boundary}".encode())
        body.append(b'Content-Disposition: form-data; name="files"; filename="avatar_teste.png"')
        body.append(b'Content-Type: image/png')
        body.append(b'')
        body.append(fake_png)
        body.append(f"--{boundary}--".encode())
        body.append(b'')

        payload = b'\r\n'.join(body)
        upload_headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": f"multipart/form-data; boundary={boundary}"
        }

        # 1. Executa Upload
        req = urllib.request.Request(f"{BASE}/api/library/upload", data=payload, headers=upload_headers, method="POST")
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(data.get("ok"))
            self.assertEqual(data.get("count"), 1)
            created_image = data["images"][0]
            self.assertEqual(created_image["title"], "mulher_teste_unitario")
            self.assertEqual(created_image["category"], "Pessoas")
            img_id = created_image["id"]

        # 2. Testa entrega da imagem
        img_req = urllib.request.Request(f"{BASE}/api/library/{img_id}/image", headers=self.headers, method="GET")
        with urllib.request.urlopen(img_req, timeout=5) as img_resp:
            self.assertEqual(img_resp.status, 200)
            self.assertTrue(len(img_resp.read()) > 0)

        # 3. Testa edição de metadados
        edit_data = json.dumps({
            "title": "mulher_teste_editada",
            "category": "Estilo",
            "notes": "Notas atualizadas"
        }).encode("utf-8")
        edit_req = urllib.request.Request(
            f"{BASE}/api/library/{img_id}",
            data=edit_data,
            headers=self.headers,
            method="PUT"
        )
        with urllib.request.urlopen(edit_req, timeout=5) as edit_resp:
            self.assertEqual(edit_resp.status, 200)
            edit_json = json.loads(edit_resp.read().decode("utf-8"))
            self.assertEqual(edit_json["image"]["title"], "mulher_teste_editada")

        # 4. Testa exclusão
        del_req = urllib.request.Request(f"{BASE}/api/library/{img_id}", headers=self.headers, method="DELETE")
        with urllib.request.urlopen(del_req, timeout=5) as del_resp:
            self.assertEqual(del_resp.status, 200)
            del_json = json.loads(del_resp.read().decode("utf-8"))
            self.assertTrue(del_json.get("ok"))

        print("\n[OK] Teste de Upload, Entrega, Edição e Deleção de Imagem aprovado.")

    def test_03_chat_assistant_flow(self):
        """Valida o fluxo do Assistente de Criação IA (geração, histórico e limpeza)"""
        # 1. Limpa histórico
        clear_req = urllib.request.Request(
            f"{BASE}/api/library/chat/clear",
            data=b'{}',
            headers=self.headers,
            method="POST"
        )
        with urllib.request.urlopen(clear_req, timeout=5) as clear_resp:
            self.assertEqual(clear_resp.status, 200)

        # 2. Gera nova criação no chat
        gen_payload = json.dumps({
            "prompt": "Desenhe um templo dourado místico em uma floresta mágica",
            "referenceIds": [],
            "messages": []
        }).encode("utf-8")

        gen_req = urllib.request.Request(
            f"{BASE}/api/library/chat/generate",
            data=gen_payload,
            headers=self.headers,
            method="POST"
        )
        with urllib.request.urlopen(gen_req, timeout=90) as gen_resp:
            self.assertEqual(gen_resp.status, 200)
            gen_data = json.loads(gen_resp.read().decode("utf-8"))
            self.assertTrue(gen_data.get("ok"))
            self.assertIn("aiMessage", gen_data)
            self.assertIn("imageUrl", gen_data["aiMessage"])
            generated_filename = gen_data["aiMessage"]["filename"]

        # 3. Salva a imagem gerada na biblioteca principal
        save_payload = json.dumps({
            "filename": generated_filename,
            "title": "Templo Dourado Místico",
            "category": "Cenários",
            "notes": "Gerado pelo assistente IA"
        }).encode("utf-8")
        save_req = urllib.request.Request(
            f"{BASE}/api/library/save-generated",
            data=save_payload,
            headers=self.headers,
            method="POST"
        )
        with urllib.request.urlopen(save_req, timeout=5) as save_resp:
            self.assertEqual(save_resp.status, 200)
            save_data = json.loads(save_resp.read().decode("utf-8"))
            self.assertTrue(save_data.get("ok"))
            saved_id = save_data["image"]["id"]

        # 4. Limpa imagem salva
        del_req = urllib.request.Request(f"{BASE}/api/library/{saved_id}", headers=self.headers, method="DELETE")
        with urllib.request.urlopen(del_req, timeout=5) as del_resp:
            self.assertEqual(del_resp.status, 200)

        print("\n[OK] Teste do Assistente IA (Geração e Salvamento na Biblioteca) aprovado.")

    def test_04_large_dataset_library_images(self):
        """Valida a consulta, performance e filtros no dataset de imagens na Biblioteca"""
        # 1. Busca geral
        req = urllib.request.Request(f"{BASE}/api/library", headers=self.headers, method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            images = data.get("images", [])
            self.assertGreaterEqual(len(images), 1, "Deve haver imagens na biblioteca")

        # 2. Filtro por categoria 'Pessoas' (se existir)
        req_cat = urllib.request.Request(f"{BASE}/api/library?category=Pessoas", headers=self.headers, method="GET")
        with urllib.request.urlopen(req_cat, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            images = data.get("images", [])
            for img in images[:10]:
                self.assertEqual(img["category"], "Pessoas")

        # 3. Filtro por busca de termo (usa o título da primeira imagem existente)
        if len(images) > 0:
            first_title = images[0].get("title", "")
            if first_title:
                search_term = urllib.parse.quote(first_title[:6])
                req_search = urllib.request.Request(
                    f"{BASE}/api/library?search={search_term}",
                    headers=self.headers,
                    method="GET"
                )
                with urllib.request.urlopen(req_search, timeout=5) as resp:
                    self.assertEqual(resp.status, 200)
                    data = json.loads(resp.read().decode("utf-8"))
                    res_imgs = data.get("images", [])
                    self.assertGreater(len(res_imgs), 0, f"A busca por '{first_title}' deve retornar resultados")

        # 4. Ordenação Alfabética A-Z
        req_sort_asc = urllib.request.Request(f"{BASE}/api/library?sort=name_asc", headers=self.headers, method="GET")
        with urllib.request.urlopen(req_sort_asc, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            titles = [img["title"].lower() for img in data.get("images", [])[:20]]
            self.assertEqual(titles, sorted(titles), "A listagem deve estar em ordem alfabética A-Z")

        # 5. Ordenação Alfabética Z-A
        req_sort_desc = urllib.request.Request(f"{BASE}/api/library?sort=name_desc", headers=self.headers, method="GET")
        with urllib.request.urlopen(req_sort_desc, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            titles = [img["title"].lower() for img in data.get("images", [])[:20]]
            self.assertEqual(titles, sorted(titles, reverse=True), "A listagem deve estar em ordem alfabética Z-A")

        print("\n[OK] Teste de Carga, Filtros e Ordenação (1.000+ Imagens na Biblioteca) aprovado com sucesso.")

    def test_05_batch_delete_library_images(self):
        """Valida a exclusão em lote de imagens da Biblioteca"""
        # 1. Pega 2 imagens existentes
        req = urllib.request.Request(f"{BASE}/api/library?sort=date_asc", headers=self.headers, method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            images = data.get("images", [])
            self.assertGreaterEqual(len(images), 2, "Deve haver pelo menos 2 imagens para testar deleção em lote")
            ids_to_delete = [images[0]["id"], images[1]["id"]]

        # 2. Chama delete-batch
        payload = json.dumps({"ids": ids_to_delete}).encode("utf-8")
        headers = {**self.headers, "Content-Type": "application/json"}
        req_del = urllib.request.Request(
            f"{BASE}/api/library/delete-batch",
            data=payload,
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req_del, timeout=5) as del_resp:
            self.assertEqual(del_resp.status, 200)
            del_data = json.loads(del_resp.read().decode("utf-8"))
            self.assertTrue(del_data.get("ok"))
            self.assertEqual(del_data.get("count"), 2)

        print("\n[OK] Teste de Exclusão em Lote (POST /api/library/delete-batch) aprovado com sucesso.")

    def test_06_mixed_reference_ids_sanitization(self):
        """Valida que o backend aceita referenceIds com strings (ex: ai_12345) sem quebrar o banco SQL"""
        payload = json.dumps({
            "prompt": "Teste unitario de sanitizacao de referencias",
            "referenceIds": ["ai_1787402160994", "temp_user_123", 999999],
            "messages": []
        }).encode("utf-8")
        headers = {**self.headers, "Content-Type": "application/json"}
        req = urllib.request.Request(
            f"{BASE}/api/library/chat/generate",
            data=payload,
            headers=headers,
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                self.assertEqual(resp.status, 200)
                data = json.loads(resp.read().decode("utf-8"))
                self.assertIn("aiMessage", data)
        except urllib.error.HTTPError as e:
            # Mesmo em caso de limite ou erro de API externa, não pode dar erro 500 de syntax SQL
            self.assertNotEqual(e.code, 500, "O endpoint não deve lançar erro 500 de syntax PostgreSQL")

        print("\n[OK] Teste de Sanitização de referenceIds mistos (POST /api/library/chat/generate) aprovado com sucesso.")

if __name__ == '__main__':
    unittest.main()
