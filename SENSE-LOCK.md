# Sense Lock - Construction EDMS Gaps Implementation

**Date:** 2026-04-21
**Purpose:** Lock the scope and implementation plan for construction-specific EDMS gaps identified in the audit.

## Scope Definition

This implementation addresses critical gaps between the current EDMS system and construction industry standards. The gaps were identified through a comprehensive audit of the database schema, implementation files, and construction workflows.

## Implementation Strategy

### Phase 1: Critical Foundation Fixes (Week 1-2)
**Goal:** Fix data model issues that prevent proper document tracking and workflow execution.

1. **Fix incoming transmittal documents to use actual document IDs**
   - Change `documentCode` (string) to `documentId` (foreign key)
   - Add `revision` field for specific revision tracking
   - This is foundational - without this, transmittals can't properly track documents

2. **Fix query/letter linked documents to use actual document IDs**
   - Same pattern as incoming transmittals
   - Enables proper document relationship tracking

3. **Add construction-standard document statuses**
   - Replace generic statuses with industry-standard A/B/C/I/R codes
   - This affects the entire document control workflow

### Phase 2: Core Construction Workflows (Week 2-4)
**Goal:** Implement the most critical construction-specific workflows.

4. **Create submittals table and workflow**
   - Submittals are the core of construction document control
   - Shop drawings, material submittals, equipment submittals all go through this process
   - This is the highest priority new feature

5. **Create change orders table**
   - Change orders have legal/contractual implications
   - Need proper tracking with cost impacts and approval workflows

6. **Add contract details to projects**
   - Contract value, type, number are fundamental to project tracking
   - Enables cost tracking and performance reporting

### Phase 3: Enhanced Document Control (Week 4-5)
**Goal:** Improve document classification and tracking.

7. **Add document type classification**
   - Distinguish between design documents, shop drawings, as-built, manufacturer data
   - Different workflows apply to different document types

8. **Add as-built document tracking**
   - Critical for facility handover and operations
   - Track which documents have as-built versions

### Phase 4: Construction-Specific Features (Week 5-6)
**Goal:** Implement construction-specific tracking and reporting.

9. **Create inspection requests table**
   - Inspections are required at various construction stages
   - Track inspection schedules, results, deficiencies

10. **Connect RFIs/queries to submittals and change orders**
    - Trace the impact of RFIs on project deliverables
    - Connect the workflow from question to resolution

11. **Create extension of time tracking**
    - EOT requests impact project schedule
    - Need approval workflow and schedule impact tracking

### Phase 5: Construction Reporting (Week 6-7)
**Goal:** Implement construction-specific reporting and tracking.

12. **Create daily reports**
    - Daily progress tracking is standard in construction
    - Manpower, equipment, activities, weather tracking

13. **Add safety observations tracking**
    - Safety is critical in construction
    - Track observations, corrective actions, trends

14. **Create commissioning checklists**
    - Commissioning is the final phase before handover
    - Track test procedures and results

15. **Add warranty tracking**
    - Warranty periods vary by system/equipment
    - Track expiry dates and claims

## Technical Approach

### Database Schema Changes
- All new tables will follow existing Drizzle ORM patterns
- Foreign key relationships will be properly defined with cascade deletes
- Junction tables will be used for many-to-many relationships
- Timestamps will use integer mode for SQLite compatibility

### Query Libraries
- Each new entity will have a dedicated query library in `src/lib/edms/`
- Functions will follow naming pattern: `get{Entity}`, `get{Entity}ById`, `create{Entity}`, `update{Entity}`
- Query libraries will be server-only (import "server-only")

### UI Components
- Pages will follow existing pattern in `src/app/[locale]/(app)/(sidebar)/`
- Forms will use Sheet components for creation/editing
- Tables will use existing DataTable components
- Status badges will use EdmsStatusBadge component

### Navigation
- New pages will be added to sidebar navigation in `src/components/main-menu.tsx`
- Navigation structure will follow construction industry conventions

### Migrations
- Each schema change will have a dedicated migration file
- Migrations will be named with descriptive suffixes
- Migration files will be in `drizzle/` directory

## Success Criteria

Each feature is considered complete when:
1. Database schema is created/updated with migration
2. Query library is created with CRUD operations
3. Page is created with full CRUD functionality
4. Page is added to sidebar navigation
5. Data can be seeded for testing
6. Feature passes linting and type checking
7. Feature follows existing UI/UX patterns

## Risk Mitigation

### Data Integrity
- All foreign key relationships will be validated
- Cascade deletes will be used carefully
- Data migration scripts will be tested on non-production data

### Performance
- Query libraries will use proper indexes
- Joins will be optimized
- Pagination will be implemented for large datasets

### User Experience
- New features will follow existing patterns
- Training documentation will be updated
- User feedback will be incorporated

## Dependencies

### External Dependencies
- None - all dependencies are already in the project

### Internal Dependencies
- Submittals depends on documents table (already exists)
- Change orders depend on projects table (already exists)
- All new features depend on existing user/project access patterns

## Timeline

- **Phase 1:** 2 weeks (foundational fixes)
- **Phase 2:** 2 weeks (core workflows)
- **Phase 3:** 1 week (document control)
- **Phase 4:** 1 week (construction-specific)
- **Phase 5:** 1 week (reporting)

**Total Estimated Time:** 7 weeks

## Notes

- This plan is locked - scope changes require explicit approval
- Implementation will proceed in phases to minimize risk
- Each phase will be tested before proceeding to the next
- User acceptance testing will be performed after each phase
