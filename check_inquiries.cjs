const { Client } = require('pg');
async function test() {
  const url = process.env.DATABASE_URL.replace('[irene@2026@NDANGA]', 'irene%402026%40NDANGA');
  const client = new Client({ connectionString: url });
  await client.connect();
  
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'inquiries' or table_name = 'messages';
  `);
  console.log(res.rows);
  await client.end();
}
test().catch(console.error);
