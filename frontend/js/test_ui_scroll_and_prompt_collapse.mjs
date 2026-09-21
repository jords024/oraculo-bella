/**
 * test_ui_scroll_and_prompt_collapse.mjs
 * Valida se as alterações de UI (scroll da lista de carrosséis e cards retráteis no PipelineModal)
 * foram implementadas corretamente.
 *
 * USO:
 *   node frontend/js/test_ui_scroll_and_prompt_collapse.mjs
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

console.log('\n📋 Testes de UI: Scroll na Lista e Cards Retráteis\n');

// TESTE 1: Verificar se .main-area em base.css possui overflow-y: auto
console.log('Teste 1: Verificar se .main-area possui overflow-y: auto no base.css');
try {
  const baseCssPath = path.resolve('frontend/src/css/base.css');
  const cssContent = fs.readFileSync(baseCssPath, 'utf-8');
  
  const mainAreaMatch = cssContent.match(/\.main-area\s*\{([^}]+)\}/);
  assert(mainAreaMatch !== null, 'Classe .main-area encontrada no base.css');
  if (mainAreaMatch) {
    const properties = mainAreaMatch[1];
    assert(properties.includes('overflow-y: auto'), '.main-area possui overflow-y: auto para permitir rolagem');
  }
} catch (err) {
  console.error('  ❌ Erro ao ler base.css:', err.message);
  failed += 2;
}

// TESTE 2: Verificar se PipelineModal.jsx possui a lógica de recolhimento e maximização de prompts
console.log('\nTeste 2: Verificar funcionalidade de recolher/expandir e maximizar prompts em PipelineModal.jsx');
try {
  const modalPath = path.resolve('frontend/src/components/PipelineModal.jsx');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');

  assert(modalContent.includes('collapsedAgents'), 'Estado collapsedAgents declarado no componente');
  assert(modalContent.includes('toggleAgentCollapse'), 'Função toggleAgentCollapse implementada');
  assert(modalContent.includes('toggleAllAgents'), 'Função toggleAllAgents implementada');
  assert(modalContent.includes('Recolher Todos'), 'Botão "Recolher Todos" presente na interface');
  assert(modalContent.includes('maximizedAgent'), 'Estado maximizedAgent declarado para modal de tela cheia');
  assert(modalContent.includes('Maximizar'), 'Botão "Maximizar" presente nos cards de agente');
  assert(modalContent.includes('TEXTO & COPY') && modalContent.includes('DESIGN & VISUAL'), 'Cabeçalhos de categorias/grupos de agentes implementados');
  assert(modalContent.includes('zIndex: 10005') && modalContent.includes('e.stopPropagation()'), 'Fechamento por clique fora do painel desativado (backdrop bloqueado com stopPropagation)');
} catch (err) {
  console.error('  ❌ Erro ao ler PipelineModal.jsx:', err.message);
  failed += 8;
}

console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);
process.exit(failed > 0 ? 1 : 0);
