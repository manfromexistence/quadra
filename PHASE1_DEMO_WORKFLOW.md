# Phase 1 demo workflow

This file turns `TEXT.txt` into a clear phase-1 demo scope for presentations and testing.

## Goal right now

Do not build the full final EDMS process yet.

Phase 1 is only for:

- testing project configuration
- testing basic workflow efficiency
- testing document submission and return-review cycles
- preparing final documentation and data book compilation

## Demo users

Use these three roles for the dummy presentation project:

1. `Quadra Admin`
2. `Contractor DC`
3. `Client Engineer`

## Core workflow

Standard review chain:

1. Document Controller uploads documents with metadata.
2. Civil Engineer performs technical check.
3. Civil Lead performs discipline approval.
4. QA/QC Engineer performs quality compliance review.
5. PMC Civil Engineer performs consultant review.
6. Client Civil Engineer performs final review.
7. Decision is recorded:
   - `Code-1`: Approved
   - `Code-2`: Approved with Comments
   - `Code-3`: Rejected
   - `Code-4`: For Information Only
8. Document Controller issues the controlled copy.

The same structure can be reused across other disciplines.

## Phase 1 presentation scenario

1. `Quadra Admin` creates a new project.
2. `Quadra Admin` assigns project users and permission levels.
3. `Contractor DC` bulk uploads the initial document set.
4. `Contractor DC` creates the workflow.
5. `Contractor DC` sends the package through transmittal.
6. `Client Engineer` logs in and sees the new review alert.
7. `Client Engineer` reviews the submission and returns comments with an approval code.
8. `Client Engineer` can attach the CSR sheet or marked-up review file.
9. `Contractor DC` logs in, sees the returned review alert, and acknowledges the transmittal.
10. The cycle repeats until the document is approved.

## CSR requirement

- Client comments should be returned with a CSR attachment when needed.
- The CSR may remain an external Excel template in phase 1.
- The contractor can use the returned CSR to revise and resubmit.

## Expected outcome for phase 1

- A dummy project is ready for live presentation.
- Documents can be uploaded, routed, reviewed, and returned.
- Client approval codes are visible and consistent.
- Returned review files can be attached to the transmittal review step.
- The approval loop is easy to demonstrate without full second-phase automation.

## Phase 2 items to defer

- Full discipline-by-discipline production configuration
- deeper investor-ready automation
- full CSR lifecycle management inside the system
- advanced project-specific workflow templates
