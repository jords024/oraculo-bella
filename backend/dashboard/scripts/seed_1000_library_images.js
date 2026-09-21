// backend/dashboard/scripts/seed_1000_library_images.js
import fs from 'fs';
import path from 'path';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storageDir = path.join(__dirname, '..', '..', 'storage', 'library');

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const categories = [
  'Geral',
  'Pessoas',
  'Cenários',
  'Estilo',
  'Produtos',
  'Tecnologia',
  'Minimalista',
  'Editorial'
];

const categoryStyles = {
  Pessoas: { icon: '👤', g1: '#1e1b4b', g2: '#3730a3', accent: '#818cf8' },
  Cenários: { icon: '🏞️', g1: '#064e3b', g2: '#065f46', accent: '#34d399' },
  Estilo: { icon: '🎨', g1: '#831843', g2: '#9d174d', accent: '#f472b6' },
  Produtos: { icon: '📦', g1: '#78350f', g2: '#92400e', accent: '#fbbf24' },
  Tecnologia: { icon: '⚡', g1: '#0c4a6e', g2: '#0369a1', accent: '#38bdf8' },
  Minimalista: { icon: '⚪', g1: '#18181b', g2: '#27272a', accent: '#e4e4e7' },
  Editorial: { icon: '📰', g1: '#450a0a', g2: '#7f1d1d', accent: '#f87171' },
  Geral: { icon: '🖼️', g1: '#172554', g2: '#1e40af', accent: '#60a5fa' }
};

const titlesByCategory = {
  Pessoas: [
    'Retrato Executivo Masculino', 'Mulher em Ambiente de Trabalho', 'Expressão de Foco Profundo',
    'Liderança e Comunicação', 'Jovem Estudante Criativo', 'Empresária em Sala de Reunião',
    'Retrato em Luz Natural', 'Profissional da Saúde Humanizado', 'Especialista em Tecnologia',
    'Palestrante no Palco', 'Homem em Meditação', 'Perfil Corporativo Elegante'
  ],
  Cenários: [
    'Escritório Moderno Minimalista', 'Sala de Reunião com Vista Panorâmica', 'Paisagem Natural ao Amanhecer',
    'Arquitetura Urbana Futurista', 'Estúdio de Criação com Luz Quente', 'Café Aconchegante Urbano',
    'Biblioteca Clássica e Nobre', 'Coworking Dinâmico e Aberto', 'Jardim Zen e Calmaria',
    'Apartamento High-End Noturno', 'Auditório para Grandes Eventos'
  ],
  Estilo: [
    'Estilo Cyberpunk Neon Dark', 'Visual Editorial Revista de Luxo', 'Gradiente Dourado Minimalista',
    'Tipografia 3D Elegante', 'Composição Monocromática Grafite', 'Iluminação Cinematográfica Dramatic',
    'Textura de Papel Artesanal', 'Efeito Holográfico Futurista', 'Estética Minimalista Nórdica'
  ],
  Produtos: [
    'Embalagem Minimalista Matte', 'Mockup de Livro Capa Dura Nobre', 'Smartphone com Interface Neon',
    'Dispositivo Tecnológico Premium', 'Garrafa de Vidro com Design Clean', 'Cartão de Visita em Papel Texturizado',
    'Tablet com Dashboard de Métricas', 'Fones de Ouvido Wireless Black', 'Xícara de Cerâmica Artesanal'
  ],
  Tecnologia: [
    'Servidor em Nuvem e Redes Neurais', 'Inteligência Artificial Abstrata', 'Painel Holográfico de Big Data',
    'Criptografia e Segurança Digital', 'Conexões Quânticas e Fibra Óptica', 'Interface de Realidade Aumentada',
    'Robótica e Automação Avançada', 'Código Binário em Fluxo Rápido'
  ],
  Minimalista: [
    'Espaço Negativo e Luz Suave', 'Formas Geométricas em Equilíbrio', 'Fundo Bege Neutro e Sombra Suave',
    'Linhas Finas e Tipografia Fina', 'Monolito de Concreto com Textura', 'Abstrato Orgânico Monocromático'
  ],
  Editorial: [
    'Capa de Revista de Negócios', 'Ensaio Fotográfico de Alta Moda', 'Layout Editorial com Tipografia Bold',
    'Retrato Conceitual em Preto e Branco', 'Composição com Grade Suíça', 'Editorial de Arquitetura Contemporânea'
  ],
  Geral: [
    'Fundo Abstrato Fluido Gradiente', 'Composição Geométrica Abstrata', 'Textura de Luz e Sombra Suave',
    'Conceito de Produtividade e Clareza', 'Foco e Disciplina Mental', 'Mapa Mental e Organização de Ideias'
  ]
};

