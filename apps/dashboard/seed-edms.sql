-- Create test admin user
INSERT INTO user (id, name, email, email_verified, created_at, updated_at, role, organization, is_active)
VALUES ('test-admin-001', 'Admin User', 'admin@quadra.com', 1, 1744934400000, 1744934400000, 'admin', 'Quadra Construction', 1);

-- Create test PMC user
INSERT INTO user (id, name, email, email_verified, created_at, updated_at, role, organization, is_active)
VALUES ('test-pmc-001', 'PMC User', 'pmc@quadra.com', 1, 1744934400000, 1744934400000, 'pmc', 'Quadra PMC', 1);

-- Create test projects
INSERT INTO projects (id, name, description, project_number, location, client_id, status, start_date, end_date, created_at, updated_at, created_by)
VALUES 
('proj-001', 'Downtown Office Tower', 'Modern 40-story office building in downtown district', 'PRJ-2026-001', 'Tokyo, Japan', 'test-admin-001', 'active', 1735689600000, 1767225600000, 1744934400000, 1744934400000, 'test-admin-001'),
('proj-002', 'Residential Complex Phase 1', '200-unit residential development with amenities', 'PRJ-2026-002', 'Osaka, Japan', 'test-admin-001', 'active', 1738368000000, 1769904000000, 1744934400000, 1744934400000, 'test-admin-001'),
('proj-003', 'Highway Bridge Construction', 'New 2km bridge connecting two districts', 'PRJ-2026-003', 'Yokohama, Japan', 'test-admin-001', 'on-hold', 1741046400000, 1772582400000, 1744934400000, 1744934400000, 'test-admin-001');

-- Add project members
INSERT INTO project_members (id, project_id, user_id, role, assigned_at, assigned_by)
VALUES
('pm-001', 'proj-001', 'test-admin-001', 'admin', 1744934400000, 'test-admin-001'),
('pm-002', 'proj-001', 'test-pmc-001', 'pmc', 1744934400000, 'test-admin-001'),
('pm-003', 'proj-002', 'test-admin-001', 'admin', 1744934400000, 'test-admin-001'),
('pm-004', 'proj-003', 'test-pmc-001', 'pmc', 1744934400000, 'test-admin-001');

-- Create test documents
INSERT INTO documents (id, project_id, document_number, title, description, discipline, category, version, revision, is_latest_version, file_name, file_size, file_type, file_url, status, uploaded_at, uploaded_by, updated_at, updated_by)
VALUES
('doc-001', 'proj-001', 'DWG-ARCH-001-R0', 'Ground Floor Architectural Plan', 'Detailed architectural drawings for ground floor layout', 'Architectural', 'Drawing', '1.0', 'R0', 'true', 'ground-floor-plan.pdf', 2458624, 'pdf', 'https://i.ibb.co/sample1.pdf', 'approved', 1744934400000, 'test-admin-001', 1744934400000, 'test-admin-001'),
('doc-002', 'proj-001', 'SPEC-STRUCT-001-R0', 'Structural Specifications', 'Structural engineering specifications and requirements', 'Structural', 'Specification', '1.0', 'R0', 'true', 'structural-specs.pdf', 1845632, 'pdf', 'https://i.ibb.co/sample2.pdf', 'under_review', 1744934400000, 'test-pmc-001', 1744934400000, 'test-pmc-001'),
('doc-003', 'proj-002', 'DWG-MEP-001-R0', 'MEP Layout - Typical Floor', 'Mechanical, Electrical, and Plumbing layout for typical residential floor', 'MEP', 'Drawing', '1.0', 'R0', 'true', 'mep-typical-floor.pdf', 3145728, 'pdf', 'https://i.ibb.co/sample3.pdf', 'submitted', 1744934400000, 'test-pmc-001', 1744934400000, 'test-pmc-001'),
('doc-004', 'proj-001', 'RPT-GEOTECH-001-R0', 'Geotechnical Investigation Report', 'Soil investigation and foundation recommendations', 'Civil', 'Report', '1.0', 'R0', 'true', 'geotech-report.pdf', 5242880, 'pdf', 'https://i.ibb.co/sample4.pdf', 'approved', 1744934400000, 'test-admin-001', 1744934400000, 'test-admin-001');

