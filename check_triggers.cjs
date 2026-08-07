const { Client } = require('pg');
async function test() {
  const url = process.env.DATABASE_URL.replace('[irene@2026@NDANGA]', 'irene%402026%40NDANGA');
  const client = new Client({ connectionString: url });
  await client.connect();
  
  const res = await client.query("SELECT * FROM pg_trigger;");
  console.log("Triggers:", res.rows.length);
  
  const triggersFunc = await client.query(`
    SELECT event_object_schema as table_schema,
           event_object_table as table_name,
           trigger_schema,
           trigger_name,
           string_agg(event_manipulation, ',') as event,
           action_timing as activation,
           action_condition as condition,
           action_statement as definition
    FROM information_schema.triggers
    GROUP BY 1,2,3,4,6,7,8
    ORDER BY table_schema, table_name;
  `);
  console.log(triggersFunc.rows);
  
  await client.end();
}
test().catch(console.error);
