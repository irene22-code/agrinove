import pg from 'pg';
const { Client } = pg;
const dbUrl = process.env.DATABASE_URL.replace('[irene@2026@NDANGA]', encodeURIComponent('[irene@2026@NDANGA]'));
const client = new Client({ connectionString: dbUrl });
await client.connect();
const res = await client.query(`
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'ai_%';
`);
console.log("Tables:", res.rows);
const res2 = await client.query(`
SELECT * FROM pg_policies WHERE tablename LIKE 'ai_%';
`);
console.log("Policies:", res2.rows);
await client.end();
