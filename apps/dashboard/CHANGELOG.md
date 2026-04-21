# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Moved sidebar-app authentication enforcement to the server layout and removed the duplicate client-side `authClient.getSession()` redirect check that was sending valid sign-ins back to `/login`.
- Switched the root `/` redirect to validate the Better Auth session instead of trusting the presence of a session cookie.
- Updated the shared avatar image wrapper to default avatar and team-logo images to `unoptimized`, which avoids custom-loader width warnings for remote user images.
- Standardized EDMS session reads on a request-aware Better Auth helper that loads Next request headers dynamically, so server pages and actions use the same authenticated request context after sign-in.
- Changed post-login navigation to a hard browser redirect instead of `router.push()` plus `router.refresh()`, removing duplicate `/` requests during session establishment.

### Fixed
- Stopped the post-login `/projects` to `/login` loop caused by the dashboard shell performing a second, race-prone client session check after the server had already admitted the user.
- Removed GitHub placeholder avatar URLs from user/team menu flows and mock account data so missing avatars fall back to initials instead of noisy remote placeholders.
- Cleared the remaining EDMS session helper placeholder avatar fallback so avatar warnings are not reintroduced by server-side defaults.
- Fixed EDMS server helpers that were reading Better Auth sessions without request headers and then treating any failure as “go to login,” which could bounce authenticated users back to the login page.

### Removed
