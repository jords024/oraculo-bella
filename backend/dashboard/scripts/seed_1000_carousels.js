// backend/dashboard/scripts/seed_1000_carousels.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Carrega .env da raiz do projeto
(function loadEnv() {
  try {
    const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const eq = t.indexOf('=');
        if (eq < 0) continue;
        const k = t.slice(0, eq).trim();
        const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        if (k && !process.env[k]) process.env[k] = v;
      }
    }
  } catch {}
})();

import { query, initDb } from '../db.js';

const titlePrefixes = [
  'Como controlar o', 'O segredo da', 'Por que você sente', 'A ciência por trás do',
  '3 passos para dominar o', 'O impacto direto da', 'Como reprogramar seu cérebro para',
  'A anatomia oculta do', 'Guia definitivo de', 'Como vencer o', 'O método prático para',
  'Descubra o poder da', 'Como destravar a', 'Por que sua mente sabota o'
];

const topics = [
  { theme: 'estresse', title: 'Estresse Crônico', praca: 'MENTE' },
  { theme: 'ansiedade', title: 'Ansiedade Diária', praca: 'MENTE' },
  { theme: 'foco', title: 'Hiperfoco e Atenção', praca: 'CARREIRA' },
  { theme: 'sono', title: 'Sono Profundo e Reparador', praca: 'CORPO' },
  { theme: 'disciplina', title: 'Autodisciplina Inabalável', praca: 'MENTE' },
  { theme: 'dopamina', title: 'Reset de Dopamina', praca: 'MENTE' },
  { theme: 'clareza', title: 'Clareza Mental em Decisões', praca: 'CARREIRA' },
  { theme: 'habitos', title: 'Construção de Hábitos Atômicos', praca: 'CORPO' },
  { theme: 'coerencia', title: 'Coerência Cardíaca e Calma', praca: 'ESPÍRITO' },
  { theme: 'inteligencia', title: 'Inteligência Emocional', praca: 'RELACIONAMENTOS' },
  { theme: 'produtividade', title: 'Produtividade sem Burnout', praca: 'CARREIRA' },
  { theme: 'resiliencia', title: 'Resiliência Estoica', praca: 'ESPÍRITO' },
  { theme: 'burnout', title: 'Prevenção de Esgotamento', praca: 'CORPO' },
  { theme: 'energia', title: 'Gestão de Energia Vital', praca: 'CORPO' },
  { theme: 'financas', title: 'Mentalidade de Prosperidade', praca: 'FINANÇAS' },
  { theme: 'lideranca', title: 'Comunicação e Liderança', praca: 'CARREIRA' }
];

const presets = ['padrao', 'neon', 'minimalista', 'editorial'];
const statuses = ['pronto', 'aprovado', 'rascunho', 'agendado', 'publicado', 'publicando'];

function formatDatePtBr(d) {
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const min = pad(d.getMinutes());
  const sec = pad(d.getSeconds());
  return `${day}/${month}/${year}, ${hours}:${min}:${sec}`;
}

async function seedCarousels() {
  console.log('🚀 Iniciando geração de 1.000 Carrosséis...');
  await initDb();

  const now = Date.now();
  const batchSize = 100;
  let createdCount = 0;

  for (let batch = 0; batch < 10; batch++) {
    const values = [];
    const params = [];
    let pIdx = 1;

    for (let i = 0; i < batchSize; i++) {
      const idx = batch * batchSize + i + 1;
      const topicObj = topics[idx % topics.length];
      const prefix = titlePrefixes[idx % titlePrefixes.length];
      const fullTitle = `${prefix} ${topicObj.title}?`;
      const theme = `${topicObj.theme}-${idx}`;
      const id = `carrossel-${topicObj.theme}-${idx}`;
      const praca = topicObj.praca;
      const preset = presets[idx % presets.length];
      
      // Distribuição realista de status:
      // ~30% pronto, ~25% aprovado, ~20% rascunho, ~15% agendado, ~7% publicado, ~3% publicando
      let status;
      const r = idx % 100;
      if (r < 30) status = 'pronto';
      else if (r < 55) status = 'aprovado';
      else if (r < 75) status = 'rascunho';
      else if (r < 90) status = 'agendado';
      else if (r < 97) status = 'publicado';
      else status = 'publicando';

      const daysAgo = Math.floor((1000 - idx) / 1000 * 180);
      const createdAtDate = new Date(now - (daysAgo * 86400000) - ((idx % 24) * 3600000));
      const createdAtStr = createdAtDate.toISOString();

      const totalSlides = 6 + (idx % 6); // 6 a 11 slides
      const slidesArray = Array.from({ length: totalSlides }, (_, sIdx) => `slide-${String(sIdx + 1).padStart(2, '0')}.png`);
      
      const genSeconds = 110 + (idx % 200); // 110s a 310s
      const genMins = Math.floor(genSeconds / 60);
      const genSecs = genSeconds % 60;
      const genDuration = `${genMins}m ${genSecs}s`;

      const isPinned = idx <= 3; // Primeiros 3 fixados
      const pinnedAt = isPinned ? new Date(now - (idx * 3600000)) : null;

      const caption = `Descubra neste carrossel os princípios fundamentais de ${topicObj.title.toLowerCase()} e aprenda a aplicar no seu dia a dia.\n\nSalve para consultar depois! #oraculo #${topicObj.theme}`;
      const notes = `Carrossel gerado para o pilar ${praca} com o modelo de copy otimizado.`;

      values.push(`(
        $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++},
        $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++},
        $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}
      )`);

      params.push(
        id,
        fullTitle,
        theme,
        praca,
        'carrossel',
        preset,
        status,
        createdAtStr,
        `b2://carrosseis/${theme}`,
        'slide-',
        totalSlides,
        'high',
        'https://f005.backblazeb2.com/file/oraculo-storage',
        'gpt-image-2',
        'gpt-4o',
        0,
        caption,
        notes,
        JSON.stringify(slidesArray),
        JSON.stringify([]),
        isPinned,
        pinnedAt,
        genDuration,
        genSeconds
      );
    }

    const insertSql = `
      INSERT INTO carousels (
        id, title, theme, praca, format, preset, status, created_at,
        slides_dir, slide_prefix, total_slides, image_quality, b2_base_url,
        image_provider, copy_model, no_image_slides_count, caption, notes,
        slides, chat_history, is_pinned, pinned_at, generation_duration, generation_time_seconds
      ) VALUES ${values.join(', ')}
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        status = EXCLUDED.status,
        created_at = EXCLUDED.created_at,
        slides = EXCLUDED.slides,
        total_slides = EXCLUDED.total_slides,
        is_pinned = EXCLUDED.is_pinned
    `;

    await query(insertSql, params);
    createdCount += batchSize;
    process.stdout.write(`\r   Progresso Carrosséis: ${createdCount}/1000`);
  }

  console.log('\n✅ 1.000 Carrosséis gerados com sucesso!');

  // Resumo
  const countRes = await query('SELECT count(*) FROM carousels');
  const statusRes = await query('SELECT status, count(*) FROM carousels GROUP BY status ORDER BY count DESC');

  console.log(`\n📊 Total de Carrosséis no Banco: ${countRes.rows[0].count}`);
  console.log('Distribuição por Status:');
  statusRes.rows.forEach(r => console.log(` - ${r.status.toUpperCase()}: ${r.count}`));

  process.exit(0);
}

seedCarousels().catch(e => {
  console.error('❌ Erro ao semear carrosséis:', e);
  process.exit(1);
});
