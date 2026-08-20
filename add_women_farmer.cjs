const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  const regex = /^postgresql:\/\/([^:]+):\[(.*)\]@([^:]+):(\d+)\/(.*)$/;
  let newUrl = dbUrl;
  const match = dbUrl.match(regex);
  if (match) {
    const [, user, pass, host, port, dbname] = match;
    const encodedPass = encodeURIComponent(pass);
    newUrl = `postgresql://${user}:${encodedPass}@${host}:${port}/${dbname}`;
  }
  const client = new Client({ connectionString: newUrl });
  await client.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS crop_calendar_women_farmer (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        image_url TEXT,
        description TEXT,
        advice TEXT,
        crop_id UUID REFERENCES crop_calendar_crops(id) ON DELETE SET NULL,
        district_id UUID REFERENCES crop_calendar_districts(id) ON DELETE SET NULL,
        season_id UUID REFERENCES crop_calendar_seasons(id) ON DELETE SET NULL,
        status crop_status DEFAULT 'published',
        publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Table created");
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
