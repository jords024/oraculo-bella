/**
 * test_calendar_scheduling.mjs
 *
 * Testa o suporte a múltiplos formatos de data/hora de agendamento no Calendário:
 * 1. Formato legado (scheduledDate + scheduledTime)
 * 2. Formato novo via Instagram (scheduledTimestamp / scheduledAt)
 */

import assert from 'assert';

console.log('\n📋 Teste Unitário: Suporte a Agendamento no Calendário\n');

let passed = 0;
let failed = 0;

const getScheduledLocalDate = (c) => {
  if (c.scheduledTimestamp) {
    const d = new Date(c.scheduledTimestamp * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  if (c.scheduledAt) {
    const d = new Date(c.scheduledAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return c.scheduledDate || null;
};

const getScheduledLocalTime = (c) => {
  if (c.scheduledTimestamp) {
    const d = new Date(c.scheduledTimestamp * 1000);
    return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (c.scheduledAt) {
    const d = new Date(c.scheduledAt);
    return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return (c.scheduledTime || '00h00');
};

// ── TESTE 1: Formato Legado ──────────────────────────────────────────────────
try {
  const item = { scheduledDate: '2026-08-05', scheduledTime: '14h30' };
  assert.strictEqual(getScheduledLocalDate(item), '2026-08-05');
  assert.strictEqual(getScheduledLocalTime(item), '14h30');
  console.log('  ✅ TESTE 1 PASSOU: Formato legado lido corretamente');
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 1 FALHOU: ${e.message}`);
  failed++;
}

// ── TESTE 2: Formato Novo com scheduledTimestamp ──────────────────────────────
try {
  // 2026-08-05 15:30:00 UTC (exemplo)
  const timestamp = Math.floor(new Date('2026-08-05T15:30:00Z').getTime() / 1000);
  const item = { scheduledTimestamp: timestamp };
  
  const expectedDate = getScheduledLocalDate(item);
  const expectedTime = getScheduledLocalTime(item);

  assert.ok(expectedDate.startsWith('2026-08-05'));
  assert.ok(expectedTime.includes('h'));
  console.log(`  ✅ TESTE 2 PASSOU: Timestamp Unix convertido para local (${expectedDate} ${expectedTime})`);
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 2 FALHOU: ${e.message}`);
  failed++;
}

// ── TESTE 3: Formato Novo com scheduledAt (ISO String) ───────────────────────
try {
  const item = { scheduledAt: '2026-08-05T20:00:00.000Z' };
  const expectedDate = getScheduledLocalDate(item);
  const expectedTime = getScheduledLocalTime(item);

  assert.ok(expectedDate.startsWith('2026-08-05'));
  assert.ok(expectedTime.includes('h'));
  console.log(`  ✅ TESTE 3 PASSOU: Data ISO lida corretamente (${expectedDate} ${expectedTime})`);
  passed++;
} catch (e) {
  console.error(`  ❌ TESTE 3 FALHOU: ${e.message}`);
  failed++;
}

// ── RESULTADO ────────────────────────────────────────────────────────────────
console.log(`\n📊 Resultado: ${passed} passou / ${failed} falhou\n`);
if (failed > 0) process.exit(1);
