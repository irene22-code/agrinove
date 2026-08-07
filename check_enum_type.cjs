const { Client } = require('pg');
async function test() {
  const url = process.env.DATABASE_URL.replace('[irene@2026@NDANGA]', 'irene%402026%40NDANGA');
  const client = new Client({ connectionString: url });
  await client.connect();
  
  const res = await client.query("SELECT data_type, udt_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_status';");
  console.log("type name:", res.rows);
  
  if (res.rows.length > 0) {
    const enumRes = await client.query(`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = '${res.rows[0].udt_name}';`);
    console.log("Enum values:", enumRes.rows);
  }
  
  await client.end();
}
test().catch(console.error);
