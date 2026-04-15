# AGENTS.md - AI Agent Instructions for QUADRA EDMS

> **For Codex-CLI, GPT-5.4, or any AI agent working on this project**

---

## 🎯 PROJECT OVERVIEW

**Project:** QUADRA Construction EDMS (Electronic Document Management System)  
**Location:** `F:/construction/`  
**Tech Stack:** Next.js 16.2.1, React 19.2.4, TypeScript 5.9.3, Drizzle ORM 0.42, PostgreSQL (Neon), Better Auth 1.5.6  
**Runtime:** Bun (preferred) or Node.js  
**Status:** 85% Complete - Core features implemented but untested, admin features needed  
**Goal:** Build the most unique, classy, and feature-complete construction EDMS

### Current State:
- ✅ **Database Schema** - Complete (users, documents, workflows, projects, transmittals, notifications)
- ✅ **Role-Based Access Control** - Complete (admin, client, pmc, vendor, subcontractor, user)
- ✅ **Document Management** - Complete (upload, version control, status tracking, PDF preview)
- ✅ **Workflow System** - Complete (multi-step approvals, approve/reject/comment)
- ✅ **Notification System** - Complete (in-app + email via Resend)
- ✅ **Project Management** - Complete (projects, members, assignments)
- ✅ **Transmittal System** - Basic implementation complete
- ❌ **Admin User Management** - Can only VIEW users, cannot edit (CRITICAL GAP)
- ❌ **User Activity Statistics** - Not implemented
- ❌ **Bulk User Operations** - Not implemented
- ❌ **System Analytics** - Not implemented
- ❌ **Advanced Search** - Basic search exists, needs enhancement

### What Works:
1. Contractor (vendor) can upload documents
2. Contractor can create workflows and assign to Client for review
3. Client can see pending workflows
4. Client can approve/reject/comment on documents
5. Contractor can see Client's comments
6. Notifications are sent at each step
7. Full audit trail in activity log

### What Doesn't Work:
1. Admin cannot edit user roles
2. Admin cannot manage user details
3. Admin cannot activate/deactivate users
4. Admin cannot delete users
5. No user activity statistics
6. No bulk user operations
7. No analytics dashboard
8. Limited search functionality

---

## 🚨 CRITICAL PRIORITY TASKS

### ✅ TASK 1: Admin User Management (DO THIS FIRST)

**Current Problem:** 
- Admin can VIEW users at `/dashboard/admin/users`
- Admin CANNOT edit user roles (cannot change "user" to "vendor", etc.)
- Admin CANNOT edit user details (organization, job title, phone, department)
- Admin CANNOT activate/deactivate users
- Admin CANNOT delete users
- No bulk operations available

**What You Must Build:**

#### 1.1 Create Admin Actions File
**File:** `actions/admin-users.ts` (NEW FILE - DOES NOT EXIST)

Required functions:
```typescript
export async function updateUserRole(input: { userId: string; role: EdmsRole }): Promise<ActionResult<boolean>>
export async function updateUserDetails(input: { userId: string; organization?: string; jobTitle?: string; phone?: string; department?: string }): Promise<ActionResult<boolean>>
export async function toggleUserStatus(input: { userId: string; isActive: boolean }): Promise<ActionResult<boolean>>
export async function deleteUser(userId: string): Promise<ActionResult<boolean>>
export async function getUserActivitySummary(userId: string): Promise<ActionResult<UserActivitySummary>>
export async function bulkUpdateUserRoles(updates: Array<{ userId: string; role: EdmsRole }>): Promise<ActionResult<number>>
```

Security requirements:
- Use `requireEdmsRole("admin")` to check permissions
- Prevent self-demotion (admin cannot demote themselves)
- Prevent last admin deletion (must have at least 1 admin)
- Prevent self-deactivation (admin cannot deactivate themselves)
- Log all actions using `logEdmsActivity()` from `lib/edms/notifications.ts`
- Use Zod schemas for input validation
- Return `ActionResult<T>` pattern (see `types/errors.ts`)

