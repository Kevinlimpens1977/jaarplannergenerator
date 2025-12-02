-- Verbeteringen voor DaCapo Jaarplanner Database Schema

-- 1. Nieuwe tabel voor Schooljaren (normalisatie)
CREATE TABLE school_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- bijv. "2026/2027"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed schooljaren
INSERT INTO school_years (name, start_date, end_date, is_active) VALUES
  ('2025/2026', '2025-08-01', '2026-07-31', false),
  ('2026/2027', '2026-08-01', '2027-07-31', true),
  ('2027/2028', '2027-08-01', '2028-07-31', false);

-- 2. Nieuwe tabel voor Doelgroepen (normalisatie)
CREATE TABLE audiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed doelgroepen
INSERT INTO audiences (name) VALUES
  ('Alle leerlingen'),
  ('BB/KB Onderbouw'),
  ('GT Onderbouw'),
  ('BB/KB Bovenbouw'),
  ('GT Bovenbouw'),
  ('Docenten'),
  ('Ouders');

-- 3. Update events tabel
ALTER TABLE events 
  ADD COLUMN outlook_id TEXT, -- Voor Microsoft Graph sync
  ADD COLUMN last_synced_at TIMESTAMPTZ;

-- Indexen voor performance
CREATE INDEX idx_events_outlook_id ON events(outlook_id);
CREATE INDEX idx_school_years_active ON school_years(is_active);

-- 4. RPC Functie voor efficiënte planner data
CREATE OR REPLACE FUNCTION get_planner_events(
  p_school_year TEXT,
  p_calendar_ids UUID[],
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  all_day BOOLEAN,
  category TEXT,
  location TEXT,
  status event_status,
  calendar_ids UUID[],
  calendar_colors TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_datetime,
    e.end_datetime,
    e.all_day,
    e.category,
    e.location,
    e.status,
    ARRAY_AGG(c.id) as calendar_ids,
    ARRAY_AGG(c.color) as calendar_colors
  FROM events e
  JOIN event_calendars ec ON e.id = ec.event_id
  JOIN calendars c ON ec.calendar_id = c.id
  WHERE 
    e.school_year = p_school_year
    AND e.status = 'goedgekeurd'
    AND e.start_datetime >= p_start_date
    AND e.start_datetime <= p_end_date
    AND c.id = ANY(p_calendar_ids)
  GROUP BY e.id;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger voor automatische updated_at op school_years
CREATE TRIGGER update_school_years_updated_at
  BEFORE UPDATE ON school_years
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS op nieuwe tabellen
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;

-- Policies (voorlopig open voor dev, later restrictief)
CREATE POLICY "Allow read for all" ON school_years FOR SELECT USING (true);
CREATE POLICY "Allow read for all" ON audiences FOR SELECT USING (true);