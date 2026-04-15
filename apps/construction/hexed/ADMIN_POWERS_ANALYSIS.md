# ADMIN POWERS - CURRENT STATE & GAPS

## 🔍 CURRENT ADMIN CAPABILITIES

### What Admin Can Do NOW:

1. **View System Metrics** ✅
   - Total projects count
   - Total documents count
   - Total users count
   - Total notifications count
   - Location: `/dashboard/admin`

2. **View All Users** ✅
   - See user list with:
     - Name
     - Email
     - Role
     - Organization
     - Active/Inactive status
   - Location: `/dashboard/admin/users`

3. **Access Admin-Only Routes** ✅
   - Admin sidebar section visible only to admins
   - Protected routes that redirect non-admins

### What Admin CANNOT Do (CRITICAL GAPS):

1. **Edit User Roles** ❌
   - Cannot change user from "user" to "vendor"
   - Cannot promote users to "client" or "admin"
   - Cannot demote users

2. **Edit User Details** ❌
   - Cannot change user organization
   - Cannot change user job title
   - Cannot change user phone/department

3. **Deactivate/Activate Users** ❌
   - Cannot disable user accounts
   - Cannot re-enable disabled accounts

4. **Delete Users** ❌
   - Cannot remove users from system
   - No bulk delete option

5. **View User Activity** ❌
   - Cannot see what documents a user uploaded
   - Cannot see what workflows a user is involved in
   - Cannot see user login history

6. **Manage Roles & Permissions** ❌
   - No role management interface
   - Cannot customize role permissions
   - Cannot create custom roles

7. **System Settings** ❌
   - Cannot configure system-wide settings
   - Cannot set default values
   - Cannot manage email templates

8. **Analytics** ❌
   - No charts or graphs
   - No trend analysis
   - No performance metrics

---

## 🎯 WHAT NEEDS TO BE BUILT

### Priority 1: User Management (CRITICAL)

#### A. User Edit Interface
**Component:** `components/edms/admin-user-edit-sheet.tsx`

```typescript
interface UserEditSheetProps {
  userId: string;
  currentRole: string;
  currentOrganization: string | null;
  currentJobTitle: string | null;
  currentPhone: string | null;
  currentDepartment: string | null;
  isActive: boolean;
}

// Features:
- Dropdown to change role (admin, client, pmc, vendor, subcontractor, user)
- Input fields for organization, job title, phone, department
- Toggle for active/inactive status
- Delete button with confirmation dialog
- Save button that calls admin action
```

#### B. Admin Actions
**File:** `actions/admin-users.ts`

```typescript
// Required functions:

export async function updateUserRole(
  userId: string, 
  newRole: EdmsRole
): Promise<ActionResult<boolean>> {
  // 1. Check if current user is admin
  // 2. Validate new role
  // 3. Update user.role in database
  // 4. Log activity
  // 5. Send notification to user
  // 6. Revalidate paths
}

export async function updateUserDetails(
  userId: string,
  data: {
    organization?: string;
    jobTitle?: string;
    phone?: string;
    department?: string;
  }
): Promise<ActionResult<boolean>> {
  // Similar pattern
}

export async function toggleUserStatus(
  userId: string,
  isActive: boolean
): Promise<ActionResult<boolean>> {
  // Activate or deactivate user
}

export async function deleteUser(
  userId: string
): Promise<ActionResult<boolean>> {
  // Soft delete or hard delete
  // Consider: what happens to user's documents?
}

export async function bulkUpdateUserRoles(
  updates: Array<{ userId: string; role: EdmsRole }>
): Promise<ActionResult<number>> {
  // Update multiple users at once
}
```

#### C. Enhanced Admin Users Page
**File:** `app/dashboard/admin/users/page.tsx`

Add these features:
- Search bar (filter by name, email, role, organization)
- Sort by any column (click column header)
- Bulk select checkboxes
- Bulk actions dropdown (change role, activate, deactivate, delete)
- Export to CSV button
- Click row to open edit sheet
- Pagination (if many users)
- User count badge

#### D. User Detail Page (NEW)
**File:** `app/dashboard/admin/users/[userId]/page.tsx`

Show:
- User profile card with edit button
- User statistics:
  - Documents uploaded: X
  - Workflows created: X
  - Comments made: X
  - Projects member of: X
- Recent activity timeline
- List of projects (with role in each)
- List of documents uploaded
- List of workflows involved in
- Login history (last 10 logins)

---

## 🔐 SECURITY CONSIDERATIONS

### Permission Checks Required:

1. **Only Admins Can Edit Users**
   ```typescript
   const access = await requireEdmsRole("admin");
   ```

2. **Prevent Self-Demotion**
   ```typescript
   if (userId === access.id && newRole !== "admin") {
     return actionError(ErrorCode.VALIDATION_ERROR, "Cannot demote yourself");
   }
   ```

3. **Prevent Last Admin Deletion**
   ```typescript
   const adminCount = await db.select({ count: count() })
     .from(userTable)
     .where(eq(userTable.role, "admin"));
   
   if (adminCount[0].count <= 1 && userToDelete.role === "admin") {
     return actionError(ErrorCode.VALIDATION_ERROR, "Cannot delete last admin");
   }
   ```

