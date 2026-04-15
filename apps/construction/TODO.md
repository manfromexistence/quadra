# TODO

## Status

- Core EDMS modules are implemented: projects, documents, workflows, transmittals, notifications, admin users, admin analytics, and advanced search.
- Typecheck, lint, and local production build are currently passing.

## Remaining Product Gaps

- Complete browser-level end-to-end QA for the full document lifecycle across multiple real user accounts.
- Tighten visibility rules so each dashboard view only shows records appropriate to the logged-in user and project membership, not just actionability.
- Run live production verification for uploads, email delivery, and OAuth redirects.
- Add more admin/system pages if required: roles, system settings, audit-log viewer.

## Lifecycle Test Checklist

- Create project as admin or permitted project lead.
- Assign contractor, client, and subcontractor to the project with correct roles.
- Upload document as contractor.
- Create workflow with client as reviewer and optional final approver.
- Confirm client sees assigned pending review step.
- Confirm client can approve, reject, or comment.
- Confirm contractor sees resulting workflow/document updates and comments on the document detail page.
- Confirm notifications and email delivery are received for each transition.

## Build Note

- `node_modules\.bin\tsc.exe --noEmit` passes.
- `npm run lint` passes.
- `node .\node_modules\next\dist\bin\next build` passes.
- `npm run build:local` can still fail on this machine because Bun crashes internally during Next worker execution. That is a Bun runtime issue rather than an app code failure.
