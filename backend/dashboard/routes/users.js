import express from "express";
import crypto from "crypto";
import { query } from "../db.js";
import { 
  requireSuperAdmin, 
  requireAdminOrSuperAdmin,
  isUserSuperAdmin,
  getSuperAdminEmail, 
  hashPassword,
  validatePasswordComplexity
} from "../state.js";
import { logger } from '../logger.js';

const router = express.Router();

// Listar todos os usuários (Admin e Super Admin)
// Nota: Administradores comuns NÃO veem o Super Admin listado
router.get('/api/users', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const dbUsers = await query("SELECT id, name, email, role, permissions, created_at FROM dashboard_users ORDER BY id ASC");
    const isSuper = isUserSuperAdmin(req.user?.email);

    if (isSuper) {
      // Insere o Super Admin virtual no topo da lista apenas para o próprio Super Admin
      const superAdminUser = {
        id: 'super-admin',
        name: process.env.DASHBOARD_USER_NAME || 'Super Admin',
        email: getSuperAdminEmail(),
        role: 'admin',
        created_at: new Date().toISOString(),
        isSuperAdmin: true,
        permissions: {
          carrosseis: 'liberado',
          criador: 'liberado',
          calendario: 'liberado',
          biblioteca: 'liberado',
          financeiro: 'liberado',
          reels: 'liberado',
          fabrica: 'liberado',
          oraculo: 'liberado',
          radar: 'liberado'
        }
      };
      
      const list = [superAdminUser, ...dbUsers.rows.map(u => ({ ...u, isSuperAdmin: false, permissions: u.permissions || {} }))];
      return res.json(list);
    }

    // Para administradores normais, oculta o Super Admin e retorna apenas os usuários comuns/admins cadastrados
    const filtered = dbUsers.rows.filter(u => !isUserSuperAdmin(u.email));
    res.json(filtered.map(u => ({ ...u, isSuperAdmin: false, permissions: u.permissions || {} })));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar usuários: ' + err.message });
  }
});

// Editar usuário (Admin e Super Admin)
router.put('/api/users/:id', requireAdminOrSuperAdmin, async (req, res) => {
  const { id } = req.params;
  if (id === 'super-admin') {
    return res.status(400).json({ error: 'O Super Admin do sistema não pode ser editado.' });
  }
  
  const { name, email, role, permissions } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }
  
  try {
    const checkUser = await query("SELECT * FROM dashboard_users WHERE id = $1", [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Bloqueia edição de usuário Super Admin por terceiros
    if (isUserSuperAdmin(checkUser.rows[0].email) && !isUserSuperAdmin(req.user?.email)) {
      return res.status(403).json({ error: 'Você não tem permissão para editar o Super Admin.' });
    }
    
    const checkEmail = await query("SELECT * FROM dashboard_users WHERE email = $1 AND id <> $2", [email, id]);
    if (checkEmail.rows.length > 0 || isUserSuperAdmin(email)) {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }
    
    await query(
      "UPDATE dashboard_users SET name = $1, email = $2, role = $3, permissions = $4 WHERE id = $5",
      [name, email, role, permissions || {}, id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao editar usuário: ' + err.message });
  }
});

// Excluir usuário (Admin e Super Admin)
router.delete('/api/users/:id', requireAdminOrSuperAdmin, async (req, res) => {
  const { id } = req.params;
  if (id === 'super-admin') {
    return res.status(400).json({ error: 'O Super Admin do sistema não pode ser excluído.' });
  }
  
  try {
    const checkUser = await query("SELECT * FROM dashboard_users WHERE id = $1", [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (isUserSuperAdmin(checkUser.rows[0].email)) {
      return res.status(403).json({ error: 'O Super Admin do sistema não pode ser excluído.' });
    }

    await query("DELETE FROM dashboard_users WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir usuário: ' + err.message });
  }
});

// Excluir usuários em lote (Admin e Super Admin)
router.post('/api/users/delete-batch', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Nenhum ID de usuário informado para exclusão.' });
    }

    const validNumericIds = ids.filter(id => id !== 'super-admin' && Number.isInteger(Number(id))).map(Number);
    if (validNumericIds.length === 0) {
      return res.status(400).json({ error: 'Nenhum usuário elegível para exclusão.' });
    }

    const deleteRes = await query("DELETE FROM dashboard_users WHERE id = ANY($1::int[])", [validNumericIds]);
    logger.info('[Users]', `🗑️ ${deleteRes.rowCount} usuários excluídos em lote com sucesso.`);

    res.json({ ok: true, count: deleteRes.rowCount });
  } catch (err) {
    logger.error('[Users]', 'Erro ao excluir usuários em lote:', err);
    res.status(500).json({ error: 'Erro ao excluir usuários em lote: ' + err.message });
  }
});

// Listar convites (Admin e Super Admin)
router.get('/api/users/invitations', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    // Atualiza expirados automaticamente
    await query("UPDATE invitations SET status = 'expired' WHERE expires_at < CURRENT_TIMESTAMP AND status = 'pending'");
    const invites = await query("SELECT * FROM invitations ORDER BY created_at DESC");
    res.json(invites.rows.map(inv => ({ ...inv, permissions: inv.permissions || {} })));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter convites: ' + err.message });
  }
});

// Criar convite (Admin e Super Admin)
router.post('/api/users/invitations', requireAdminOrSuperAdmin, async (req, res) => {
  const { role, hours, permissions } = req.body;
  if (!role || !hours) {
    return res.status(400).json({ error: 'Preencha o cargo e o prazo de expiração.' });
  }
  
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + Number(hours) * 60 * 60 * 1000);
  
  try {
    await query(
      "INSERT INTO invitations (id, role, expires_at, status, permissions) VALUES ($1, $2, $3, $4, $5)",
      [token, role, expiresAt, 'pending', permissions || {}]
    );
    res.json({ ok: true, inviteId: token });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar convite: ' + err.message });
  }
});

