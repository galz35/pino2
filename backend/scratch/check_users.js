const { Client } = require('pg');

const client = new Client({
  host: '190.56.16.85',
  port: 5432,
  user: 'alacaja',
  password: 'TuClaveFuerte',
  database: 'multitienda_db'
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT u.id, u.email, u.name, u.role, u.is_active, s.name as store_name, s.id as store_id
    FROM users u
    LEFT JOIN user_stores us ON u.id = us.user_id
    LEFT JOIN stores s ON us.store_id = s.id
    ORDER BY u.role, u.email
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run();
