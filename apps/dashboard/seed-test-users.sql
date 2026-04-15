-- Seed test users for EDMS workflow demo
-- Execute: cat apps/dashboard/seed-test-users.sql | wsl bash -c "~/.turso/turso db shell quadra"

-- Create Contractor DC user
INSERT INTO user (id, name, email, email_verified, created_at, updated_at, role, organization, is_active)
VALUES (
  'user-dc-001',
  'Contractor DC',
  'dc@quadra.com',
  1,
  1744934400000,
  1744934400000,
  'contractor',
  'DC Construction LLC',
  1
);

-- Create password for Contractor DC (password: password123)
INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
VALUES (
  'account-dc-001',
  'dc@quadra.com',
  'credential',
  'user-dc-001',
  '$2a$10$rZ5c3Hx8kI2q5baKgA3fNnovSN9Orkp1UgLyVn08kI2q5baKgA3fNu',
  1744934400000,
  1744934400000
);

-- Create Client Engineer user
INSERT INTO user (id, name, email, email_verified, created_at, updated_at, role, organization, is_active)
VALUES (
  'user-client-001',
  'Client Engineer',
  'client@quadra.com',
  1,
  1744934400000,
  1744934400000,
  'client',
  'Dubai Marina Development',
  1
);

-- Create password for Client Engineer (password: password123)
INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
VALUES (
  'account-client-001',
  'client@quadra.com',
  'credential',
  'user-client-001',
  '$2a$10$rZ5c3Hx8kI2q5baKgA3fNnovSN9Orkp1UgLyVn08kI2q5baKgA3fNu',
  1744934400000,
  1744934400000
);
