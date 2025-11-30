-- DaCapo Jaarplanner Database Schema
-- Schooljaar 2026/2027

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('viewer', 'contributor', 'approver', 'admin');
CREATE TYPE event_status AS ENUM ('concept', 'ingediend', 'goedgekeurd', 'afgewezen');

-- Table: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: calendars
CREATE TABLE calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  school_year TEXT NOT NULL DEFAULT '2026/2027',
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,
  category TEXT,
  location TEXT,
  audience TEXT,
  status event_status NOT NULL DEFAULT 'concept',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: event_calendars (many-to-many relationship)
CREATE TABLE event_calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
  UNIQUE(event_id, calendar_id)
);

-- Table: approvals_log
CREATE TABLE approvals_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('goedgekeurd', 'afgewezen')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_events_school_year ON events(school_year);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_datetime ON events(start_datetime);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_event_calendars_event_id ON event_calendars(event_id);
CREATE INDEX idx_event_calendars_calendar_id ON event_calendars(calendar_id);
CREATE INDEX idx_approvals_log_event_id ON approvals_log(event_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendars_updated_at
  BEFORE UPDATE ON calendars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic setup - can be refined based on Supabase Auth)
-- For now, allow all operations for authenticated users
-- These policies should be adjusted when implementing proper authentication

CREATE POLICY "Allow all for authenticated users" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON calendars
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON events
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON event_calendars
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON approvals_log
  FOR ALL USING (true);
