CREATE TABLE IF NOT EXISTS edms_file_assets (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  folder TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER NOT NULL,
  data_base64 TEXT NOT NULL,
  created_at INTEGER NOT NULL
);