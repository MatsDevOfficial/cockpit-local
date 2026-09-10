-- Seed data for local development
-- Run after setup-db.sql or 01_init_schema.sql

-- ============================================================
-- EVENTS
-- ============================================================
INSERT INTO events (
  airtable_id, event_name, poc_first_name, poc_last_name, poc_preferred_name,
  email, location, slug, street_address, city, state, country, zipcode,
  event_format, estimated_attendee_count, triage_status, lat, long,
  project_url, project_description, start_date, end_date, has_confirmed_venue, notes
) VALUES
(
  'evt001', 'SF AI Hackathon 2025', 'Alice', 'Chen', 'Alice',
  'alice@hackclub.com', ' Pier 48, San Francisco', 'sf-ai-hackathon-2025',
  'Pier 48', 'San Francisco', 'CA', 'United States', '94158',
  '24-hours', 120, 'approved', 37.7849, -122.3891,
  'https://sf-ai-hack.dev', '48-hour AI hackathon in the Bay Area',
  '2025-11-15', '2025-11-16', true, 'Main venue confirmed'
),
(
  'evt002', 'London Web3 Summit', 'Bob', 'Martin', 'Bob',
  'bob@hackclub.com', 'WeWork South Bank, London', 'london-web3-summit',
  '103-105 Buckingham Palace Rd', 'London', NULL, 'United Kingdom', 'SW1W 0QP',
  '12-hours', 80, 'approved', 51.4975, -0.1357,
  'https://web3summit.dev', 'One-day summit for Web3 developers',
  '2025-12-01', '2025-12-01', true, NULL
),
(
  'evt003', 'Tokyo Mobile Challenge', 'Yuki', 'Tanaka', 'Yuki',
  'yuki@hackclub.com', 'Roppongi Hills Arena, Tokyo', 'tokyo-mobile-challenge',
  '6-10-1 Roppongi', 'Tokyo', 'Tokyo', 'Japan', '106-6108',
  '24-hours', 60, 'pending', 35.6604, 139.7312,
  NULL, 'Weekend mobile app building challenge', NULL, NULL, false, 'Awaiting venue confirmation'
),
(
  'evt004', 'Toronto Startup Weekend', 'Priya', 'Sharma', 'Priya',
  'priya@hackclub.com', 'MaRS Discovery District, Toronto', 'toronto-startup-weekend',
  '101 College St', 'Toronto', 'ON', 'Canada', 'M5R 0C3',
  '2-day', 45, 'approved', 43.6591, -79.3871,
  'https://startupweekend.ca', 'Build a startup in 48 hours',
  '2025-10-20', '2025-10-21', true, 'Food sponsors confirmed'
);

-- ============================================================
-- ADMINS
-- ============================================================
INSERT INTO admins (
  airtable_id, email, first_name, last_name, user_status
) VALUES
(
  'adm001', 'admin@hackclub.com', 'Admin', 'User', 'admin'
),
(
  'adm002', 'mod@hackclub.com', 'Mod', 'User', 'active'
);

-- ============================================================
-- ATTENDEES
-- ============================================================
INSERT INTO attendees (
  airtable_id, email, preferred_name, first_name, last_name, phone,
  event_airtable_id, deleted_in_cockpit, event_volunteer, shirt_size,
  dietary_restrictions, checkin_completed, scanned_in
) VALUES
(
  'att001', 'alice@hackclub.com', 'Alice', 'Alice', 'Chen', '+1-555-0101',
  'evt001', false, false, 'M', NULL, false, false
),
(
  'att002', 'bob@hackclub.com', 'Bob', 'Bob', 'Martin', '+44-555-0102',
  'evt002', false, false, 'L', 'Vegetarian', false, false
),
(
  'att003', 'carlos@example.com', 'Carlos', 'Carlos', 'Garcia', '+1-555-0103',
  'evt001', false, true, 'XL', NULL, true, true
),
(
  'att004', 'dana@example.com', 'Dana', 'Dana', 'Lee', '+1-555-0104',
  'evt001', false, false, 'S', 'Vegan', false, false
),
(
  'att005', 'eve@example.com', 'Eve', 'Eve', 'Johnson', '+49-555-0105',
  'evt002', false, false, 'M', NULL, false, false
),
(
  'att006', 'faisal@example.com', 'Faisal', 'Faisal', 'Ahmed', '+1-555-0106',
  'evt004', true, false, 'L', 'Halal', false, false
);

-- ============================================================
-- VENUES
-- ============================================================
INSERT INTO venues (
  airtable_id, venue_id, event_name, venue_name,
  address_1, city, state, country, zip_code,
  venue_contact_name, venue_contact_email
) VALUES
(
  'ven001', 'V001', 'SF AI Hackathon 2025', 'Pier 48',
  'Pier 48', 'San Francisco', 'CA', 'United States', '94158',
  'Venue Manager', 'events@pier48sf.com'
),
(
  'ven002', 'V002', 'London Web3 Summit', 'WeWork South Bank',
  '103-105 Buckingham Palace Rd', 'London', NULL, 'United Kingdom', 'SW1W 0QP',
  'Events Team', 'london@wework.com'
);
