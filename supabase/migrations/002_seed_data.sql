-- Seed data voor DaCapo Jaarplanner
-- Dit bestand bevat initiële data voor de 7 kalenders

-- Insert default calendars
INSERT INTO calendars (name, code, color) VALUES
  ('DaCapo Algemeen', 'ALG', '#3B82F6'),                    -- Blauw
  ('BB/KB Onderbouw', 'BBKB_OB', '#10B981'),                -- Groen
  ('GT Onderbouw', 'GT_OB', '#F59E0B'),                     -- Oranje
  ('BB/KB Bovenbouw MLN', 'BBKB_BB_MLN', '#8B5CF6'),        -- Paars
  ('BB/BK Bovenbouw HVK', 'BBBK_BB_HVK', '#EF4444'),        -- Rood
  ('GT Bovenbouw', 'GT_BB', '#EC4899'),                     -- Roze
  ('Kwaliteitskalender', 'KWAL', '#06B6D4');                -- Cyaan

-- Insert a test admin user (you can modify this or remove it later)
-- Password hash is not included here - use Supabase Auth UI or API to create real users
INSERT INTO users (name, email, role, department) VALUES
  ('Admin Testaccount', 'admin@dacapo.nl', 'admin', 'Schoolleiding'),
  ('Jan de Docent', 'jan@dacapo.nl', 'contributor', 'BB/KB Onderbouw'),
  ('Maria Teamleider', 'maria@dacapo.nl', 'approver', 'GT Bovenbouw');

-- Insert some example events for testing (optional)
-- These are example events for the 2026/2027 school year

DO $$
DECLARE
  alg_calendar_id UUID;
  bbkb_ob_calendar_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get calendar IDs
  SELECT id INTO alg_calendar_id FROM calendars WHERE code = 'ALG';
  SELECT id INTO bbkb_ob_calendar_id FROM calendars WHERE code = 'BBKB_OB';
  
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin@dacapo.nl';

  -- Insert example events
  INSERT INTO events (title, description, school_year, start_datetime, end_datetime, all_day, category, location, audience, status, created_by, approved_by)
  VALUES
    (
      'Herfstvakantie',
      'Herfstvakantie voor alle leerlingen',
      '2026/2027',
      '2026-10-19 00:00:00+02',
      '2026-10-25 23:59:59+02',
      true,
      'vakantie',
      NULL,
      'Alle leerlingen',
      'goedgekeurd',
      admin_user_id,
      admin_user_id
    ),
    (
      'Open Dag',
      'Open dag voor nieuwe aanmeldingen',
      '2026/2027',
      '2026-11-14 10:00:00+01',
      '2026-11-14 15:00:00+01',
      false,
      'ouderavond',
      'School gebouw',
      'Ouders en leerlingen',
      'goedgekeurd',
      admin_user_id,
      admin_user_id
    ),
    (
      'Kerstvakantie',
      'Kerstvakantie voor alle leerlingen',
      '2026/2027',
      '2026-12-21 00:00:00+01',
      '2027-01-03 23:59:59+01',
      true,
      'vakantie',
      NULL,
      'Alle leerlingen',
      'goedgekeurd',
      admin_user_id,
      admin_user_id
    ),
    (
      'Toetsweek Periode 2',
      'Toetsweek voor onderbouw',
      '2026/2027',
      '2027-01-18 08:30:00+01',
      '2027-01-22 16:00:00+01',
      false,
      'toetsweek',
      'School gebouw',
      'BB/KB Onderbouw',
      'goedgekeurd',
      admin_user_id,
      admin_user_id
    );

  -- Link events to calendars
  -- Herfstvakantie en Kerstvakantie -> Algemeen
  INSERT INTO event_calendars (event_id, calendar_id)
  SELECT e.id, alg_calendar_id
  FROM events e
  WHERE e.title IN ('Herfstvakantie', 'Kerstvakantie', 'Open Dag');

  -- Toetsweek -> BB/KB Onderbouw
  INSERT INTO event_calendars (event_id, calendar_id)
  SELECT e.id, bbkb_ob_calendar_id
  FROM events e
  WHERE e.title = 'Toetsweek Periode 2';

END $$;

-- Note: In productie zou je echte gebruikers aanmaken via Supabase Auth
-- en deze users tabel synchroniseren met auth.users via triggers of functies
