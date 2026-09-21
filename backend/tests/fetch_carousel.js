import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'oracle_manager',
});

async function run() {
  const res = await pool.query('SELECT chat_history FROM carousels ORDER BY id DESC LIMIT 1');
  console.log(JSON.stringify(res.rows[0].chat_history, null, 2));
  await pool.end();
}

run();
