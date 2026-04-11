require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

async function run() {
    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS order_status_history (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
            status VARCHAR(50) NOT NULL,
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `);
        console.log("Table created successfully");
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