4. **Audit All Admin Actions**
   ```typescript
   await logEdmsActivity({
     userId: access.id,
     action: "user_role_updated",
     entityType: "user",
     entityId: userId,
     description: `Changed role from ${oldRole} to ${newRole}`,
     metadata: { oldRole, newRole }
   });
   ```

---

## 📊 ADMIN ANALYTICS (Future Enhancement)

### Metrics to Track:

1. **User Metrics**
   - New users per day/week/month
   - Active users (logged in last 30 days)
   - Users by role (pie chart)
   - Users by organization (bar chart)

2. **Document Metrics**
   - Documents uploaded per day (line chart)
   - Documents by status (pie chart)
   - Documents by discipline (bar chart)
   - Average document size
   - Storage usage

3. **Workflow Metrics**
   - Workflows created per day (line chart)
   - Workflows by status (pie chart)
   - Average workflow completion time
   - Bottleneck analysis (which step takes longest)
   - Reviewer performance (average response time)

4. **Project Metrics**
   - Projects by status (pie chart)
   - Documents per project (bar chart)
   - Most active projects
   - Project timeline adherence

---

## 🎨 UI/UX DESIGN

### Admin User Edit Sheet Design:

```
┌─────────────────────────────────────────┐
│ Edit User                          [X]  │
├─────────────────────────────────────────┤
│                                         │
│ Name: John Doe                          │
│ Email: john@example.com                 │
│                                         │
│ Role: [Dropdown: Vendor ▼]              │
│                                         │
│ Organization: [ABC Construction___]     │
│                                         │
│ Job Title: [Project Manager_______]     │
│                                         │
│ Phone: [+1 234 567 8900__________]      │
│                                         │
│ Department: [Engineering__________]     │
│                                         │
│ Status: [Toggle: Active ●]              │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ ⚠️ Danger Zone                   │    │
│ │                                  │    │
│ │ [Delete User]                    │    │
│ └─────────────────────────────────┘    │
│                                         │
│              [Cancel] [Save Changes]    │
└─────────────────────────────────────────┘
```

### Admin Users Page Design:

```
┌─────────────────────────────────────────────────────────┐
│ Admin > Users                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Search users...___________] [Export CSV] [+ Add User] │
│                                                         │
│ [☐] Selected: 0  [Bulk Actions ▼]                      │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ [☐] Name ↕  Email ↕  Role ↕  Organization ↕  Status││
│ ├─────────────────────────────────────────────────────┤│
│ │ [☐] John Doe  john@ex.com  Vendor  ABC Corp  Active││
│ │ [☐] Jane Smith jane@ex.com Client  XYZ Inc  Active││
│ │ [☐] Bob Wilson bob@ex.com  Sub    Sub Co   Inactive││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Showing 1-10 of 25 users  [< 1 2 3 >]                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Create Admin Actions (Backend)
1. Create `actions/admin-users.ts`
2. Implement `updateUserRole()`
3. Implement `updateUserDetails()`
4. Implement `toggleUserStatus()`
5. Implement `deleteUser()`
6. Add proper error handling
7. Add activity logging
8. Add notifications

### Step 2: Create Edit UI (Frontend)
1. Create `components/edms/admin-user-edit-sheet.tsx`
2. Add form with react-hook-form
3. Add Zod validation
4. Connect to admin actions
5. Add loading states
6. Add success/error toasts

### Step 3: Enhance Users Page
1. Update `app/dashboard/admin/users/page.tsx`
2. Add search functionality
3. Add sort functionality
4. Add bulk select
5. Add bulk actions
6. Add export to CSV
7. Add click to edit

### Step 4: Create User Detail Page
1. Create `app/dashboard/admin/users/[userId]/page.tsx`
2. Fetch user data
3. Fetch user statistics
4. Fetch user activity
5. Display in organized layout
6. Add edit button

### Step 5: Test Everything
1. Test as admin user
2. Test as non-admin (should be blocked)
3. Test edge cases (self-demotion, last admin, etc.)
4. Test bulk operations
5. Test with large user lists
6. Test on mobile

---

## 📋 CHECKLIST FOR COMPLETION

- [ ] Admin can edit user roles
- [ ] Admin can edit user details
- [ ] Admin can activate/deactivate users
- [ ] Admin can delete users
- [ ] Admin can bulk update users
- [ ] Admin can search/filter users
- [ ] Admin can sort users
- [ ] Admin can export user list
- [ ] Admin can view user detail page
- [ ] All actions are logged
- [ ] All actions send notifications
- [ ] Security checks prevent abuse
- [ ] UI is responsive on mobile
- [ ] Error handling is robust
- [ ] Success messages are clear
- [ ] Loading states are shown
- [ ] Empty states are handled

---

## 💰 ESTIMATED EFFORT

**Time to implement all admin features:**
- Admin actions (backend): 4-6 hours
- Edit UI components: 3-4 hours
- Enhanced users page: 3-4 hours
- User detail page: 2-3 hours
- Testing & bug fixes: 2-3 hours

**Total: 14-20 hours of development**

---

## 🎯 EXPECTED OUTCOME

After implementation, admin will have:
- **Full control** over user management
- **Easy interface** to change roles
- **Bulk operations** for efficiency
- **Detailed insights** into user activity
- **Audit trail** of all changes
- **Professional UI** that matches the rest of the EDMS

This will make the EDMS **production-ready** for real construction companies.
