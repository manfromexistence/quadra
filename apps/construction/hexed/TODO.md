# QUADRA Fixes TODO

> Auto-managed by AI. Updated after every completed or failed task.

## In Progress

- [ ] 1. Add IMGBB to Vercel environment variables (Catbox needs no config!)
- [ ] 2. Test file upload integration with Catbox (no API key needed!)
- [ ] 3. Test avatar upload with ImgBB

## Pending

- [ ] 4. Verify live Resend sender configuration with `RESEND_FROM_EMAIL`
- [ ] 5. Verify database schema and migrations in the live environment
- [ ] 6. Run comprehensive EDMS feature tests against production auth, onboarding, create, search, workflow, and transmittal flows

## Completed

- [x] ~~Comment out Google and GitHub OAuth buttons from auth panel~~ ✅ (completed: 2026-04-02)
- [x] ~~Replace Vercel Blob with Catbox (unlimited, 200MB, no API key!) for documents~~ ✅ (completed: 2026-04-02)
- [x] ~~Add ImgBB integration for user avatars and images~~ ✅ (completed: 2026-04-02)
- [x] Fix avatar 404 errors by restoring placeholder avatar assets
- [x] Fix project creation sheet padding
- [x] Create admin dashboard and admin users management pages
- [x] Replace the fragile modal-first auth entry with a stable `/auth` experience and improve email/password onboarding flow
- [x] Add password reset flow with Better Auth reset tokens and Resend email delivery
- [x] Align settings and dashboard theme navigation with Theme Studio and Theme Library
- [x] Fix stale production auth URL environment variables and redeploy the live app
- [x] Redirect legacy `/tweakcn` branding traffic back to the QUADRA home page
- [x] Rebuild and verify the application with `npx tsc --noEmit`, `npm run lint`, and `npm run build`

## Blocked / Failed
