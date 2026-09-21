import pool, { query } from '../db.js';

async function testConnection() {
  console.log('🔌 Testando conexão com o banco de dados PostgreSQL...');
  try {
    const res = await query('SELECT NOW()');
    console.log('✅ Conexão bem-sucedida! Hora do banco:', res.rows[0].now);
    
    const carouselsCount = await query('SELECT COUNT(*) FROM carousels');
    console.log('📊 Quantidade de carrosséis no banco:', carouselsCount.rows[0].count);

    const reelsCount = await query('SELECT COUNT(*) FROM reels_history');
    console.log('📊 Quantidade de Reels no banco:', reelsCount.rows[0].count);
    
    await pool.end();
    console.log('🔌 Conexão fechada.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na conexão com o banco de dados:', err);
    process.exit(1);
  }
}

testConnection();
