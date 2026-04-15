# QUADRA - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Created new QUADRA landing page as the default homepage
- Copied and customized all home components for EDMS branding
- Created components/edms-home/ directory with EDMS-specific landing components:
  - Hero section highlighting document management for construction
  - Features showcasing document control, workflows, transmittals, etc.
  - How It Works section with EDMS workflow steps
  - Testimonials from construction professionals
  - FAQ section with EDMS-specific questions
  - CTA section for getting started
- Moved original edms landing page to /edms route
- Updated header navigation for QUADRA (Features, How It Works, Testimonials, FAQ)
- Updated footer with QUADRA branding and relevant links
- Changed primary CTA from "Try It Now" to "Get Started" linking to /dashboard
- Removed GitHub stars and social links from header
- Updated logo text from "edms" to "QUADRA"
- Created TODO.md to track development progress
- Created CHANGELOG.md to track project history
- Initialized project transformation from theme manager to EDMS
- Added a protected EDMS dashboard shell at `/dashboard`
- Added dashboard routes for projects, documents, workflows, transmittals, and notifications
- Added project creation and project detail flows inside `/dashboard/projects`
- Added project member assignment with per-project role selection on project detail pages
- Added document registration and filtered document control views inside `/dashboard/documents`
- Added workflow creation, step decision handling, and sequential review routing inside `/dashboard/workflows`
- Added transmittal creation, document attachment, recipient acknowledgement, and operational controls inside `/dashboard/transmittals`
- Added account profile editing for EDMS role, organization, job title, department, and phone fields in `/settings/account`
- Added actionable notification inbox controls to mark single alerts or the full inbox as read
- Added document detail pages with metadata, preview, version history, workflow summary, and comment history
- Added automatic document numbering fallback and revision issuance for controlled documents
- Added shared EDMS notification and activity logging services with Resend-backed outbound delivery
- Added direct document upload infrastructure through `/api/edms/uploads` with Vercel Blob support and controlled URL fallback
- Added database migration generation and live Neon migration execution for the EDMS schema
- Added a dedicated `/dashboard/search` page for cross-module EDMS retrieval
- Added shared EDMS widgets for project watchlists, document control, workflow queues, transmittals, notifications, and audit activity
- Added server-side dashboard data loading with safe fallback sample data while migrations are pending
- Created comprehensive database schema for EDMS:
  - Projects table with client and member management
  - Documents table with version control and metadata
  - Document versions tracking
  - Document comments and reviews
  - Workflow management tables
  - Transmittals module tables
  - Notifications and activity log tables
- Extended user table with EDMS-specific fields (role, organization, job title, etc.)
- Created modular schema structure in `db/schema/`

### Changed
- Project name: `edms-next` -> `construction-edms`
- Project description: Theme customization tool -> Electronic Document Management System
- Target users: Construction companies, PMC consultants, vendors, subcontractors
- Updated README.md with QUADRA information
- Updated package.json with new project details
- Replaced the legacy `/dashboard` redirect with the first QUADRA operations dashboard
- Turned the projects area into the first working core module with create/list/detail behavior and automatic creator assignment
- Expanded the projects module with live team assignment and role updates, and expanded document control with creation and filterable listings
- Turned the workflows area from a placeholder queue into an actionable review surface with create, approve, reject, and comment flows
- Turned the transmittals area from a placeholder queue into an actionable issue-and-acknowledgement module tied to project documents
- Expanded the account and notification surfaces so user profile data and in-app inbox state can now be managed from the UI
- Expanded document control from a flat register into a navigable detail experience with preview and history visibility
- Expanded document control with server-side numbering generation and new version issuance against existing records
- Expanded document create and revision sheets to support direct uploads while preserving an external URL fallback path
- Expanded workflow, document, and transmittal actions so they now write audit activity and trigger in-app/email notifications
- Expanded document control search to cover number, title, project, and revision filters, and moved dashboard onboarding checks into the route proxy
- Expanded the UI so notification cards can open related records directly and create actions only appear for roles that can use them
- Adjusted Biome file discovery to ignore generated `public/` artifacts so lint remains stable after production builds
- Restored a clean TypeScript baseline by fixing schema relation typing, Figma icon imports, and the stale Tiptap expectation comment

### Retained
- Authentication system (Google/GitHub OAuth + Better Auth)
- Database infrastructure (Neon PostgreSQL + Drizzle ORM)
- UI components (shadcn-ui)
- Theme system for UI customization
- Next.js 16.2.1 with Turbopack
- Biome for linting and formatting

---

## [0.1.0] - 2026-04-01

### Fixed
- All TypeScript errors resolved
- ColorPicker hydration mismatch fixed
- SearchParams null safety issues fixed
- Post-login action type safety issues fixed
- Debounce type compatibility across multiple files
- Tiptap mention suggestion types fixed
- AI provider v3 compatibility (switched to Groq)
- Build configuration with heap size increase
- Excluded integrations folder from TypeScript checks

### Added
- `POLAR_WEBHOOK_SECRET` environment variable
- Production build successful
- All changes committed and pushed to GitHub

### Technical Details
- Next.js: 16.2.1
- React: 19.0.0
- TypeScript: 5.x
- Database: PostgreSQL (Neon)
- ORM: Drizzle
- UI: shadcn-ui + Tailwind CSS
- Auth: Better Auth
- AI: Groq (Llama 3.3 70B)

---

## Project History (Pre-EDMS)

### Theme Manager Era
The project started as a theme customization tool for shadcn-ui components, featuring:
- Real-time theme preview
- AI-powered theme generation
- Community theme sharing
- Theme export functionality
- Color palette management
- Typography customization

This foundation provides:
- Robust authentication system
- Database infrastructure
- Modern UI component library
- Theme and styling system
- File management capabilities

---

**Note:** This changelog will be updated as we progress through the EDMS development phases.
