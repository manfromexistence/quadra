-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  logo_url TEXT,
  inbox_id TEXT,
  inbox_email TEXT,
  inbox_forwarding INTEGER DEFAULT 0,
  base_currency TEXT DEFAULT 'USD',
  document_classification INTEGER DEFAULT 1,
  plan TEXT DEFAULT 'pro',
  created_at INTEGER NOT NULL,
  canceled_at INTEGER
);

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  type TEXT,
  balance REAL DEFAULT 0,
  enabled INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  bank_account_id TEXT,
  date INTEGER NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'posted',
  method TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  customer_id TEXT,
  invoice_number TEXT NOT NULL,
  issue_date INTEGER NOT NULL,
  due_date INTEGER,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft',
  paid_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Create tracker_projects table
CREATE TABLE IF NOT EXISTS tracker_projects (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  rate REAL,
  currency TEXT DEFAULT 'USD',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Create tracker_entries table
CREATE TABLE IF NOT EXISTS tracker_entries (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  project_id TEXT,
  user_id TEXT NOT NULL,
  description TEXT,
  start INTEGER NOT NULL,
  stop INTEGER,
  duration INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES tracker_projects(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Create vault_files table
CREATE TABLE IF NOT EXISTS vault_files (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER,
  type TEXT,
  created_at INTEGER NOT NULL,
  created_by TEXT,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE SET NULL
);

-- Create inbox_items table
CREATE TABLE IF NOT EXISTS inbox_items (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  file_name TEXT,
  file_path TEXT,
  amount REAL,
  currency TEXT,
  date INTEGER,
  status TEXT DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Insert team data
INSERT INTO teams (id, name, email, logo_url, inbox_id, inbox_email, inbox_forwarding, base_currency, document_classification, plan, created_at)
VALUES ('team-001', 'Quadra Construction', 'team@quadra-edms.com', 'https://github.com/shadcn.png', 'inbox-001', 'inbox@quadra-edms.com', 1, 'USD', 1, 'pro', 1744934400000);

-- Update user to link to team
UPDATE user SET role = 'admin', organization = 'Quadra Construction' WHERE id = 'test-admin-001';

-- Insert bank accounts
INSERT INTO bank_accounts (id, team_id, name, currency, type, balance, enabled, created_at)
VALUES 
('bank-001', 'team-001', 'Business Checking', 'USD', 'depository', 50000.00, 1, 1744934400000),
('bank-002', 'team-001', 'Savings Account', 'USD', 'depository', 25000.00, 1, 1744934400000);

-- Insert transactions
INSERT INTO transactions (id, team_id, bank_account_id, date, amount, currency, name, description, category, status, method, created_at)
VALUES
('txn-001', 'team-001', 'bank-001', 1744934400000, -5000.00, 'USD', 'Office Supplies Inc', 'Monthly office supplies', 'office', 'posted', 'ach', 1744934400000),
('txn-002', 'team-001', 'bank-001', 1744848000000, 15000.00, 'USD', 'Client Payment - Project A', 'Payment for completed milestone', 'income', 'posted', 'wire', 1744848000000),
('txn-003', 'team-001', 'bank-001', 1744761600000, -2500.00, 'USD', 'Equipment Rental Co', 'Construction equipment rental', 'equipment', 'posted', 'card', 1744761600000),
('txn-004', 'team-001', 'bank-001', 1744675200000, -8000.00, 'USD', 'Subcontractor Services', 'Electrical work Phase 1', 'contractors', 'posted', 'ach', 1744675200000),
('txn-005', 'team-001', 'bank-001', 1744588800000, 25000.00, 'USD', 'Client Payment - Project B', 'Initial deposit', 'income', 'posted', 'wire', 1744588800000);

-- Insert customers
INSERT INTO customers (id, team_id, name, email, phone, address, city, country, created_at)
VALUES
('cust-001', 'team-001', 'Tokyo Development Corp', 'contact@tokyodev.jp', '+81-3-1234-5678', '1-1-1 Shibuya', 'Tokyo', 'Japan', 1744934400000),
('cust-002', 'team-001', 'Osaka Properties Ltd', 'info@osakaprops.jp', '+81-6-9876-5432', '2-2-2 Namba', 'Osaka', 'Japan', 1744934400000),
('cust-003', 'team-001', 'Yokohama Infrastructure', 'admin@yokoinfra.jp', '+81-45-1111-2222', '3-3-3 Minato Mirai', 'Yokohama', 'Japan', 1744934400000);

-- Insert invoices
INSERT INTO invoices (id, team_id, customer_id, invoice_number, issue_date, due_date, amount, currency, status, created_at)
VALUES
('inv-001', 'team-001', 'cust-001', 'INV-2026-001', 1744934400000, 1747526400000, 15000.00, 'USD', 'paid', 1744934400000),
('inv-002', 'team-001', 'cust-002', 'INV-2026-002', 1744934400000, 1747526400000, 8500.00, 'USD', 'pending', 1744934400000),
('inv-003', 'team-001', 'cust-001', 'INV-2026-003', 1744934400000, 1747526400000, 12000.00, 'USD', 'overdue', 1744934400000);

-- Insert tracker projects
INSERT INTO tracker_projects (id, team_id, name, description, status, rate, currency, created_at)
VALUES
('track-proj-001', 'team-001', 'Downtown Office Tower', 'Time tracking for office tower project', 'active', 150.00, 'USD', 1744934400000),
('track-proj-002', 'team-001', 'Residential Complex', 'Time tracking for residential development', 'active', 125.00, 'USD', 1744934400000);

-- Insert tracker entries
INSERT INTO tracker_entries (id, team_id, project_id, user_id, description, start, stop, duration, created_at)
VALUES
('track-001', 'team-001', 'track-proj-001', 'test-admin-001', 'Site inspection and planning', 1744934400000, 1744941600000, 7200, 1744934400000),
('track-002', 'team-001', 'track-proj-001', 'test-admin-001', 'Client meeting and review', 1744948800000, 1744952400000, 3600, 1744948800000),
('track-003', 'team-001', 'track-proj-002', 'test-admin-001', 'Design review session', 1744956000000, 1744963200000, 7200, 1744956000000);

-- Insert vault files
INSERT INTO vault_files (id, team_id, name, path, size, type, created_at, created_by)
VALUES
('vault-001', 'team-001', 'Contract - Tokyo Development.pdf', '/contracts/tokyo-dev-contract.pdf', 2458624, 'application/pdf', 1744934400000, 'test-admin-001'),
('vault-002', 'team-001', 'Insurance Certificate 2026.pdf', '/insurance/cert-2026.pdf', 1845632, 'application/pdf', 1744934400000, 'test-admin-001'),
('vault-003', 'team-001', 'Safety Compliance Report.pdf', '/reports/safety-compliance.pdf', 3145728, 'application/pdf', 1744934400000, 'test-admin-001');

-- Insert inbox items
INSERT INTO inbox_items (id, team_id, display_name, file_name, file_path, amount, currency, date, status, created_at)
VALUES
('inbox-001', 'team-001', 'Receipt - Equipment Purchase', 'receipt-equipment.pdf', '/inbox/receipt-001.pdf', 2500.00, 'USD', 1744934400000, 'pending', 1744934400000),
('inbox-002', 'team-001', 'Invoice - Material Supplier', 'invoice-materials.pdf', '/inbox/invoice-001.pdf', 8500.00, 'USD', 1744934400000, 'pending', 1744934400000),
('inbox-003', 'team-001', 'Receipt - Office Supplies', 'receipt-office.pdf', '/inbox/receipt-002.pdf', 350.00, 'USD', 1744934400000, 'pending', 1744934400000);
