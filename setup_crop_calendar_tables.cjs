const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupTables() {
  const query = `
    -- Create enums if they don't exist
    DO $$ BEGIN
      CREATE TYPE crop_status AS ENUM ('draft', 'published', 'archived');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE recommendation_status AS ENUM ('GOOD_TO_PLANT', 'POSSIBLE', 'NOT_RECOMMENDED', 'COMING_SOON');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    
    DO $$ BEGIN
      CREATE TYPE alert_severity AS ENUM ('Information', 'Low', 'Medium', 'High', 'Critical');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    -- Create Tables
    CREATE TABLE IF NOT EXISTS crop_calendar_seasons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT,
      start_month INTEGER,
      end_month INTEGER,
      status crop_status DEFAULT 'published',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS crop_calendar_districts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      province TEXT,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS crop_calendar_crops (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      category TEXT,
      description TEXT,
      image_url TEXT,
      crop_type TEXT,
      growing_duration_days INTEGER,
      rainfall_requirement TEXT,
      water_requirement TEXT,
      soil_type TEXT,
      temperature_min DECIMAL,
      temperature_max DECIMAL,
      seed_information TEXT,
      fertilizer_information TEXT,
      disease_information TEXT,
      pest_information TEXT,
      harvesting_advice TEXT,
      storage_advice TEXT,
      market_advice TEXT,
      status crop_status DEFAULT 'draft',
      created_by UUID,
      updated_by UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS crop_calendar_periods (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      crop_id UUID REFERENCES crop_calendar_crops(id) ON DELETE CASCADE,
      district_id UUID REFERENCES crop_calendar_districts(id) ON DELETE CASCADE,
      season_id UUID REFERENCES crop_calendar_seasons(id) ON DELETE CASCADE,
      preparation_start INTEGER,
      preparation_end INTEGER,
      planting_start INTEGER,
      planting_end INTEGER,
      growing_start INTEGER,
      growing_end INTEGER,
      harvest_start INTEGER,
      harvest_end INTEGER,
      status crop_status DEFAULT 'published',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS crop_calendar_recommendations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      crop_id UUID REFERENCES crop_calendar_crops(id) ON DELETE CASCADE,
      district_id UUID REFERENCES crop_calendar_districts(id) ON DELETE CASCADE,
      season_id UUID REFERENCES crop_calendar_seasons(id) ON DELETE CASCADE,
      month INTEGER,
      recommendation recommendation_status NOT NULL,
      status crop_status DEFAULT 'published',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(crop_id, district_id, season_id, month)
    );

    CREATE TABLE IF NOT EXISTS crop_calendar_activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      activity_name TEXT NOT NULL,
      description TEXT,
      crop_id UUID REFERENCES crop_calendar_crops(id) ON DELETE SET NULL,
      district_id UUID REFERENCES crop_calendar_districts(id) ON DELETE SET NULL,
      season_id UUID REFERENCES crop_calendar_seasons(id) ON DELETE SET NULL,
      month INTEGER,
      priority INTEGER DEFAULT 0,
      status crop_status DEFAULT 'published',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS crop_calendar_alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT,
      severity alert_severity DEFAULT 'Information',
      district_id UUID REFERENCES crop_calendar_districts(id) ON DELETE SET NULL,
      crop_id UUID REFERENCES crop_calendar_crops(id) ON DELETE SET NULL,
      start_date TIMESTAMP WITH TIME ZONE,
      end_date TIMESTAMP WITH TIME ZONE,
      status crop_status DEFAULT 'published',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS crop_calendar_before_planting (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      crop_id UUID REFERENCES crop_calendar_crops(id) ON DELETE CASCADE,
      district_id UUID REFERENCES crop_calendar_districts(id) ON DELETE CASCADE,
      status crop_status DEFAULT 'published',
      message TEXT,
      recommendation TEXT,
      active_period INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Insert Default Data
    INSERT INTO crop_calendar_districts (name, province) VALUES 
      ('Gasabo', 'Kigali'), ('Kicukiro', 'Kigali'), ('Nyarugenge', 'Kigali'),
      ('Burera', 'Northern'), ('Gakenke', 'Northern'), ('Gicumbi', 'Northern'), ('Musanze', 'Northern'), ('Rulindo', 'Northern'),
      ('Gisagara', 'Southern'), ('Huye', 'Southern'), ('Kamonyi', 'Southern'), ('Muhanga', 'Southern'), ('Nyamagabe', 'Southern'), ('Nyanza', 'Southern'), ('Nyaruguru', 'Southern'), ('Ruhango', 'Southern'),
      ('Bugesera', 'Eastern'), ('Gatsibo', 'Eastern'), ('Kayonza', 'Eastern'), ('Kirehe', 'Eastern'), ('Ngoma', 'Eastern'), ('Nyagatare', 'Eastern'), ('Rwamagana', 'Eastern'),
      ('Karongi', 'Western'), ('Ngororero', 'Western'), ('Nyabihu', 'Western'), ('Nyamasheke', 'Western'), ('Rubavu', 'Western'), ('Rusizi', 'Western'), ('Rutsiro', 'Western')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO crop_calendar_seasons (name, code, start_month, end_month) VALUES 
      ('Season A', 'A', 9, 2),
      ('Season B', 'B', 2, 7),
      ('Season C', 'C', 7, 9)
    ON CONFLICT DO NOTHING;
  `;

  // We can't use rpc directly if we didn't create the rpc function, so let's execute SQL using postgres direct or via an existing endpoint if one exists.
  // Actually, since I am a script I can query Supabase directly using REST POST or pg.
  // Better yet, write an endpoint in the server to execute this, or use the `cloudsql-execute-sql` tool if it's Cloud SQL, but it says "Supabase", so it's a PostgreSQL database.
  // Wait, I can use `@supabase/supabase-js` `rpc`? No, usually arbitrary SQL execution is not allowed via rpc unless a custom function is defined.
  console.log('Query:', query);
}

setupTables();
