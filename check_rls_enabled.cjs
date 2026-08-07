const { Client } = require('pg');
async function test() {
  const url = process.env.DATABASE_URL.replace('[irene@2026@NDANGA]', 'irene%402026%40NDANGA');
  const client = new Client({ connectionString: url });
  await client.connect();
  
  const res = await client.query(`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname = 'orders';
  `);
  console.log("RLS enabled:", res.rows);
  
  await client.end();
}
test().catch(console.error);
