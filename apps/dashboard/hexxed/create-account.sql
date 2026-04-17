-- Create account with password for test admin user
-- Password: admin123
INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
VALUES ('acc-admin-001', 'admin@quadra.com', 'credential', 'test-admin-001', '$2b$10$CurHVGIvK3oS2oWweiggHecgrUUmFD3qLKo21.Y2yr8z4v0F9/6jK', 1744934400000, 1744934400000);