function generateSvg(title, category, idx) {
  const style = categoryStyles[category] || categoryStyles.Geral;
  const escapedTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g_${idx}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${style.g1}" />
      <stop offset="100%" stop-color="${style.g2}" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g_${idx})" rx="12" />
  <rect x="12" y="12" width="376" height="376" fill="none" stroke="${style.accent}" stroke-width="1.5" stroke-opacity="0.3" rx="8" />
  <text x="200" y="170" font-size="64" text-anchor="middle" dominant-baseline="central">${style.icon}</text>
  <text x="200" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">${escapedTitle}</text>
  <text x="200" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="${style.accent}" text-anchor="middle" letter-spacing="2">${category.toUpperCase()}</text>
  <text x="200" y="350" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="rgba(255,255,255,0.4)" text-anchor="middle">ORÁCULO ART STUDIO</text>
</svg>`;
}

async function seedLibraryImages() {
  console.log('🚀 Iniciando geração de 1.000 Imagens Visuais na Biblioteca...');
  await initDb();

  // Limpa registros seed anteriores de library_images (mantendo apenas as 5 imagens do usuário com IDs <= 5)
  await query('DELETE FROM library_images WHERE filename LIKE \'seed_lib_img_%\'');

  const now = Date.now();
  const totalToSeed = 1000;
  const batchSize = 100;
  let createdCount = 0;

  for (let batch = 0; batch < totalToSeed / batchSize; batch++) {
    const values = [];
    const params = [];
    let pIdx = 1;

    for (let i = 0; i < batchSize; i++) {
      const idx = batch * batchSize + i + 1;
      const category = categories[idx % categories.length];
      const titlePool = titlesByCategory[category] || titlesByCategory['Geral'];
      const baseTitle = titlePool[idx % titlePool.length];
      const title = `${baseTitle} #${idx}`;
      
      const filename = `seed_lib_img_${idx}.svg`;
      const localFilePath = path.join(storageDir, filename);

      // Cria o arquivo SVG estilizado no disco
      const svgContent = generateSvg(baseTitle, category, idx);
      fs.writeFileSync(localFilePath, svgContent, 'utf-8');

      const daysAgo = Math.floor((1000 - idx) / 1000 * 180);
      const createdAtDate = new Date(now - (daysAgo * 86400000) - ((idx % 24) * 3600000));
      const createdAtIso = createdAtDate.toISOString();

      const notes = `Referência visual de ${category.toLowerCase()} cadastrada para inspiração e estilo. Dimensões 1080x1080.`;

      values.push(`(
        $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}
      )`);

      params.push(
        title,
        category,
        notes,
        filename,
        `/app/backend/storage/library/${filename}`,
        'image/svg+xml',
        Buffer.byteLength(svgContent, 'utf-8'),
        1080,
        1080,
        'aryarajmarketing@gmail.com',
        createdAtIso
      );
    }

    const insertSql = `
      INSERT INTO library_images (
        title, category, notes, filename, storage_path,
        mime_type, size_bytes, width, height, created_by, created_at
      ) VALUES ${values.join(', ')}
    `;

    await query(insertSql, params);
    createdCount += batchSize;
    process.stdout.write(`\r   Progresso Biblioteca: ${createdCount}/1000`);
  }

  console.log('\n✅ 1.000 Imagens Visuais inseridas na Biblioteca com sucesso!');

  // Resumo de contagem e categorias
  const countRes = await query('SELECT count(*) FROM library_images');
  const catRes = await query('SELECT category, count(*) FROM library_images GROUP BY category ORDER BY count DESC');

  console.log(`\n📊 Total de Imagens na Biblioteca: ${countRes.rows[0].count}`);
  console.log('Distribuição por Categoria:');
  catRes.rows.forEach(r => console.log(` - ${r.category}: ${r.count}`));

  process.exit(0);
}

seedLibraryImages().catch(e => {
  console.error('❌ Erro ao semear imagens da biblioteca:', e);
  process.exit(1);
});
