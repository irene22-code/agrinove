const { Client } = require('pg');
const dbUrl = process.env.DATABASE_URL;
const regex = /^postgresql:\/\/([^:]+):\[(.*)\]@([^:]+):(\d+)\/(.*)$/;
const match = dbUrl.match(regex);
if (match) {
  const [, user, pass, host, port, dbname] = match;
  const encodedPass = encodeURIComponent(pass);
  const newUrl = `postgresql://${user}:${encodedPass}@${host}:${port}/${dbname}`;
  
  const client = new Client({ connectionString: newUrl });
  client.connect().then(async () => {
    console.log("Connected!");
    await client.end();
  }).catch(console.error);
} else {
  console.log("No match");
}
