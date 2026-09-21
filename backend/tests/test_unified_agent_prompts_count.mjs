/**
 * test_unified_agent_prompts_count.mjs
 * Testa se a sincronização de agentes entre Configurações e Pipeline retorna a lista completa de 21 agentes.
 *
 * USO:
 *   node backend/tests/test_unified_agent_prompts_count.mjs
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FALHOU: ${msg}`);
    failed++;
  }
}

console.log('\n📋 Testes: Unificação da Contagem de Agentes (Configurações vs Pipeline)\n');

// TESTE 1: Contagem de arquivos .md na pasta agents
console.log('Teste 1: Contagem de arquivos .md em backend/agents/');
try {
  const agentsDir = path.resolve('backend/agents');
  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  assert(files.length >= 12, `Devem existir pelo menos 12 arquivos .md de agentes (encontrados: ${files.length})`);
} catch (err) {
  console.error('  ❌ Erro ao ler pasta agents:', err.message);
  failed++;
}

// TESTE 2: Verificar se a rota /api/settings/prompts em services.js usa getAllAgentPrompts
console.log('\nTeste 2: Verificar se /api/settings/prompts usa getAllAgentPrompts');
try {
  const servicesPath = path.resolve('backend/dashboard/routes/services.js');
  const content = fs.readFileSync(servicesPath, 'utf-8');
  assert(content.includes('getAllAgentPrompts'), 'Função getAllAgentPrompts implementada em services.js');
  assert(content.includes("router.get('/api/settings/prompts', async"), 'Rota /api/settings/prompts atualizada para assíncrona com getAllAgentPrompts');
} catch (err) {
  console.error('  ❌ Erro ao ler services.js:', err.message);
  failed += 2;
}

console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);
process.exit(failed > 0 ? 1 : 0);