#### 1.2 Create Admin User Edit Component
**File:** `components/edms/admin-user-edit-sheet.tsx` (NEW FILE - DOES NOT EXIST)

Required features:
- Sheet/Dialog component (use Shadcn UI Sheet)
- Form with react-hook-form + Zod validation
- Role dropdown: admin, client, pmc, vendor, subcontractor, user
- Input fields: organization, job title, phone, department
- Active/Inactive toggle (Switch component)
- Delete button with AlertDialog confirmation
- Save button that calls admin actions
- Loading states with `useTransition()`
- Success/error toasts with `toast()` from `hooks/use-toast`
- Mobile responsive

#### 1.3 Update Admin Users Page
**File:** `app/dashboard/admin/users/page.tsx` (MODIFY EXISTING)

Current state: Shows user list with name, email, role, organization, status

Add these features:
- Import and use `AdminUserEditSheet` component
- Add "Edit" button to each user row
- Add search input (filter by name, email, role, organization)
- Add column sorting (click column header to sort)
- Add bulk select checkboxes
- Add bulk actions dropdown (change role, activate, deactivate, delete)
- Add "Export to CSV" button
- Add pagination if user count > 50

#### 1.4 Create User Detail Page (OPTIONAL - NICE TO HAVE)
**File:** `app/dashboard/admin/users/[userId]/page.tsx` (NEW FILE)

Show:
- User profile with edit button
- User statistics (documents uploaded, workflows created, comments made, projects)
- Recent activity timeline
- List of projects user is member of
- List of documents uploaded by user

---

## 📊 ADDITIONAL FEATURES NEEDED

### Task 2: User Activity Statistics
- Show documents uploaded count
- Show workflows created count
- Show comments made count
- Show projects member of count

### Task 3: Bulk User Operations
- Select multiple users with checkboxes
- Bulk change role
- Bulk activate/deactivate
- Bulk delete with confirmation

### Task 4: System Analytics Dashboard
**File:** `app/dashboard/admin/analytics/page.tsx` (NEW)

Charts to show:
- Documents uploaded over time (line chart)
- Workflows by status (pie chart)
- User growth over time (line chart)
- Most active users (bar chart)
- Most active projects (bar chart)

Use Recharts library (already installed).

### Task 5: Advanced Search
**File:** `app/dashboard/search/page.tsx` (ENHANCE)

Add:
- Full-text search across documents, comments, workflows
- Advanced filters (date range, file type, status, uploader)
- Save search queries
- Search history

---

## 📁 PROJECT STRUCTURE

```
construction/
├── app/
│   ├── dashboard/
│   │   ├── admin/          # Admin pages
│   │   │   ├── users/      # User management (ENHANCE THIS)
│   │   │   ├── analytics/  # Analytics (CREATE THIS)
│   │   │   └── page.tsx    # Admin dashboard
│   │   ├── documents/      # Document management
│   │   ├── workflows/      # Workflow management
│   │   ├── projects/       # Project management
│   │   └── transmittals/   # Transmittal management
│   └── api/                # API routes
├── actions/                # Server actions
│   ├── documents.ts        # ✅ Complete
│   ├── workflows.ts        # ✅ Complete
│   ├── projects.ts         # ✅ Complete
│   ├── users.ts            # ✅ Complete
│   └── admin-users.ts      # ❌ CREATE THIS
├── components/
│   ├── edms/               # EDMS components
│   │   ├── admin-user-edit-sheet.tsx  # ❌ CREATE THIS
│   │   ├── document-*.tsx  # ✅ Complete
│   │   └── workflow-*.tsx  # ✅ Complete
│   └── ui/                 # Shadcn UI components
├── lib/
│   ├── edms/               # EDMS business logic
│   │   ├── rbac.ts         # ✅ Role-based access control
│   │   ├── session.ts      # ✅ Session management
│   │   └── notifications.ts # ✅ Notification logic
│   └── shared.ts           # ✅ Shared utilities
├── db/
│   ├── schema/             # Database schemas
│   │   ├── users.ts        # ✅ User schema
│   │   ├── documents.ts    # ✅ Document schemas
│   │   ├── workflows.ts    # ✅ Workflow schemas
│   │   └── projects.ts     # ✅ Project schemas
│   └── index.ts            # ✅ Database connection
└── hexed/                  # Documentation (DO NOT MODIFY)
```

