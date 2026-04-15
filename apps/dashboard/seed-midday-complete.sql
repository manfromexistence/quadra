-- Ensure we have a team
INSERT OR IGNORE INTO teams (id, name, email, created_at, base_currency) VALUES
('team-001', 'Quadra Construction', 'team@quadra.com', unixepoch(), 'USD');

-- Add more bank accounts
INSERT OR REPLACE INTO bank_accounts (id, team_id, name, currency, balance, type, enabled, created_at) VALUES
('bank-001', 'team-001', 'Business Checking', 'USD', 50000.00, 'checking', 1, unixepoch()),
('bank-002', 'team-001', 'Savings Account', 'USD', 25000.00, 'savings', 1, unixepoch()),
('bank-003', 'team-001', 'Project Account', 'USD', 15000.00, 'checking', 1, unixepoch());

-- Add more transactions
INSERT OR REPLACE INTO transactions (id, team_id, bank_account_id, name, amount, currency, date, status, category, method, created_at) VALUES
('txn-001', 'team-001', 'bank-001', 'Office Supplies Inc', -5000.00, 'USD', unixepoch('2026-04-01'), 'completed', 'office', 'card', unixepoch()),
('txn-002', 'team-001', 'bank-001', 'Client Payment - Project A', 15000.00, 'USD', unixepoch('2026-04-05'), 'completed', 'income', 'transfer', unixepoch()),
('txn-003', 'team-001', 'bank-001', 'Equipment Rental Co', -2500.00, 'USD', unixepoch('2026-04-08'), 'completed', 'equipment', 'card', unixepoch()),
('txn-004', 'team-001', 'bank-002', 'Interest Payment', 125.50, 'USD', unixepoch('2026-04-10'), 'completed', 'income', 'transfer', unixepoch()),
('txn-005', 'team-001', 'bank-001', 'Software Subscription', -299.00, 'USD', unixepoch('2026-04-12'), 'completed', 'software', 'card', unixepoch()),
('txn-006', 'team-001', 'bank-003', 'Material Supplier', -8500.00, 'USD', unixepoch('2026-04-14'), 'pending', 'materials', 'transfer', unixepoch());

-- Add more customers
INSERT OR REPLACE INTO customers (id, team_id, name, email, phone, address, city, country, created_at) VALUES
('cust-001', 'team-001', 'ABC Corporation', 'contact@abc-corp.com', '+1-555-0101', '123 Business St', 'New York', 'USA', unixepoch()),
('cust-002', 'team-001', 'XYZ Industries', 'billing@xyz-ind.com', '+1-555-0102', '456 Commerce Ave', 'Los Angeles', 'USA', unixepoch()),
('cust-003', 'team-001', 'Global Enterprises', 'accounts@global-ent.com', '+1-555-0103', '789 Trade Blvd', 'Chicago', 'USA', unixepoch()),
('cust-004', 'team-001', 'Tech Solutions Ltd', 'finance@techsol.com', '+1-555-0104', '321 Innovation Dr', 'San Francisco', 'USA', unixepoch());

-- Add more invoices
INSERT OR REPLACE INTO invoices (id, team_id, customer_id, invoice_number, issue_date, due_date, amount, currency, status, paid_at, created_at) VALUES
('inv-001', 'team-001', 'cust-001', 'INV-2026-001', unixepoch('2026-03-15'), unixepoch('2026-04-15'), 15000.00, 'USD', 'paid', unixepoch('2026-04-05'), unixepoch()),
('inv-002', 'team-001', 'cust-002', 'INV-2026-002', unixepoch('2026-04-01'), unixepoch('2026-05-01'), 8500.00, 'USD', 'unpaid', NULL, unixepoch()),
('inv-003', 'team-001', 'cust-003', 'INV-2026-003', unixepoch('2026-03-20'), unixepoch('2026-04-10'), 12000.00, 'USD', 'overdue', NULL, unixepoch()),
('inv-004', 'team-001', 'cust-004', 'INV-2026-004', unixepoch('2026-04-10'), unixepoch('2026-05-10'), 6500.00, 'USD', 'draft', NULL, unixepoch()),
('inv-005', 'team-001', 'cust-001', 'INV-2026-005', unixepoch('2026-04-12'), unixepoch('2026-05-12'), 9200.00, 'USD', 'unpaid', NULL, unixepoch());

