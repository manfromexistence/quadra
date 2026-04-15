# Developer Experience Guidelines

Please implement these features in our wesbite:
❌ What is Missing / Needs Addition
Bulk Document Upload:
Current State: The actions/documents.ts file only has a createDocument function that processes one document at a time.
Gap: There is no bulk upload logic on the backend or frontend yet.
CSR (Comments Resolution Sheet) Attachments:
Current State: In actions/workflows.ts, the recordWorkflowDecision only accepts a text field for comments.
Gap: There is no mechanism in the database schema (document_comments or workflow_steps) to upload or attach external files like an Excel CSR during the review stage.
Approval Codes (1 to 4):
Current State: The system strictly only accepts 3 hardcoded decisions: "approve", "reject", or "comment".
Gap: There is no concept of "Approved with Comments" (Code-2) as an approval state, nor a "For Information Only" (Code-4) state. Currently, if someone uses "comment", it does not complete the workflow step—it just logs a review note.
