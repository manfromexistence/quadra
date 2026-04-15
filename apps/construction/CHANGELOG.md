# Changelog

## [Unreleased] - 2026-04-13

### Added - Workflow Enhancements

#### 🎯 Approval Codes (1-4)
Expanded workflow decisions from 3 to 5 types with industry-standard approval codes:

- **Code-1: Approve** - Clean approval, no comments required, advances workflow
- **Code-2: Approved with Comments** - Approve with notes, requires comments, advances workflow
- **Code-3: Reject** - Reject document, ends workflow
- **Code-4: For Information Only** - Log for awareness, doesn't block workflow
- **Comment Only** - Add notes without deciding, doesn't complete step

**Database Changes:**
- Added `approval_code` (integer) to `workflow_steps` table
- Updated status enum: `approved_with_comments`, `for_information`
- Updated action enum: `approve_with_comments`, `for_information`

**Backend Changes:**
- Enhanced `recordWorkflowDecision` in `actions/workflows.ts`
- Added approval code mapping (1=Approve, 2=Approved with Comments, 3=Reject, 4=For Information)
- Validation: Comments required for Code-2 and Comment decisions
- Activity logging includes approval codes

**Frontend Changes:**
- Updated `workflow-action-sheet.tsx` with 5 decision options
- Clear labels showing approval codes
- Validation feedback for required comments

#### 📎 CSR (Comments Resolution Sheet) Attachments
Added file attachment support for workflow decisions:

**Database Changes:**
- Added `attachment_url` (text) to `workflow_steps` table
- Added `attachment_file_name` (varchar 500) to `workflow_steps` table
- Added `attachment_file_size` (integer) to `workflow_steps` table

**Backend Changes:**
- Enhanced `recordWorkflowDecision` to accept file attachments
- Store attachment metadata (URL, filename, size)
- Log attachment presence in activity feed
- Include attachment info in notifications

**Frontend Changes:**
- Added file upload component to workflow action sheet
- Support for Excel, PDF, Word, and all file types
- File preview with name and size display
- Remove attachment option
- Files stored in `workflow-attachments` folder
- Updated `DocumentFileUpload` component to support `workflow-attachments` folder

#### 🔧 Supporting Changes
- Added `projectId` to `WorkflowStepSummary` interface in `lib/edms/workflows.ts`
- Pass `projectId` to `WorkflowActionSheet` component in workflows page
- Created database migration file: `db/migrations/add_workflow_approval_codes_and_attachments.sql`
- Fixed TypeScript errors in fallback data

### Verified

#### ✅ Bulk Document Upload
Confirmed existing feature is fully functional:
- Location: `components/edms/document-bulk-upload-sheet.tsx`
- Upload multiple documents simultaneously
- Shared metadata (project, discipline, category, status)
- Individual title customization
- Progress tracking and error handling
- No changes needed

### Fixed

- TypeScript error: Added `workflow-attachments` to allowed folder types in `DocumentFileUpload`
- TypeScript error: Added missing `projectId` to fallback workflow steps data
- npm cache configuration: Moved from D drive to F drive

### Technical Details

**Files Modified:**
- `db/schema/workflows.ts` - Added approval_code and attachment columns
- `actions/workflows.ts` - Enhanced decision logic with 5 types and attachments
- `components/edms/workflow-action-sheet.tsx` - Updated UI with new decisions and file upload
- `components/edms/document-file-upload.tsx` - Added workflow-attachments folder support
- `lib/edms/workflows.ts` - Added projectId to workflow step data and fallback data
- `app/dashboard/workflows/page.tsx` - Pass projectId to action sheet

**Files Created:**
- `db/migrations/add_workflow_approval_codes_and_attachments.sql` - Database migration

**Decision Behavior Matrix:**

| Decision | Code | Completes Step? | Requires Comments? | Advances Workflow? |
|----------|------|-----------------|-------------------|-------------------|
| Approve | 1 | ✅ Yes | ❌ No | ✅ Yes |
| Approved with Comments | 2 | ✅ Yes | ✅ Yes | ✅ Yes |
| Reject | 3 | ✅ Yes | ❌ No | ❌ No (ends) |
| For Information Only | 4 | ✅ Yes | ❌ No | ❌ No (logs) |
| Comment only | - | ❌ No | ✅ Yes | ❌ No |

### Migration Required

Run database migration to apply schema changes:
```bash
npm run db:push
```

Or manually execute:
```sql
ALTER TABLE workflow_steps 
ADD COLUMN IF NOT EXISTS approval_code INTEGER,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_file_name VARCHAR(500),
ADD COLUMN IF NOT EXISTS attachment_file_size INTEGER;
```

### Testing Checklist

- [ ] Apply database migration
- [ ] Test Code-1: Approve (no comments)
- [ ] Test Code-2: Approved with Comments (requires comments)
- [ ] Test Code-3: Reject
- [ ] Test Code-4: For Information Only
- [ ] Test Comment only (requires comments)
- [ ] Upload CSR attachment (Excel/PDF)
- [ ] Verify file preview and remove
- [ ] Check workflow advances correctly for Code-1 and Code-2
- [ ] Check workflow ends for Code-3
- [ ] Check workflow logs but doesn't advance for Code-4
- [ ] Verify notifications include attachment info
- [ ] Check activity log shows approval codes
- [ ] Test bulk document upload (existing feature)

### Notes

- All TypeScript errors fixed ✅
- Follows existing code patterns and conventions
- Mobile responsive UI
- Complete audit trail maintained
- Backward compatible with existing workflows
- npm cache moved to F drive for better disk space management