-- Create workflows
INSERT INTO document_workflows (id, document_id, workflow_name, current_step, total_steps, status, started_at, created_by)
VALUES
('wf-001', 'doc-002', 'Technical Review - Structural Specs', 1, 3, 'in_progress', 1744934400000, 'test-pmc-001'),
('wf-002', 'doc-003', 'Design Approval - MEP Layout', 1, 2, 'pending', 1744934400000, 'test-pmc-001');

-- Create workflow steps
INSERT INTO workflow_steps (id, workflow_id, step_number, step_name, assigned_to, assigned_role, status, due_date)
VALUES
('ws-001', 'wf-001', 1, 'PMC Technical Review', 'test-pmc-001', 'pmc', 'in_progress', 1745539200000),
('ws-002', 'wf-001', 2, 'Client Approval', 'test-admin-001', 'client', 'pending', 1746144000000),
('ws-003', 'wf-001', 3, 'Final Sign-off', 'test-admin-001', 'admin', 'pending', 1746748800000),
('ws-004', 'wf-002', 1, 'Design Review', 'test-admin-001', 'admin', 'pending', 1745539200000),
('ws-005', 'wf-002', 2, 'Client Approval', 'test-admin-001', 'client', 'pending', 1746144000000);

-- Create transmittals
INSERT INTO transmittals (id, project_id, transmittal_number, subject, description, sent_from, sent_to, status, created_at, sent_at)
VALUES
('trans-001', 'proj-001', 'TRN-2026-001', 'Architectural Drawings - Ground Floor', 'Transmitting approved ground floor architectural plans for construction', 'test-admin-001', '["test-pmc-001"]', 'sent', 1744934400000, 1744934400000),
('trans-002', 'proj-002', 'TRN-2026-002', 'MEP Drawings for Review', 'Submitting MEP drawings for technical review and approval', 'test-pmc-001', '["test-admin-001"]', 'sent', 1744934400000, 1744934400000);

-- Link documents to transmittals
INSERT INTO transmittal_documents (id, transmittal_id, document_id, added_at)
VALUES
('td-001', 'trans-001', 'doc-001', 1744934400000),
('td-002', 'trans-002', 'doc-003', 1744934400000);

-- Create notifications
INSERT INTO notifications (id, user_id, type, title, message, project_id, document_id, is_read, created_at)
VALUES
('notif-001', 'test-pmc-001', 'review_request', 'Review Request: Structural Specifications', 'You have been assigned to review document SPEC-STRUCT-001-R0', 'proj-001', 'doc-002', 0, 1744934400000),
('notif-002', 'test-admin-001', 'document_submitted', 'New Document Submitted', 'MEP Layout - Typical Floor has been submitted for review', 'proj-002', 'doc-003', 0, 1744934400000),
('notif-003', 'test-admin-001', 'transmittal_received', 'Transmittal Received: TRN-2026-002', 'You have received a new transmittal with MEP drawings', 'proj-002', NULL, 0, 1744934400000);

-- Create activity log
INSERT INTO activity_log (id, user_id, project_id, action, entity_type, entity_id, entity_name, description, created_at)
VALUES
('act-001', 'test-admin-001', 'proj-001', 'project_created', 'project', 'proj-001', 'Downtown Office Tower', 'Created new project', 1744934400000),
('act-002', 'test-admin-001', 'proj-001', 'document_uploaded', 'document', 'doc-001', 'DWG-ARCH-001-R0', 'Uploaded architectural drawing', 1744934400000),
('act-003', 'test-admin-001', 'proj-001', 'document_approved', 'document', 'doc-001', 'DWG-ARCH-001-R0', 'Approved ground floor plan', 1744934400000),
('act-004', 'test-pmc-001', 'proj-001', 'document_uploaded', 'document', 'doc-002', 'SPEC-STRUCT-001-R0', 'Uploaded structural specifications', 1744934400000),
('act-005', 'test-pmc-001', 'proj-001', 'workflow_created', 'workflow', 'wf-001', 'Technical Review - Structural Specs', 'Started review workflow', 1744934400000);
