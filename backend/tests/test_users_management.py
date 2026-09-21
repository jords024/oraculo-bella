import json
import time
import unittest
import urllib.parse
import urllib.request


class TestUsersManagement(unittest.TestCase):
    def setUp(self):
        self.login_url = "http://localhost:3131/auth/login"
        self.users_url = "http://localhost:3131/api/users"
        self.invites_url = "http://localhost:3131/api/users/invitations"
        self.register_url = "http://localhost:3131/api/users/register"
        self.me_url = "http://localhost:3131/api/me"

        # Login como Super Admin
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
        with urllib.request.urlopen(login_req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            self.super_token = data["token"]
            self.super_headers = {
                "Authorization": f"Bearer {self.super_token}",
                "Content-Type": "application/json"
            }

    def test_full_users_flow(self):
        """Valida todo o ciclo de vida: convite, registro, autenticação e restrições de permissão"""

        # 1. Super Admin lista usuários (deve conter o Super Admin)
        req_list = urllib.request.Request(self.users_url, headers=self.super_headers, method="GET")
        with urllib.request.urlopen(req_list, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            users = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(len(users) >= 1)
            self.assertEqual(users[0]["id"], "super-admin")
            self.assertTrue(users[0]["isSuperAdmin"])

        # 2. Super Admin cria um convite para "user" com duração de 24 horas e permissões personalizadas
        invite_payload = json.dumps({
            "role": "user",
            "hours": 24,
            "permissions": {
                "carrosseis": "liberado",
                "criador": "em_breve",
                "criador_pct": 75,
                "radar": "bloqueado"
            }
        }).encode("utf-8")
        req_invite = urllib.request.Request(
            self.invites_url,
            data=invite_payload,
            headers=self.super_headers,
            method="POST"
        )
        with urllib.request.urlopen(req_invite, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            invite_data = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(invite_data["ok"])
            invite_id = invite_data["inviteId"]

        # 3. Verifica convite publicamente
        verify_url = f"{self.invites_url}/{invite_id}/verify"
        req_verify = urllib.request.Request(verify_url, method="GET")
        with urllib.request.urlopen(req_verify, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            verify_data = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(verify_data["valid"])
            self.assertEqual(verify_data["role"], "user")

        # 4. Registra novo usuário através do convite
        test_email = f"colaborador-{int(time.time())}@teste.com"
        register_payload = json.dumps({
            "inviteId": invite_id,
            "name": "Colaborador Teste",
            "email": test_email,
            "password": "senha-segura-123"
        }).encode("utf-8")
        req_register = urllib.request.Request(
            self.register_url,
            data=register_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req_register, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            register_res = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(register_res["ok"])

        # 5. Verifica que o convite não é mais válido (foi aceito)
        try:
            with urllib.request.urlopen(req_verify, timeout=5) as resp:
                self.fail("Deveria ter retornado erro para convite aceito")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)

        # 6. Autentica com o novo colaborador
        user_login_payload = json.dumps({
            "username": test_email,
            "password": "senha-segura-123"
        }).encode("utf-8")
        user_login_req = urllib.request.Request(
            self.login_url,
            data=user_login_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(user_login_req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            user_auth_data = json.loads(resp.read().decode("utf-8"))
            user_token = user_auth_data["token"]
            user_headers = {
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }

        # 7. Novo colaborador chama /api/me e verifica que seu cargo é "user" e possui as permissões herdadas do convite
        req_me = urllib.request.Request(self.me_url, headers=user_headers, method="GET")
        with urllib.request.urlopen(req_me, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            me_data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(me_data["email"], test_email)
            self.assertEqual(me_data["role"], "user")
            self.assertFalse(me_data["isSuperAdmin"])
            self.assertEqual(me_data["permissions"]["carrosseis"], "liberado")
            self.assertEqual(me_data["permissions"]["criador"], "em_breve")
            self.assertEqual(me_data["permissions"]["criador_pct"], 75)
            self.assertEqual(me_data["permissions"]["radar"], "bloqueado")

        # 8. Novo colaborador tenta acessar listagem de usuários e recebe 403 (Forbidden)
        req_list_user = urllib.request.Request(self.users_url, headers=user_headers, method="GET")
        try:
            with urllib.request.urlopen(req_list_user, timeout=5) as resp:
                self.fail("Deveria ter bloqueado acesso com 403")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 403)

        # 9. Super Admin edita o novo colaborador no banco
        user_id = None
        with urllib.request.urlopen(req_list, timeout=5) as resp:
            users = json.loads(resp.read().decode("utf-8"))
            for u in users:
                if u["email"] == test_email:
                    user_id = u["id"]
                    break

        self.assertIsNotNone(user_id)

        edit_payload = json.dumps({
            "name": "Colaborador Editado",
            "email": test_email,
            "role": "admin",
            "permissions": {
                "carrosseis": "liberado",
                "criador": "liberado",
                "radar": "liberado"
            }
        }).encode("utf-8")
        req_edit = urllib.request.Request(
            f"{self.users_url}/{user_id}",
            data=edit_payload,
            headers=self.super_headers,
            method="PUT"
        )
        with urllib.request.urlopen(req_edit, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            edit_res = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(edit_res["ok"])

        # Verifica se as permissões foram atualizadas na listagem
        with urllib.request.urlopen(req_list, timeout=5) as resp:
            users = json.loads(resp.read().decode("utf-8"))
            for u in users:
                if u["email"] == test_email:
                    self.assertEqual(u["permissions"]["radar"], "liberado")
                    break

        # 10. Super Admin tenta editar ou excluir o Super Admin fictício e recebe 400
        req_edit_super = urllib.request.Request(
            f"{self.users_url}/super-admin",
            data=edit_payload,
            headers=self.super_headers,
            method="PUT"
        )
        try:
            with urllib.request.urlopen(req_edit_super, timeout=5) as resp:
                self.fail("Deveria ter rejeitado edição do super-admin")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)

        req_del_super = urllib.request.Request(
            f"{self.users_url}/super-admin",
            headers=self.super_headers,
            method="DELETE"
        )
        try:
            with urllib.request.urlopen(req_del_super, timeout=5) as resp:
                self.fail("Deveria ter rejeitado deleção do super-admin")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)

        # 11. Super Admin exclui o colaborador promovido
        req_del = urllib.request.Request(f"{self.users_url}/{user_id}", headers=self.super_headers, method="DELETE")
        with urllib.request.urlopen(req_del, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            del_res = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(del_res["ok"])

        print("\n[OK] Teste completo de Gestão de Usuários passou com sucesso!")

    def test_large_dataset_users_and_invites(self):
        """Valida que o backend suporta e retorna os 1.000+ usuários e 2.000+ convites com múltiplos status e cargos"""
        # 1. Verifica listagem de usuários (deve conter mais de 1000)
        req_users = urllib.request.Request(self.users_url, headers=self.super_headers, method="GET")
        with urllib.request.urlopen(req_users, timeout=10) as resp:
            self.assertEqual(resp.status, 200)
            users = json.loads(resp.read().decode("utf-8"))
            self.assertGreaterEqual(len(users), 1000, "Deve haver pelo menos 1000 usuários cadastrados")

            roles = set(u.get("role") for u in users)
            self.assertIn("admin", roles)
            self.assertIn("user", roles)

        # 2. Verifica listagem de convites (deve conter mais de 2000)
        req_invites = urllib.request.Request(self.invites_url, headers=self.super_headers, method="GET")
        with urllib.request.urlopen(req_invites, timeout=10) as resp:
            self.assertEqual(resp.status, 200)
            invites = json.loads(resp.read().decode("utf-8"))
            self.assertGreaterEqual(len(invites), 2000, "Deve haver pelo menos 2000 convites enviados")

            statuses = set(i.get("status") for i in invites)
            self.assertIn("accepted", statuses, "Deve haver convites aceitos")
            self.assertIn("pending", statuses, "Deve haver convites pendentes")
            self.assertIn("expired", statuses, "Deve haver convites expirados")

            invite_roles = set(i.get("role") for i in invites)
            self.assertIn("admin", invite_roles)
            self.assertIn("user", invite_roles)

        print("\n[OK] Teste de validação de 1.000+ Usuários e 2.000+ Convites passou com sucesso!")

    def test_duplicate_email_rejection(self):
        """Valida que o sistema rejeita rigorosamente cadastro com e-mails duplicados (case-insensitive)"""
        # 1. Cria convite temporário
        invite_payload = json.dumps({"role": "user", "hours": 24, "permissions": {}}).encode("utf-8")
        req_invite = urllib.request.Request(
            self.invites_url,
            data=invite_payload,
            headers=self.super_headers,
            method="POST"
        )
        with urllib.request.urlopen(req_invite, timeout=5) as resp:
            invite_data = json.loads(resp.read().decode("utf-8"))
            invite_id = invite_data["inviteId"]

        # 2. Tenta registrar usando o e-mail do Super Admin exato
        dup_payload_1 = json.dumps({
            "inviteId": invite_id,
            "name": "Tentativa Duplicada",
            "email": "aryarajmarketing@gmail.com",
            "password": "Senha-forte-123!"
        }).encode("utf-8")
        req_dup_1 = urllib.request.Request(
            self.register_url,
            data=dup_payload_1,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req_dup_1, timeout=5) as resp:
                self.fail("Deveria ter rejeitado e-mail do Super Admin")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)
            err_data = json.loads(e.read().decode("utf-8"))
            self.assertIn("já está cadastrado", err_data.get("error", ""))

        # 3. Tenta registrar usando o e-mail em MAIÚSCULAS
        dup_payload_2 = json.dumps({
            "inviteId": invite_id,
            "name": "Tentativa Duplicada Maiuscula",
            "email": "ARYARAJMARKETING@GMAIL.COM",
            "password": "Senha-forte-123!"
        }).encode("utf-8")
        req_dup_2 = urllib.request.Request(
            self.register_url,
            data=dup_payload_2,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req_dup_2, timeout=5) as resp:
                self.fail("Deveria ter rejeitado e-mail em maiúsculas")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)
            err_data = json.loads(e.read().decode("utf-8"))
            self.assertIn("já está cadastrado", err_data.get("error", ""))

        print("\n[OK] Teste de Rejeição de E-mail Duplicado (Case-Insensitive) passou com sucesso!")

    def test_batch_delete_users_and_invites(self):
        """Valida os endpoints de exclusão em lote de usuários e convites"""
        # 1. Testa exclusão em lote de Usuários
        req_users = urllib.request.Request(self.users_url, headers=self.super_headers, method="GET")
        with urllib.request.urlopen(req_users, timeout=10) as resp:
            users = json.loads(resp.read().decode("utf-8"))
            deletable = [u["id"] for u in users if not u.get("isSuperAdmin")]
            self.assertGreaterEqual(len(deletable), 2, "Deve haver pelo menos 2 usuários para testar lote")
            ids_users_to_del = deletable[-2:]

        del_users_payload = json.dumps({"ids": ids_users_to_del}).encode("utf-8")
        req_del_users = urllib.request.Request(
            f"{self.users_url}/delete-batch",
            data=del_users_payload,
            headers=self.super_headers,
            method="POST"
        )
        with urllib.request.urlopen(req_del_users, timeout=10) as resp:
            self.assertEqual(resp.status, 200)
            del_data = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(del_data.get("ok"))
            self.assertEqual(del_data.get("count"), 2)

        # 2. Testa exclusão em lote de Convites
        req_invites = urllib.request.Request(self.invites_url, headers=self.super_headers, method="GET")
        with urllib.request.urlopen(req_invites, timeout=10) as resp:
            invites = json.loads(resp.read().decode("utf-8"))
            self.assertGreaterEqual(len(invites), 2, "Deve haver pelo menos 2 convites para testar lote")
            ids_invites_to_del = [invites[-1]["id"], invites[-2]["id"]]

        del_invites_payload = json.dumps({"ids": ids_invites_to_del}).encode("utf-8")
        req_del_invites = urllib.request.Request(
            f"{self.invites_url}/delete-batch",
            data=del_invites_payload,
            headers=self.super_headers,
            method="POST"
        )
        with urllib.request.urlopen(req_del_invites, timeout=10) as resp:
            self.assertEqual(resp.status, 200)
            del_data = json.loads(resp.read().decode("utf-8"))
            self.assertTrue(del_data.get("ok"))
            self.assertEqual(del_data.get("count"), 2)

        print("\n[OK] Teste de Exclusão em Lote de Usuários e Convites passou com sucesso!")

    def test_admin_access_and_super_admin_hidden_from_admin(self):
        """Valida que Administradores comuns podem acessar Gestão de Usuários mas NÃO veem o Super Admin listado"""
        # 1. Cria convite de cargo admin
        invite_payload = json.dumps({
            "role": "admin",
            "hours": 12,
            "permissions": {"carrosseis": "liberado", "criador": "liberado"}
        }).encode("utf-8")
        req_invite = urllib.request.Request(self.invites_url, data=invite_payload, headers=self.super_headers, method="POST")
        with urllib.request.urlopen(req_invite, timeout=5) as resp:
            invite_id = json.loads(resp.read().decode("utf-8"))["inviteId"]

        # 2. Registra o novo admin
        admin_email = f"gestor-admin-{int(time.time())}@teste.com"
        register_payload = json.dumps({
            "inviteId": invite_id,
            "name": "Gestor Admin Teste",
            "email": admin_email,
            "password": "senha-segura-123"
        }).encode("utf-8")
        req_reg = urllib.request.Request(self.register_url, data=register_payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req_reg, timeout=5) as resp:
            self.assertTrue(json.loads(resp.read().decode("utf-8"))["ok"])

        # 3. Autentica com o novo admin
        login_payload = json.dumps({"username": admin_email, "password": "senha-segura-123"}).encode("utf-8")
        req_login = urllib.request.Request(self.login_url, data=login_payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req_login, timeout=5) as resp:
            admin_token = json.loads(resp.read().decode("utf-8"))["token"]
            admin_headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}

        # 4. Novo Admin acessa GET /api/users com sucesso (Status 200)
        req_users_as_admin = urllib.request.Request(self.users_url, headers=admin_headers, method="GET")
        with urllib.request.urlopen(req_users_as_admin, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            users_list = json.loads(resp.read().decode("utf-8"))
            
            # Garante que NENHUM usuário na lista é o Super Admin
            for u in users_list:
                self.assertNotEqual(u.get("id"), "super-admin", "Super Admin não deve aparecer para administradores normais")
                self.assertFalse(u.get("isSuperAdmin", False), "isSuperAdmin não deve ser verdadeiro para nenhum usuário retornado")
                self.assertNotEqual(u.get("email"), "aryarajmarketing@gmail.com", "E-mail do super admin não deve aparecer para administradores normais")

        # 5. Super Admin acessa GET /api/users e DEVE ver o Super Admin no topo
        req_users_as_super = urllib.request.Request(self.users_url, headers=self.super_headers, method="GET")
        with urllib.request.urlopen(req_users_as_super, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            super_users_list = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(super_users_list[0]["id"], "super-admin")
            self.assertTrue(super_users_list[0]["isSuperAdmin"])

        print("\n[OK] Teste de Visibilidade de Administrador vs Super Admin passou com sucesso!")

if __name__ == '__main__':
    unittest.main()
