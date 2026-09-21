// backend/tests/test_carousel_pipeline.js — Teste unitário para a API do pipeline do carrossel
import http from 'http';

function request(urlPath, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const payloadStr = data ? JSON.stringify(data) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (payloadStr) {
      headers['Content-Length'] = Buffer.byteLength(payloadStr);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: 'localhost',
      port: 3131,
      path: urlPath,
      method: method,
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (payloadStr) req.write(payloadStr);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Executando testes unitários do endpoint de Pipeline do Carrossel...');

  try {
    // 1. Realiza login para obter token de autenticação
    console.log('🔑 Efetuando autenticação de teste...');
    const loginRes = await request('/auth/login', 'POST', {
      username: 'aryarajmarketing@gmail.com',
      password: '123'
    });

    let token = loginRes.body?.token;
    if (!token) {
      // Tenta credencial de super admin fallback se necessário
      const loginAdminRes = await request('/auth/login', 'POST', {
        username: 'afonteoculta@gmail.com',
        password: 'FonteOculta@2025'
      });
      token = loginAdminRes.body?.token;
    }

    if (!token) {
      throw new Error('Falha ao autenticar para o teste unitário');
    }
    console.log('✅ Autenticado com sucesso');

    // 2. Lista carrosséis para obter um ID válido
    const carouselsRes = await request('/api/carousels', 'GET', null, token);
    if (carouselsRes.status !== 200 || !Array.isArray(carouselsRes.body) || carouselsRes.body.length === 0) {
      throw new Error(`Falha ao obter lista de carrosséis. Status: ${carouselsRes.status}`);
    }

    const testCarousel = carouselsRes.body[0];
    console.log(`📌 Testando carrossel ID: ${testCarousel.id} (${testCarousel.title})`);

    // 3. Chama endpoint do pipeline
    const pipelineRes = await request(`/api/carousels/${testCarousel.id}/pipeline`, 'GET', null, token);
    if (pipelineRes.status !== 200) {
      throw new Error(`Endpoint do pipeline retornou status ${pipelineRes.status}`);
    }

    const data = pipelineRes.body;
    console.log('✅ Status HTTP 200 do pipeline retornado com sucesso');

    // 4. Valida campos obrigatórios do pipeline
    const requiredFields = ['id', 'title', 'agentPrompts', 'imageProvider', 'copyModel', 'generationLogs', 'costDetails'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Campo obrigatório ausente no payload do pipeline: ${field}`);
      }
    }
    console.log('✅ Estrutura de campos do pipeline validada com sucesso');

    // 5. Valida se todos os 12 agentes do sistema estão presentes
    if (!Array.isArray(data.agentPromptsList) || data.agentPromptsList.length < 12) {
      throw new Error(`Esperado pelo menos 12 agentes no pipeline, retornado: ${data.agentPromptsList?.length}`);
    }
    console.log(`✅ Validados todos os ${data.agentPromptsList.length} agentes do sistema (mínimo de 12 agências de IA)`);

    console.log('🎉 Todos os testes unitários do pipeline foram APROVADOS!');
    process.exit(0);
  } catch (err) {
    console.error('❌ ERRO NO TESTE UNITÁRIO:', err.message);
    process.exit(1);
  }
}

runTests();
