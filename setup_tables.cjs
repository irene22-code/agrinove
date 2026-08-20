const { Client } = require('pg');

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  const regex = /^postgresql:\/\/([^:]+):\[(.*)\]@([^:]+):(\d+)\/(.*)$/;
  const match = dbUrl.match(regex);
  const [, user, pass, host, port, dbname] = match;
  const encodedPass = encodeURIComponent(pass);
  const newUrl = `postgresql://${user}:${encodedPass}@${host}:${port}/${dbname}`;
  
  const client = new Client({ connectionString: newUrl });
  await client.connect();
  
  try {
    // 1. Create new lookup tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS plant_health_risk_levels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS plant_health_seasons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS plant_health_cause_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    console.log("New tables created.");

    // 2. Add is_active to existing tables if missing
    const tables = [
      'plant_health_problem_types',
      'plant_health_categories',
      'plant_health_crops',
      'plant_health_affected_parts',
      'plant_health_spread_methods'
    ];
    
    for(const table of tables) {
      await client.query(`
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name='${table}' AND column_name='is_active') THEN 
                ALTER TABLE ${table} ADD COLUMN is_active BOOLEAN DEFAULT true; 
            END IF; 
        END $$;
      `);
      console.log(`Added is_active to ${table}`);
    }
    
    // Check plant_health_resources for external_url
    await client.query(`
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name='plant_health_resources' AND column_name='external_url') THEN 
                ALTER TABLE plant_health_resources ADD COLUMN external_url TEXT; 
            END IF; 
        END $$;
    `);
    
    // Seed risk levels, seasons, cause types if empty
    const checkRisk = await client.query('SELECT count(*) FROM plant_health_risk_levels');
    if (checkRisk.rows[0].count == 0) {
      await client.query(`
        INSERT INTO plant_health_risk_levels (name) VALUES 
        ('Low'), ('Medium'), ('High'), ('Critical');
      `);
    }
    
    const checkSeason = await client.query('SELECT count(*) FROM plant_health_seasons');
    if (checkSeason.rows[0].count == 0) {
      await client.query(`
        INSERT INTO plant_health_seasons (name) VALUES 
        ('Rainy Season'), ('Dry Season'), ('Both Seasons');
      `);
    }
    
    const checkCause = await client.query('SELECT count(*) FROM plant_health_cause_types');
    if (checkCause.rows[0].count == 0) {
      await client.query(`
        INSERT INTO plant_health_cause_types (name) VALUES 
        ('Bacteria'), ('Fungus'), ('Virus'), ('Nematode'), ('Insect'), ('Animal'), ('Nutrient Deficiency'), ('Environmental'), ('Other');
      `);
    }
    
    console.log("Seeding complete.");
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
