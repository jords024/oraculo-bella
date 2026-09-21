import http from 'http';

// Credenciais padrão de desenvolvimento
const username = process.env.DASHBOARD_USER || 'jordao';
const password = process.env.DASHBOARD_PASS || '123456';

const BACKEND_URL = 'http://localhost:3131';

async function makeRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => { reject(err); });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runSmokeTest() {
  console.log('🤖 Iniciando Smoke Test de API (Validação do Postgres)...');
  try {
    // 1. Fazer POST de Login
    const postData = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    console.log(`🔑 Fazendo login no endpoint ${BACKEND_URL}/auth/login...`);
    
    const loginRes = await makeRequest(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);

    console.log(`Status de Login: ${loginRes.statusCode}`);
    const cookie = loginRes.headers['set-cookie'];
    if (!cookie) {
      throw new Error('❌ Falha ao obter cookie de autenticação após login.');
    }
    console.log('✅ Autenticado com sucesso. Cookie obtido.');

    // 2. Buscar carrosséis (GET /api/carousels)
    console.log(`📡 Consultando ${BACKEND_URL}/api/carousels...`);
    const carouselsRes = await makeRequest(`${BACKEND_URL}/api/carousels`, {
      method: 'GET',
      headers: { 'Cookie': cookie }
    });

    if (carouselsRes.statusCode !== 200) {
      throw new Error(`❌ Erro ao consultar carrosséis. Status: ${carouselsRes.statusCode}`);
    }

    const carouselsList = JSON.parse(carouselsRes.data);
    console.log(`✅ Sucesso! Carrosséis retornados do Postgres: ${carouselsList.length}`);
    if (carouselsList.length === 0) {
      throw new Error('⚠️ Lista de carrosséis está vazia! A migração pode ter falhado.');
    }

    // 3. Buscar histórico de Reels (GET /api/reels/history)
    console.log(`📡 Consultando ${BACKEND_URL}/api/reels/history...`);
    const reelsRes = await makeRequest(`${BACKEND_URL}/api/reels/history`, {
      method: 'GET',
      headers: { 'Cookie': cookie }
    });

    if (reelsRes.statusCode !== 200) {
      throw new Error(`❌ Erro ao consultar reels. Status: ${reelsRes.statusCode}`);
    }

    const reelsList = JSON.parse(reelsRes.data);
    console.log(`✅ Sucesso! Reels retornados do Postgres: ${reelsList.length}`);

    // 4. Buscar estatísticas (GET /api/stats)
    console.log(`📡 Consultando ${BACKEND_URL}/api/stats...`);
    const statsRes = await makeRequest(`${BACKEND_URL}/api/stats`, {
      method: 'GET',
      headers: { 'Cookie': cookie }
    });

    if (statsRes.statusCode !== 200) {
      throw new Error(`❌ Erro ao consultar estatísticas. Status: ${statsRes.statusCode}`);
    }

    console.log('✅ Estatísticas retornadas:', statsRes.data);
    console.log('\n🎉 SMOKE TEST APROVADO! O banco Postgres está integrado e respondendo 100% correto!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ SMOKE TEST FALHOU:', err.message);
    process.exit(1);
  }
}

runSmokeTest();
