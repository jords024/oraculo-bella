// backend/tests/test_reference_prompt_enricher.js
import { enrichPromptWithReferences } from '../dashboard/services/referencePromptEnricher.js';

async function runTests() {
  console.log('🧪 Iniciando testes unitários do enrichPromptWithReferences...');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Teste 1: Prompt vazio
    console.log('\n--- Teste 1: Prompt vazio ---');
    const resEmpty = await enrichPromptWithReferences('', []);
    assert(resEmpty.enrichedPrompt === '', 'Deve retornar string vazia para prompt vazio');
    assert(Array.isArray(resEmpty.references) && resEmpty.references.length === 0, 'Referências devem ser array vazio');

    // Teste 2: Sem referenceIds
    console.log('\n--- Teste 2: Sem referenceIds ---');
    const resNoRefs = await enrichPromptWithReferences('Mulher segurando machado', []);
    assert(resNoRefs.enrichedPrompt === 'Mulher segurando machado', 'Deve manter o prompt original quando não há referências');
    assert(resNoRefs.references.length === 0, 'Referências devem ser vazias');

    // Teste 3: Limite máximo estrito de 3 referências
    console.log('\n--- Teste 3: Limite máximo estrito de 3 referências ---');
    const resLimit = await enrichPromptWithReferences('Teste limite', [1, 2, 3, 4, 5]);
    assert(resLimit.references.length <= 3, 'Nunca deve processar mais de 3 referências');

    // Teste 4: IDs inválidos (NaN, negativos, strings)
    console.log('\n--- Teste 4: IDs inválidos ---');
    const resInvalid = await enrichPromptWithReferences('Teste invalid', ['abc', -1, null, undefined, 0]);
    assert(resInvalid.enrichedPrompt === 'Teste invalid', 'Deve ignorar IDs inválidos e manter prompt');
    assert(resLimit.references.length <= 3, 'Array limpo de referências');

    console.log(`\n🎉 Testes concluídos: ${passed} aprovados, ${failed} falhas.\n`);
    if (failed > 0) {
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro durante a execução dos testes:', err);
    process.exit(1);
  }
}

runTests();