---

## 🔧 TECHNICAL REQUIREMENTS

### Code Standards
- Use TypeScript strictly (no `any` types)
- Use Zod for validation
- Use `ActionResult<T>` pattern for server actions
- Use `requireEdmsRole("admin")` for permission checks
- Log all admin actions with `logEdmsActivity()`
- Use `revalidatePath()` after data changes
- Use `useTransition()` for loading states
- Use `toast()` for user feedback

### UI Standards
- Use Shadcn UI components
- Follow existing design patterns
- Mobile-first responsive design
- Use Tailwind CSS classes
- Add loading states
- Add error states
- Add empty states

### Security
- Only admins can access admin routes
- Validate all inputs with Zod
- Prevent self-demotion
- Prevent last admin deletion
- Prevent self-deactivation
- Log all admin actions

---

## 📝 COMMANDS

### Development
```bash
npm run dev          # Start dev server
npm run db:studio    # Open database studio
npm run lint         # Run linter
npm run format       # Format code
```

### Database
```bash
npm run db:push      # Push schema to database
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
```

---

## ✅ TESTING CHECKLIST

Before marking complete:
- [ ] Admin can edit user roles
- [ ] Admin can edit user details
- [ ] Admin can activate/deactivate users
- [ ] Admin can delete users
- [ ] Cannot delete last admin
- [ ] Cannot self-demote
- [ ] Cannot self-deactivate
- [ ] All actions are logged
- [ ] UI is responsive on mobile
- [ ] No TypeScript errors
- [ ] No console errors

---

## 🚫 CRITICAL RULES

1. **Never create markdown files in root** - Only AGENTS.md and README.md allowed (DX.md is for human to write)
2. **All documentation goes in `hexed/` folder** - Never create docs in root
3. **Don't break existing features** - Test thoroughly before committing
4. **Follow existing patterns** - Look at `actions/documents.ts`, `actions/workflows.ts` for examples
5. **Use TypeScript strictly** - No `any` types, proper type inference
6. **Use Zod for validation** - All user inputs must be validated
7. **Use ActionResult pattern** - All server actions return `ActionResult<T>` (see `types/errors.ts`)
8. **Check permissions** - Use `requireEdmsRole("admin")` for admin-only actions
9. **Log all admin actions** - Use `logEdmsActivity()` for audit trail
10. **Revalidate paths** - Use `revalidatePath()` after data changes
11. **Mobile responsive** - Test on mobile devices
12. **Security first** - Always validate, never trust user input

---

## 📚 REFERENCE

Detailed documentation in `hexed/` folder:
- `hexed/AGENT.md` - Complete implementation guide
- `hexed/BRUTAL_CHECK_RESULTS.md` - Feature analysis
- `hexed/ADMIN_POWERS_ANALYSIS.md` - Admin requirements
- `hexed/DATABASE.md` - Database schema

---

## 🎯 SUCCESS CRITERIA

Complete when:
1. ✅ Admin can fully manage users (edit, activate, delete)
2. ✅ Admin can view user activity statistics
3. ✅ Admin can perform bulk operations
4. ✅ Analytics dashboard shows charts
5. ✅ All features tested and working
6. ✅ No errors in console
7. ✅ Mobile responsive
8. ✅ Client is happy

---

## 🚀 GET STARTED

1. Read this file completely
2. Read `hexed/AGENT.md` for detailed instructions
3. Start with Task 1 (Admin user management)
4. Create `actions/admin-users.ts`
5. Create `components/edms/admin-user-edit-sheet.tsx`
6. Update `app/dashboard/admin/users/page.tsx`
7. Test thoroughly
8. Move to next task

**Let's build the best EDMS! 🎨✨**
