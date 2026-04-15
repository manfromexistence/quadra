-- Migration: Add approval codes and attachment support to workflow steps
-- Date: 2026-04-13
-- Description: Adds approval_code, attachment fields to workflow_steps table to support:
--   - Code-1: Approve
--   - Code-2: Approved with Comments
--   - Code-3: Reject
--   - Code-4: For Information Only
--   - CSR (Comments Resolution Sheet) attachments

-- Add approval_code column (1=Approve, 2=Approved with Comments, 3=Reject, 4=For Information)
ALTER TABLE workflow_steps 
ADD COLUMN IF NOT EXISTS approval_code INTEGER;

-- Add attachment columns for CSR and other supporting documents
ALTER TABLE workflow_steps 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_file_name VARCHAR(500),
ADD COLUMN IF NOT EXISTS attachment_file_size INTEGER;

-- Add comment to explain the approval codes
COMMENT ON COLUMN workflow_steps.approval_code IS 'Approval code: 1=Approve, 2=Approved with Comments, 3=Reject, 4=For Information Only';
COMMENT ON COLUMN workflow_steps.attachment_url IS 'URL to CSR (Comments Resolution Sheet) or other supporting documents';
COMMENT ON COLUMN workflow_steps.attachment_file_name IS 'Original filename of the attached document';
COMMENT ON COLUMN workflow_steps.attachment_file_size IS 'File size in bytes';

-- Update status column comment to include new statuses
COMMENT ON COLUMN workflow_steps.status IS 'Status: pending, in_progress, approved, approved_with_comments, rejected, skipped, for_information';
COMMENT ON COLUMN workflow_steps.action IS 'Action: approve, approve_with_comments, reject, comment, for_information';
