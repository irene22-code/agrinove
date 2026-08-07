const { Client } = require('pg');
async function test() {
  const url = process.env.DATABASE_URL.replace('[irene@2026@NDANGA]', 'irene%402026%40NDANGA');
  const client = new Client({ connectionString: url });
  await client.connect();
  
  const res = await client.query("SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';");
  console.log("handle_new_user body:", res.rows[0].prosrc);
  
  await client.end();
}
test().catch(console.error);