-- Add tracker projects
INSERT OR REPLACE INTO tracker_projects (id, team_id, name, description, status, created_at) VALUES
('proj-001', 'team-001', 'Website Redesign', 'Complete overhaul of company website', 'active', unixepoch()),
('proj-002', 'team-001', 'Mobile App Development', 'iOS and Android app for clients', 'active', unixepoch()),
('proj-003', 'team-001', 'Database Migration', 'Move to new database infrastructure', 'completed', unixepoch()),
('proj-004', 'team-001', 'Marketing Campaign', 'Q2 2026 marketing initiatives', 'active', unixepoch());

-- Add tracker entries
INSERT OR REPLACE INTO tracker_entries (id, team_id, project_id, user_id, description, start, stop, duration, created_at) VALUES
('entry-001', 'team-001', 'proj-001', 'test-admin-001', 'Design mockups', unixepoch('2026-04-10 09:00:00'), unixepoch('2026-04-10 11:00:00'), 7200, unixepoch()),
('entry-002', 'team-001', 'proj-001', 'test-admin-001', 'Frontend development', unixepoch('2026-04-11 09:00:00'), unixepoch('2026-04-11 13:00:00'), 14400, unixepoch()),
('entry-003', 'team-001', 'proj-002', 'test-pmc-001', 'API integration', unixepoch('2026-04-12 10:00:00'), unixepoch('2026-04-12 13:00:00'), 10800, unixepoch()),
('entry-004', 'team-001', 'proj-002', 'test-pmc-001', 'UI implementation', unixepoch('2026-04-13 14:00:00'), unixepoch('2026-04-13 16:30:00'), 9000, unixepoch()),
('entry-005', 'team-001', 'proj-004', 'test-admin-001', 'Content creation', unixepoch('2026-04-14 10:00:00'), unixepoch('2026-04-14 11:30:00'), 5400, unixepoch());

-- Add vault files
INSERT OR REPLACE INTO vault_files (id, team_id, name, path, size, type, created_at) VALUES
('file-001', 'team-001', 'Contract_ABC_Corp.pdf', '/contracts/2026/contract_abc.pdf', 245678, 'application/pdf', unixepoch()),
('file-002', 'team-001', 'Invoice_Template.xlsx', '/templates/invoice_template.xlsx', 89234, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', unixepoch()),
('file-003', 'team-001', 'Project_Proposal.docx', '/proposals/project_proposal.docx', 156789, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', unixepoch()),
('file-004', 'team-001', 'Logo_Design.png', '/assets/logo_design.png', 45678, 'image/png', unixepoch());

-- Add inbox items
INSERT OR REPLACE INTO inbox_items (id, team_id, display_name, file_name, amount, currency, date, status, created_at) VALUES
('inbox-001', 'team-001', 'Payment Confirmation', 'payment_conf.pdf', 15000.00, 'USD', unixepoch('2026-04-05'), 'pending', unixepoch()),
('inbox-002', 'team-001', 'Invoice Query', 'invoice_query.pdf', 8500.00, 'USD', unixepoch('2026-04-08'), 'pending', unixepoch()),
('inbox-003', 'team-001', 'Project Update Request', 'project_update.pdf', NULL, 'USD', unixepoch('2026-04-10'), 'processed', unixepoch());

-- Add activity log (notifications)
INSERT OR REPLACE INTO activity_log (id, user_id, action, entity_type, entity_id, description, ip_address, user_agent, created_at) VALUES
('activity-001', 'test-admin-001', 'invoice_paid', 'invoice', 'inv-001', 'Invoice INV-2026-001 has been paid', '127.0.0.1', 'Mozilla/5.0', unixepoch()),
('activity-002', 'test-admin-001', 'invoice_overdue', 'invoice', 'inv-003', 'Invoice INV-2026-003 is overdue', '127.0.0.1', 'Mozilla/5.0', unixepoch()),
('activity-003', 'test-admin-001', 'transaction_created', 'transaction', 'txn-003', 'New transaction: Equipment Rental Co', '127.0.0.1', 'Mozilla/5.0', unixepoch()),
('activity-004', 'test-pmc-001', 'project_update', 'project', 'proj-001', 'Project Website Redesign updated', '127.0.0.1', 'Mozilla/5.0', unixepoch());
