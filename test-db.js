import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // your password here
  database: 'crm_new'
});

async function test() {
  try {
    const [rows, fields] = await pool.execute('SELECT id FROM contacts');
    console.log('Minimal test result:', rows);
  } catch (err) {
    console.error('Minimal test error:', err);
  }
}

test();