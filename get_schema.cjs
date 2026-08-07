const { Client } = require('pg');

async function test() {
  const url = process.env.DATABASE_URL.replace('[irene@2026@NDANGA]', 'irene%402026%40NDANGA');
  const client = new Client({ connectionString: url });
  await client.connect();
  
  const res1 = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'sellers';
  `);
  console.log('sellers schema:', res1.rows);

  const res2 = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'products';
  `);
  console.log('products schema:', res2.rows);

  const res3 = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users';
  `);
  console.log('users schema:', res3.rows);

  await client.end();
}
test().catch(console.error);
