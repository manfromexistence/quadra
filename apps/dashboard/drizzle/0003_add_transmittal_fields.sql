-- Add purpose and dueDate fields to transmittals table
ALTER TABLE transmittals ADD COLUMN purpose TEXT DEFAULT 'IFR';
ALTER TABLE transmittals ADD COLUMN due_date INTEGER;
