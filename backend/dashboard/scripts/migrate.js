import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { initDb, query } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos dos arquivos
const DATA_DIR = path.join(__dirname, '..', 'data');
const CAROUSELS_JSON = path.join(DATA_DIR, 'carousels.json');
const REELS_JSON = path.join(DATA_DIR, 'reels_history.json');

const BACKUP_DIR = path.join(__dirname, '..', '..', '..', 'backup', 'json_db_backup');

async function runMigration() {
  console.log('🚀 Iniciando script de backup e migração para Postgres...');

  // 1. Criar diretório de backup
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Diretório de backup criado em: ${BACKUP_DIR}`);
  }

  // 2. Fazer backup dos arquivos JSON
  if (fs.existsSync(CAROUSELS_JSON)) {
    fs.copyFileSync(CAROUSELS_JSON, path.join(BACKUP_DIR, `carousels_${Date.now()}.json`));
    fs.copyFileSync(CAROUSELS_JSON, path.join(BACKUP_DIR, 'carousels.json')); // cópia fixa
    console.log('💾 Backup de carousels.json realizado com sucesso.');
  } else {
    console.log('⚠️ carousels.json não encontrado para backup.');
  }

  if (fs.existsSync(REELS_JSON)) {
    fs.copyFileSync(REELS_JSON, path.join(BACKUP_DIR, `reels_history_${Date.now()}.json`));
    fs.copyFileSync(REELS_JSON, path.join(BACKUP_DIR, 'reels_history.json')); // cópia fixa
    console.log('💾 Backup de reels_history.json realizado com sucesso.');
  } else {
    console.log('⚠️ reels_history.json não encontrado para backup.');
  }

  // 3. Inicializar banco de dados
  await initDb();

  // 4. Migrar carrosséis
  if (fs.existsSync(CAROUSELS_JSON)) {
    console.log('🔄 Migrando dados de carrosséis...');
    const carouselsData = JSON.parse(fs.readFileSync(CAROUSELS_JSON, 'utf-8'));
    const carouselsArray = Array.isArray(carouselsData)
      ? carouselsData
      : Object.values(carouselsData);

    let carouselCount = 0;
    for (const c of carouselsArray) {
      if (!c.id) continue;

      // Verificar se já existe
      const checkRes = await query('SELECT id FROM carousels WHERE id = $1', [c.id]);
      if (checkRes.rows.length === 0) {
        const insQuery = `
          INSERT INTO carousels (
            id, title, theme, praca, format, preset, workspace, status, created_at,
            slides_dir, slide_prefix, total_slides, caption, notes, slides
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `;
        const params = [
          c.id,
          c.title || '',
          c.theme || '',
          c.praca || '',
          c.format || '',
          c.preset || '',
          c.workspace || 'legacy',
          c.status || '',
          c.createdAt || '',
          c.slidesDir || '',
          c.slidePrefix || '',
          c.totalSlides || 0,
          c.caption || '',
          c.notes || '',
          JSON.stringify(c.slides || [])
        ];
        await query(insQuery, params);
        carouselCount++;
      }
    }
    console.log(`✅ Migrados ${carouselCount} novos carrosséis para o PostgreSQL.`);
  }

  // 5. Migrar Reels History
  if (fs.existsSync(REELS_JSON)) {
    console.log('🔄 Migrando histórico de Reels...');
    const reelsData = JSON.parse(fs.readFileSync(REELS_JSON, 'utf-8'));
    let reelsCount = 0;
    for (const r of reelsData) {
      // Verificar se já existe (com base no timestamp e gancho_original para evitar duplicados)
      const checkRes = await query(
        'SELECT id FROM reels_history WHERE gancho_original = $1 AND timestamp = $2',
        [r.gancho_original, r.timestamp]
      );
      if (checkRes.rows.length === 0) {
        const insQuery = `
          INSERT INTO reels_history (
            gancho_original, padrao_psicologico, roteiro_fonte_oculta,
            transcricao_original, url, timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const params = [
          r.gancho_original || '',
          r.padrao_psicologico || '',
          r.roteiro_fonte_oculta || '',
          r.transcricao_original || '',
          r.url || '',
          r.timestamp || ''
        ];
        await query(insQuery, params);
        reelsCount++;
      }
    }
    console.log(`✅ Migrados ${reelsCount} novos registros de Reels para o PostgreSQL.`);
  }

  console.log('🏁 Processo de migração finalizado com sucesso!');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('❌ Falha na migração:', err);
  process.exit(1);
});
