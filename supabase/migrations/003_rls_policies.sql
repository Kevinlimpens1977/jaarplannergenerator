-- TEMPORARY: Disable Row Level Security for development
-- In production, you should enable RLS and create proper policies

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendars DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_calendars DISABLE ROW LEVEL SECURITY;
ALTER TABLE approvals_log DISABLE ROW LEVEL SECURITY;

-- Grant access to anon role (for development)
GRANT ALL ON users TO anon;
GRANT ALL ON calendars TO anon;
GRANT ALL ON events TO anon;
GRANT ALL ON event_calendars TO anon;
GRANT ALL ON approvals_log TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Note: For production, you should:
-- 1. Enable RLS on all tables
-- 2. Implement proper authentication
-- 3. Create policies based on user roles
-- 4. Remove the broad GRANT statements above