// Cancelar convite (Admin e Super Admin)
router.post('/api/users/invitations/:id/revoke', requireAdminOrSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await query("DELETE FROM invitations WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cancelar convite: ' + err.message });
  }
});

// Excluir convites em lote (Admin e Super Admin)
router.post('/api/users/invitations/delete-batch', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Nenhum ID de convite informado para exclusão.' });
    }

    const deleteRes = await query("DELETE FROM invitations WHERE id = ANY($1::text[])", [ids]);
    logger.info('[Users]', `🗑️ ${deleteRes.rowCount} convites excluídos em lote com sucesso.`);

    res.json({ ok: true, count: deleteRes.rowCount });
  } catch (err) {
    logger.error('[Users]', 'Erro ao excluir convites em lote:', err);
    res.status(500).json({ error: 'Erro ao excluir convites em lote: ' + err.message });
  }
});

// Verificar validade do convite (PÚBLICO)
router.get('/api/users/invitations/:id/verify', async (req, res) => {
  const { id } = req.params;
  try {
    await query("UPDATE invitations SET status = 'expired' WHERE expires_at < CURRENT_TIMESTAMP AND status = 'pending'");
    const inviteRes = await query("SELECT * FROM invitations WHERE id = $1", [id]);
    if (inviteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Convite não encontrado.' });
    }
    
    const invite = inviteRes.rows[0];
    if (invite.status !== 'pending') {
      return res.status(400).json({ error: `Este convite não está ativo. Status atual: ${invite.status}` });
    }
    
    res.json({ valid: true, role: invite.role });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao verificar convite: ' + err.message });
  }
});

// Registrar usuário usando um convite (PÚBLICO)
router.post('/api/users/register', async (req, res) => {
  const { inviteId, name, email, password } = req.body;
  if (!inviteId || !name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  // Validação dos requisitos de senha (mínimo 10 caracteres, 1 letra, 1 número, 1 caractere especial)
  const passwordValidation = validatePasswordComplexity(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ error: passwordValidation.error });
  }
  
  try {
    // 1. Verifica convite
    const inviteRes = await query("SELECT * FROM invitations WHERE id = $1", [inviteId]);
    if (inviteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Convite não encontrado.' });
    }
    
    const invite = inviteRes.rows[0];
    if (invite.status !== 'pending' || new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Este convite expirou ou já foi utilizado.' });
    }
    
    // 2. Verifica e-mail duplicado (Case-insensitive)
    const cleanEmail = email.trim().toLowerCase();
    const checkEmail = await query("SELECT id FROM dashboard_users WHERE LOWER(email) = $1", [cleanEmail]);
    if (checkEmail.rows.length > 0 || cleanEmail === getSuperAdminEmail().toLowerCase()) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });
    }
    
    // 3. Cadastra o novo usuário com Argon2id + Pepper
    const hashedPassword = await hashPassword(password);
    await query(
      "INSERT INTO dashboard_users (name, email, password, role, permissions) VALUES ($1, $2, $3, $4, $5)",
      [name, cleanEmail, hashedPassword, invite.role, invite.permissions || {}]
    );
    
    // 4. Marca convite como aceito
    await query("UPDATE invitations SET status = 'accepted' WHERE id = $1", [inviteId]);
    
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar usuário: ' + err.message });
  }
});

export default router;
