# EDMS Setup Guide

## Quick Start for Project and Document Creation

To enable project and document creation in your EDMS dashboard, you need to configure file storage.

### Required Environment Variables

1. **Copy environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure ImgBB for file storage:**
   - Go to [ImgBB API](https://api.imgbb.com/)
   - Create a free account
   - Get your API key
   - Add to `.env.local`:
   ```
   IMGBB=your_imgbb_api_key_here
   ```

### Database Setup

Make sure your database is properly configured and migrations are applied:

```bash
cd apps/dashboard
bun run db:push
```

### Seed Sample Data (Optional)

To add sample projects and documents for testing:

```bash
cd apps/dashboard
bun run apps/dashboard/src/db/scripts/seed-edms.ts
```

### Test the Setup

1. **Create a Project:**
   - Go to `/projects`
   - Click "Create project" (admin users only)
   - Fill in project details
   - Upload project images (optional)

2. **Create a Document:**
   - Go to `/documents/new`
   - Select a project
   - Fill in document details
   - Upload a file (PDF, DOC, XLS, etc.)

### Troubleshooting

**"ImgBB is not configured" error:**
- Make sure `IMGBB` environment variable is set in `.env.local`
- Restart your development server after adding the variable

**"No projects available" error:**
- Create a project first using the project creation form
- Make sure you have admin role to create projects

**Database errors:**
- Run `bun run db:push` to apply migrations
- Check your database connection in `.env.local`

### File Upload Limits

- **Images**: 10MB max (JPEG, PNG, GIF, WebP)
- **Documents**: 50MB max (PDF, DWG, DOC, DOCX, XLS, XLSX)
- **Project images**: Up to 5 images per project

### Admin Access

Only users with `admin` role can:
- Create new projects
- Upload documents
- Manage project settings

Make sure your user account has the correct role in the database.