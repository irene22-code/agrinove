const { Client } = require('pg');
async function test() {
  const url = process.env.DATABASE_URL.replace('[irene@2026@NDANGA]', 'irene%402026%40NDANGA');
  const client = new Client({ connectionString: url });
  await client.connect();
  
  const res = await client.query(`
    SELECT polname, polcmd, polroles, polqual, polwithcheck 
    FROM pg_policy 
    WHERE polrelid = 'public.orders'::regclass;
  `);
  console.log("Policies on orders:", res.rows);
  
  await client.end();
}
test().catch(console.error);
