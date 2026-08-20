const { Client } = require('pg');
const dbUrl = process.env.DATABASE_URL;
// Parse the URL manually to fix the password encoding
const regex = /^postgresql:\/\/([^:]+):(.*)@([^:]+):(\d+)\/(.*)$/;
const match = dbUrl.match(regex);
if (match) {
  const [, user, pass, host, port, dbname] = match;
  const encodedPass = encodeURIComponent(pass);
  const newUrl = `postgresql://${user}:${encodedPass}@${host}:${port}/${dbname}`;
  
  const client = new Client({ connectionString: newUrl });
  client.connect().then(async () => {
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'plant_health_%';
    `);
    console.log(res.rows.map(r => r.table_name));
    await client.end();
  }).catch(console.error);
}
