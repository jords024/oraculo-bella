/**
 * test_e2e_password_flow.js — Teste de integração ponta a ponta
 * Cria convite, testa rejeição de senhas fracas, cadastra com senha forte Argon2id e faz login.
 */

async function testE2E() {
  const BASE_URL = 'http://localhost:3131';

  // 1. Login Super Admin
  console.log('--- 1. Testando login do Super Admin (afonteoculta@gmail.com) ---');
  const loginAdmin = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'afonteoculta@gmail.com', password: process.env.DASHBOARD_PASS2 || 'FonteOculta@2025' })
  }).then(r => r.json());
  
  if (!loginAdmin.token) {
    throw new Error('Falha ao autenticar Super Admin: ' + JSON.stringify(loginAdmin));
  }
  console.log('✅ Super Admin autenticado com sucesso. Token recebido:', loginAdmin.user);
  const adminToken = loginAdmin.token;

  // 2. Criar Convite
  console.log('\n--- 2. Criando convite para novo usuário ---');
  const inviteRes = await fetch(BASE_URL + '/api/users/invitations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken },
    body: JSON.stringify({ role: 'user', hours: 24, permissions: { carrosseis: 'liberado' } })
  }).then(r => r.json());

  console.log('✅ Convite criado com ID:', inviteRes.inviteId);
  const inviteId = inviteRes.inviteId;

  // 3. Testar rejeição de senhas fracas
  console.log('\n--- 3. Testando rejeição de senhas fracas no endpoint /api/users/register ---');
  const invalidCases = [
    { pwd: 'Curta@1', reason: 'menos de 10 caracteres' },
    { pwd: 'senhasemnumeros@!', reason: 'sem números' },
    { pwd: '1234567890!@#$', reason: 'sem letras' },
    { pwd: 'SenhaSemEspecial123', reason: 'sem caractere especial' }
  ];

  for (const item of invalidCases) {
    const regRes = await fetch(BASE_URL + '/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inviteId,
        name: 'Teste ' + item.reason,
        email: 'test_' + Date.now() + '@exemplo.com',
        password: item.pwd
      })
    });
    const regData = await regRes.json();
    console.log(`- Teste [${item.reason}]: Status ${regRes.status} (Esperado: 400) | Mensagem: "${regData.error}"`);
    if (regRes.status !== 400) {
      throw new Error(`Deveria ter retornado 400 para senha inválida: ${item.pwd}`);
    }
  }

  // 4. Registrar usuário com senha forte (Argon2id + Pepper)
  console.log('\n--- 4. Registrando usuário com senha forte que cumpre todos os requisitos ---');
  const testEmail = 'user_argon2_' + Date.now() + '@teste.com';
  const strongPassword = 'MinhaSenha@Forte2026';
  
  const validRegRes = await fetch(BASE_URL + '/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inviteId,
      name: 'Usuário Teste Argon2',
      email: testEmail,
      password: strongPassword
    })
  });
  const validRegData = await validRegRes.json();
  console.log('Status de registro:', validRegRes.status, validRegData);
  if (validRegRes.status !== 200 || !validRegData.ok) {
    throw new Error('Falha ao registrar usuário com senha forte.');
  }
  console.log('✅ Usuário registrado com sucesso!');

  // 5. Testar Login com o novo usuário criado
  console.log('\n--- 5. Autenticando novo usuário via /auth/login ---');
  const userLoginRes = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: testEmail, password: strongPassword })
  });
  const userLoginData = await userLoginRes.json();
  if (userLoginRes.status !== 200 || !userLoginData.token) {
    throw new Error('Falha no login do novo usuário: ' + JSON.stringify(userLoginData));
  }
  console.log('✅ Login realizado com sucesso! Usuário autenticado:', userLoginData.user);

  // 6. Testar rejeição de senha incorreta
  console.log('\n--- 6. Testando tentativa de login com senha incorreta ---');
  const wrongLoginRes = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: testEmail, password: 'SenhaIncorreta@2026' })
  });
  console.log('Status com senha errada:', wrongLoginRes.status, '(Esperado: 401)');
  if (wrongLoginRes.status !== 401) {
    throw new Error('Deveria ter retornado 401 para senha incorreta.');
  }

  console.log('\n🎉 TODOS OS TESTES DE INTEGRAÇÃO E SEGURANÇA FORAM APROVADOS COM SUCESSO!');
}

testE2E().catch(err => {
  console.error('❌ Erro no teste E2E:', err);
  process.exit(1);
});
