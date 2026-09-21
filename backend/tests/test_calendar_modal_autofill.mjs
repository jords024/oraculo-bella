/**
 * test_calendar_modal_autofill.mjs
 *
 * Testa se ao abrir o modal ou selecionar um carrossel agendado, a data e o horário
 * são preenchidos automaticamente com a data/hora agendada real do carrossel.
 */

import assert from 'assert';

console.log('\n📋 Teste Unitário: Preenchimento Automático de Data e Hora no Modal\n');

let passed = 0;
let failed = 0;

function populateModalDateTime(c) {
  if (c.scheduledTimestamp) {
    const d = new Date(c.scheduledTimestamp * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
  } else if (c.scheduledAt) {
    const d = new Date(c.scheduledAt);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
  } else {
    return {
      date: c.scheduledDate || '2026-08-05',
      time: (c.scheduledTime || '09h00').replace('h', ':')
    };
  }
}

// ── TESTE 1: Preenchimento via Unix Timestamp ─────────────────────────────────
try {
  // Timestamp para 2026-08-10 16:45 Local
  const testDate = new Date(2026, 7, 10, 16, 45, 0); // Mes 7 = Agosto (0-indexed)
  const timestamp = Math.floor(testDate.getTime() / 1000);
  const carousel = { id: 'c1', status: 'agendado', scheduledTimestamp: timestamp };

  const result = populateModalDateTime(carousel);
  assert.strictEqual(result.date, '2026-08-10');
  assert.strictEqual(result.time, '16:45');
  console.log('  ✅ TESTE 1 PASSOU: Data e Hora extraídas perfeitamente de scheduledTimestamp');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 1 FALHOU: ${e.message}`);
  failed++;
}

// ── TESTE 2: Preenchimento via ISO string (scheduledAt) ──────────────────────
try {
  const testDate = new Date(2026, 7, 12, 10, 15, 0);
  const carousel = { id: 'c2', status: 'agendado', scheduledAt: testDate.toISOString() };

  const result = populateModalDateTime(carousel);
  assert.strictEqual(result.date, '2026-08-12');
  assert.strictEqual(result.time, '10:15');
  console.log('  ✅ TESTE 2 PASSOU: Data e Hora extraídas perfeitamente de scheduledAt');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 2 FALHOU: ${e.message}`);
  failed++;
}

console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);
if (failed > 0) process.exit(1);
