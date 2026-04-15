# AGENT INSTRUCTIONS FOR CONSTRUCTION EDMS COMPLETION
## For Codex-CLI or Advanced AI Agent

---

## 🎯 PROJECT OVERVIEW

**Project Name:** QUADRA Construction EDMS (Electronic Document Management System)  
**Location:** `/f:/construction/`  
**Tech Stack:** Next.js 16.2.1, React 19, TypeScript 5.9, Drizzle ORM 0.42, PostgreSQL (Neon), Better Auth 1.5  
**Runtime:** Bun (preferred) or Node.js  
**Current Status:** 85% Complete - Core features implemented but untested  
**Goal:** Make this the most unique, classy, and feature-complete construction EDMS

### Key Dependencies:
- **UI:** Shadcn UI, Radix UI, Tailwind CSS 4.2
- **Forms:** React Hook Form 7.72, Zod 3.25
- **Database:** Drizzle ORM, @neondatabase/serverless
- **Auth:** Better Auth with GitHub/Google OAuth
- **AI:** Google Generative AI, Groq
- **File Storage:** ImgBB (images), Vercel Blob (documents)
- **Email:** Resend
- **Styling:** Tailwind CSS, Motion (animations)

### Project Structure:
```
construction/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main EDMS dashboard
│   │   ├── admin/          # Admin pages (users, settings)
│   │   ├── documents/      # Document management
│   │   ├── workflows/      # Workflow management
│   │   ├── projects/       # Project management
│   │   ├── transmittals/   # Transmittal management
│   │   └── notifications/  # Notification center
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   └── settings/           # User settings
├── actions/                # Server actions (backend logic)
│   ├── documents.ts        # Document CRUD
│   ├── workflows.ts        # Workflow CRUD
│   ├── projects.ts         # Project CRUD
│   ├── users.ts            # User profile updates
│   └── [MISSING] admin-users.ts  # Admin user management
├── components/             # React components
│   ├── edms/               # EDMS-specific components
│   │   ├── document-*.tsx  # Document components
│   │   ├── workflow-*.tsx  # Workflow components
│   │   └── [MISSING] admin-user-edit-sheet.tsx
│   └── ui/                 # Shadcn UI components
├── lib/                    # Utility libraries
│   ├── edms/               # EDMS business logic
│   │   ├── rbac.ts         # Role-based access control
│   │   ├── session.ts      # Session management
│   │   ├── dashboard.ts    # Dashboard data fetching
│   │   ├── documents.ts    # Document utilities
│   │   ├── workflows.ts    # Workflow utilities
│   │   └── notifications.ts # Notification logic
│   ├── auth.ts             # Better Auth configuration
│   └── shared.ts           # Shared utilities
├── db/                     # Database schema
│   ├── schema/             # Drizzle schemas
│   │   ├── users.ts        # User schema
│   │   ├── documents.ts    # Document schemas
│   │   ├── workflows.ts    # Workflow schemas
│   │   ├── projects.ts     # Project schemas
│   │   └── notifications.ts # Notification schema
│   └── index.ts            # Database connection
├── drizzle/                # Database migrations
│   └── 0005_great_roughhouse.sql  # Latest migration (EDMS tables)
├── types/                  # TypeScript types
├── hooks/                  # React hooks
├── store/                  # Zustand stores
├── hexed/                  # Documentation & analysis files
└── public/                 # Static assets
```

---

## 🚨 CRITICAL PRIORITY TASKS (DO THESE FIRST)

### Task 1: Admin User Management (HIGHEST PRIORITY)

**Problem:** Admin can only VIEW users, cannot edit roles or manage users.

**What You Must Build:**

#### 1.1 Create Admin Actions File
**File:** `actions/admin-users.ts` (NEW FILE)

```typescript
"use server";

import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { requireEdmsRole, type EdmsRole, EDMS_ROLE_ORDER } from "@/lib/edms/rbac";
import { logEdmsActivity } from "@/lib/edms/notifications";
import { logError } from "@/lib/shared";
import { type ActionResult, actionError, actionSuccess, ErrorCode } from "@/types/errors";

const userRoles = ["admin", "client", "pmc", "vendor", "subcontractor", "user"] as const;

const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(userRoles),
});

const updateUserDetailsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  organization: z.string().trim().max(255).optional(),
  jobTitle: z.string().trim().max(255).optional(),
  phone: z.string().trim().max(50).optional(),
  department: z.string().trim().max(255).optional(),
});

const toggleUserStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  isActive: z.boolean(),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserDetailsInput = z.infer<typeof updateUserDetailsSchema>;
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;

export async function updateUserRole(input: UpdateUserRoleInput): Promise<ActionResult<boolean>> {
  try {
    const validation = updateUserRoleSchema.safeParse(input);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid input";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("admin");
    const { userId, role } = validation.data;

    // Prevent self-demotion
    if (userId === access.id && role !== "admin") {
      return actionError(ErrorCode.VALIDATION_ERROR, "Cannot demote yourself from admin role");
    }

    // Get current user data
    const [currentUser] = await db
      .select({ role: userTable.role, name: userTable.name })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (!currentUser) {
      return actionError(ErrorCode.VALIDATION_ERROR, "User not found");
    }

    const oldRole = currentUser.role ?? "user";

    // Prevent deleting last admin
    if (oldRole === "admin" && role !== "admin") {
      const [adminCount] = await db
        .select({ count: count() })
        .from(userTable)
        .where(eq(userTable.role, "admin"));

      if ((adminCount?.count ?? 0) <= 1) {
        return actionError(ErrorCode.VALIDATION_ERROR, "Cannot demote the last admin user");
      }
    }

    // Update role
    await db
      .update(userTable)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId));

    // Log activity
    await logEdmsActivity({
      userId: access.id,
      action: "user_role_updated",
      entityType: "user",
      entityId: userId,
      entityName: currentUser.name ?? "Unknown User",
      description: `Changed user role from ${oldRole} to ${role}`,
      metadata: { oldRole, newRole: role },
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${userId}`);

    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "updateUserRole", input });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to update user role");
  }
}

export async function updateUserDetails(input: UpdateUserDetailsInput): Promise<ActionResult<boolean>> {
  try {
    const validation = updateUserDetailsSchema.safeParse(input);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid input";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("admin");
    const { userId, ...updates } = validation.data;

    await db
      .update(userTable)
      .set({
        organization: updates.organization || null,
        jobTitle: updates.jobTitle || null,
        phone: updates.phone || null,
        department: updates.department || null,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId));

    await logEdmsActivity({
      userId: access.id,
      action: "user_details_updated",
      entityType: "user",
      entityId: userId,
      description: "Updated user details",
      metadata: updates,
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${userId}`);

    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "updateUserDetails", input });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to update user details");
  }
}

export async function toggleUserStatus(input: ToggleUserStatusInput): Promise<ActionResult<boolean>> {
  try {
    const validation = toggleUserStatusSchema.safeParse(input);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Invalid input";
      return actionError(ErrorCode.VALIDATION_ERROR, firstError);
    }

    const access = await requireEdmsRole("admin");
    const { userId, isActive } = validation.data;

    // Prevent self-deactivation
    if (userId === access.id && !isActive) {
      return actionError(ErrorCode.VALIDATION_ERROR, "Cannot deactivate your own account");
    }

    await db
      .update(userTable)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId));

    await logEdmsActivity({
      userId: access.id,
      action: isActive ? "user_activated" : "user_deactivated",
      entityType: "user",
      entityId: userId,
      description: `User ${isActive ? "activated" : "deactivated"}`,
    });

    revalidatePath("/dashboard/admin/users");
    revalidatePath(`/dashboard/admin/users/${userId}`);

    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "toggleUserStatus", input });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to toggle user status");
  }
}

export async function deleteUser(userId: string): Promise<ActionResult<boolean>> {
  try {
    const access = await requireEdmsRole("admin");

    // Prevent self-deletion
    if (userId === access.id) {
      return actionError(ErrorCode.VALIDATION_ERROR, "Cannot delete your own account");
    }

    // Get user data
    const [user] = await db
      .select({ role: userTable.role, name: userTable.name })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (!user) {
      return actionError(ErrorCode.VALIDATION_ERROR, "User not found");
    }

    // Prevent deleting last admin
    if (user.role === "admin") {
      const [adminCount] = await db
        .select({ count: count() })
        .from(userTable)
        .where(eq(userTable.role, "admin"));

      if ((adminCount?.count ?? 0) <= 1) {
        return actionError(ErrorCode.VALIDATION_ERROR, "Cannot delete the last admin user");
      }
    }

    // Delete user (cascade will handle related records)
    await db.delete(userTable).where(eq(userTable.id, userId));

    await logEdmsActivity({
      userId: access.id,
      action: "user_deleted",
      entityType: "user",
      entityId: userId,
      entityName: user.name ?? "Unknown User",
      description: `Deleted user account`,
    });

    revalidatePath("/dashboard/admin/users");

    return actionSuccess(true);
  } catch (error) {
    logError(error as Error, { action: "deleteUser", userId });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to delete user");
  }
}

export async function getUserActivitySummary(userId: string) {
  try {
    const access = await requireEdmsRole("admin");

    // Import schemas
    const { documents } = await import("@/db/schema/documents");
    const { documentWorkflows } = await import("@/db/schema/workflows");
    const { documentComments } = await import("@/db/schema/documents");
    const { projectMembers } = await import("@/db/schema/projects");

    const [documentsCount, workflowsCount, commentsCount, projectsCount] = await Promise.all([
      db.select({ count: count() }).from(documents).where(eq(documents.uploadedBy, userId)),
      db.select({ count: count() }).from(documentWorkflows).where(eq(documentWorkflows.createdBy, userId)),
      db.select({ count: count() }).from(documentComments).where(eq(documentComments.userId, userId)),
      db.select({ count: count() }).from(projectMembers).where(eq(projectMembers.userId, userId)),
    ]);

    return actionSuccess({
      documentsUploaded: documentsCount[0]?.count ?? 0,
      workflowsCreated: workflowsCount[0]?.count ?? 0,
      commentsMade: commentsCount[0]?.count ?? 0,
      projectsMemberOf: projectsCount[0]?.count ?? 0,
    });
  } catch (error) {
    logError(error as Error, { action: "getUserActivitySummary", userId });
    return actionError(ErrorCode.UNKNOWN_ERROR, "Failed to fetch user activity");
  }
}
```

#### 1.2 Create Admin User Edit Component
**File:** `components/edms/admin-user-edit-sheet.tsx` (NEW FILE)

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateUserRole, updateUserDetails, toggleUserStatus, deleteUser } from "@/actions/admin-users";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Switch } from "../ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

const userRoles = ["admin", "client", "pmc", "vendor", "subcontractor", "user"] as const;

const userEditSchema = z.object({
  role: z.enum(userRoles),
  organization: z.string().trim(),
  jobTitle: z.string().trim(),
  phone: z.string().trim(),
  department: z.string().trim(),
  isActive: z.boolean(),
});

type UserEditValues = z.infer<typeof userEditSchema>;

interface AdminUserEditSheetProps {
  userId: string;
  userName: string;
  userEmail: string;
  currentRole: string;
  currentOrganization: string | null;
  currentJobTitle: string | null;
  currentPhone: string | null;
  currentDepartment: string | null;
  isActive: boolean;
}

export function AdminUserEditSheet({
  userId,
  userName,
  userEmail,
  currentRole,
  currentOrganization,
  currentJobTitle,
  currentPhone,
  currentDepartment,
  isActive,
}: AdminUserEditSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<UserEditValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      role: (currentRole as typeof userRoles[number]) || "user",
      organization: currentOrganization || "",
      jobTitle: currentJobTitle || "",
      phone: currentPhone || "",
      department: currentDepartment || "",
      isActive,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        role: (currentRole as typeof userRoles[number]) || "user",
        organization: currentOrganization || "",
        jobTitle: currentJobTitle || "",
        phone: currentPhone || "",
        department: currentDepartment || "",
        isActive,
      });
    }
  }, [form, isOpen, currentRole, currentOrganization, currentJobTitle, currentPhone, currentDepartment, isActive]);

  const onSubmit = (values: UserEditValues) => {
    startTransition(async () => {
      // Update role if changed
      if (values.role !== currentRole) {
        const roleResult = await updateUserRole({ userId, role: values.role });
        if (!roleResult.success) {
          toast({
            title: "Failed to update role",
            description: roleResult.error.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Update details
      const detailsResult = await updateUserDetails({
        userId,
        organization: values.organization,
        jobTitle: values.jobTitle,
        phone: values.phone,
        department: values.department,
      });

      if (!detailsResult.success) {
        toast({
          title: "Failed to update details",
          description: detailsResult.error.message,
          variant: "destructive",
        });
        return;
      }

      // Update status if changed
      if (values.isActive !== isActive) {
        const statusResult = await toggleUserStatus({ userId, isActive: values.isActive });
        if (!statusResult.success) {
          toast({
            title: "Failed to update status",
            description: statusResult.error.message,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "User updated",
        description: "User details have been updated successfully",
      });

      setIsOpen(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteUser(userId);

      if (!result.success) {
        toast({
          title: "Failed to delete user",
          description: result.error.message,
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }

      toast({
        title: "User deleted",
        description: "User account has been permanently deleted",
      });

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <UserCog className="size-4" />
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-1">
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            {userName} ({userEmail})
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      <SelectItem value="vendor">Vendor (Contractor)</SelectItem>
                      <SelectItem value="pmc">PMC</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>User's access level in the system</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC Construction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Project Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>User can log in and access the system</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <h3 className="mb-2 font-semibold text-destructive">Danger Zone</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Permanently delete this user account. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="sm" disabled={isPending || isDeleting}>
                    <Trash2 className="size-4" />
                    Delete User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {userName}'s account and remove all associated data. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      {isDeleting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete User"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-end gap-3 border-t pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isDeleting}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <UserCog className="size-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
```

#### 1.3 Update Admin Users Page
**File:** `app/dashboard/admin/users/page.tsx` (MODIFY EXISTING)

Add the edit button to each user row:

```typescript
import { AdminUserEditSheet } from "@/components/edms/admin-user-edit-sheet";

// In the user list rendering:
<div className="flex items-center gap-2">
  <AdminUserEditSheet
    userId={user.id}
    userName={user.name}
    userEmail={user.email}
    currentRole={user.role ?? "user"}
    currentOrganization={user.organization}
    currentJobTitle={user.jobTitle}
    currentPhone={user.phone}
    currentDepartment={user.department}
    isActive={user.isActive ?? true}
  />
</div>
```

---

## 📋 CURRENT STATE ANALYSIS

### ✅ What's Already Built (DO NOT REBUILD)

1. **Database Schema** - Complete
   - Users with roles (admin, client, pmc, vendor, subcontractor, user)
   - Projects with members
   - Documents with versions
   - Workflows with multi-step approvals
   - Comments and notifications
   - Activity logging

2. **Role-Based Access Control (RBAC)** - Complete
   - Role hierarchy enforcement
   - Permission checks
   - Route protection

3. **Document Management** - Complete
   - Upload documents
   - Version control
   - Status tracking (draft → submitted → under_review → approved/rejected)
   - PDF preview
   - Image attachments (ImgBB integration)

4. **Workflow System** - Complete
   - Create review workflows
   - Assign reviewers
   - Approve/Reject/Comment
   - Multi-step approvals
   - Automatic status updates

5. **Notification System** - Complete
   - In-app notifications
   - Email notifications (Resend)
   - User preferences

6. **UI Components** - Complete
   - Shadcn UI components
   - Responsive design
   - Dark/light theme
   - Professional styling

---

## ❌ CRITICAL GAPS TO FIX

### 1. ADMIN USER MANAGEMENT (HIGHEST PRIORITY)

**Current State:**
- Admin can VIEW users at `/dashboard/admin/users`
- Admin CANNOT edit user roles or access levels
- No UI to change user roles
- No bulk user management

**What You Must Build:**

#### A. User Edit Dialog/Sheet
**Location:** `components/edms/admin-user-edit-sheet.tsx`

```typescript
// Features Required:
- Edit user role (dropdown: admin, client, pmc, vendor, subcontractor, user)
- Edit organization
- Edit job title
- Edit phone
- Edit department
- Toggle user active/inactive status
- Delete user (with confirmation)
- View user's projects
- View user's documents
- View user's activity log
```

#### B. Admin User Management Actions
**Location:** `actions/admin-users.ts`

```typescript
// Required Functions:
export async function updateUserRole(userId: string, role: EdmsRole): Promise<ActionResult<boolean>>
export async function updateUserDetails(userId: string, data: UserUpdateInput): Promise<ActionResult<boolean>>
export async function toggleUserStatus(userId: string, isActive: boolean): Promise<ActionResult<boolean>>
export async function deleteUser(userId: string): Promise<ActionResult<boolean>>
export async function bulkUpdateUserRoles(updates: Array<{userId: string, role: EdmsRole}>): Promise<ActionResult<boolean>>
export async function getUserActivitySummary(userId: string): Promise<ActionResult<UserActivitySummary>>
```

#### C. Enhanced Admin Users Page
**Location:** `app/dashboard/admin/users/page.tsx`

```typescript
// Add These Features:
- Search/filter users by name, email, role, organization
- Sort by any column
- Bulk select users
- Bulk actions (change role, activate/deactivate, delete)
- Export users to CSV
- User statistics (documents uploaded, workflows completed, etc.)
- Last login timestamp
- Click user row to open edit sheet
```

#### D. Admin User Detail Page
**Location:** `app/dashboard/admin/users/[userId]/page.tsx` (NEW)

```typescript
// Show:
- User profile with edit button
- User's projects (with role in each project)
- User's uploaded documents
- User's workflow activity
- User's comments
- User's notifications
- Activity timeline
- Login history
```

---

### 2. ADVANCED ADMIN FEATURES

#### A. Role Management System
**Location:** `app/dashboard/admin/roles/page.tsx` (NEW)

```typescript
// Features:
- View all roles and their permissions
- Create custom roles (future-proof)
- Edit role permissions
- Assign default permissions per role
- Role hierarchy visualization
```

#### B. System Settings
**Location:** `app/dashboard/admin/settings/page.tsx` (NEW)

```typescript
// Settings to Add:
- Default document statuses (customizable)
- Default workflow templates
- Email notification templates
- File upload limits
- Allowed file types
- Document retention policies
- Audit log retention
- System-wide announcements
```

#### C. Analytics Dashboard
**Location:** `app/dashboard/admin/analytics/page.tsx` (NEW)

```typescript
// Metrics to Show:
- Documents uploaded per day/week/month (chart)
- Workflows completed vs pending (chart)
- Average review time per role
- Most active users
- Most active projects
- Document approval rate
- Rejection reasons (from comments)
- User growth over time
- Storage usage
```

---

### 3. ENHANCED DOCUMENT FEATURES

#### A. Document Templates
**Location:** `app/dashboard/documents/templates/page.tsx` (NEW)

```typescript
// Features:
- Create document templates with pre-filled metadata
- Template categories (RFI, Submittal, Drawing, Specification, etc.)
- Template variables (project name, date, etc.)
- Quick create from template
```

#### B. Document Comparison
**Location:** `components/edms/document-compare-dialog.tsx` (NEW)

```typescript
// Features:
- Compare two versions of a document
- Highlight changes (if PDF)
- Side-by-side view
- Download comparison report
```

#### C. Document Linking
**Location:** Add to existing document detail page

```typescript
// Features:
- Link related documents
- Show document relationships (parent/child, supersedes, references)
- Visual relationship graph
```

#### D. Advanced Search
**Location:** `app/dashboard/search/page.tsx` (ENHANCE)

```typescript
// Add:
- Full-text search in document content (if possible)
- Search in comments
- Search in workflow notes
- Advanced filters (date range, file type, size, uploader, status)
- Save search queries
- Search history
```

---

### 4. WORKFLOW ENHANCEMENTS

#### A. Workflow Templates
**Location:** `app/dashboard/workflows/templates/page.tsx` (NEW)

```typescript
// Features:
- Create reusable workflow templates
- Template with multiple steps
- Default reviewers per role
- Default due dates (e.g., 3 days for review, 5 days for approval)
- Quick create workflow from template
```

#### B. Workflow Analytics
**Location:** Add to workflows page

```typescript
// Show:
- Average time per workflow step
- Bottlenecks (which step takes longest)
- Reviewer performance (average response time)
- Workflow completion rate
```

#### C. Workflow Reminders
**Location:** `lib/edms/workflow-reminders.ts` (NEW)

```typescript
// Features:
- Automatic reminders for overdue workflow steps
- Escalation (notify supervisor if no response in X days)
- Daily digest of pending workflows
```

#### D. Parallel Workflows
**Location:** Enhance existing workflow system

```typescript
// Features:
- Allow multiple reviewers at the same step (all must approve)
- Conditional workflows (if rejected, route to different person)
- Optional steps (can be skipped)
```

---

### 5. PROJECT ENHANCEMENTS

#### A. Project Dashboard
**Location:** `app/dashboard/projects/[projectId]/page.tsx` (ENHANCE)

```typescript
// Add:
- Project timeline (Gantt chart or timeline view)
- Project milestones
- Document submission schedule
- Workflow status overview
- Project team directory with contact info
- Project announcements
- Project files (non-controlled documents)
```

#### B. Project Templates
**Location:** `app/dashboard/projects/templates/page.tsx` (NEW)

```typescript
// Features:
- Create project templates with default members
- Template with default document categories
- Template with default workflow templates
- Quick create project from template
```

#### C. Project Reports
**Location:** `app/dashboard/projects/[projectId]/reports/page.tsx` (NEW)

```typescript
// Reports:
- Document register (all documents in project)
- Workflow status report
- Submittal log
- RFI log
- Transmittal log
- Project activity report
- Export to PDF/Excel
```

---

### 6. TRANSMITTAL ENHANCEMENTS

**Current State:** Basic transmittal system exists but minimal features

#### A. Enhanced Transmittal Creation
**Location:** Enhance existing transmittal components

```typescript
// Add:
- Attach multiple documents
- Add cover letter/notes
- Select recipients (multiple)
- Request acknowledgement
- Set response due date
- Add custom fields
```

#### B. Transmittal Tracking
**Location:** `app/dashboard/transmittals/[transmittalId]/page.tsx` (NEW)

```typescript
// Show:
- Transmittal details
- Attached documents
- Recipients and acknowledgement status
- Response history
- Download transmittal package (ZIP)
- Print transmittal cover sheet
```

---

### 7. COLLABORATION FEATURES

#### A. Real-time Notifications
**Location:** Enhance existing notification system

```typescript
// Add:
- WebSocket for real-time updates
- Toast notifications for new comments
- Badge count on sidebar
- Sound notifications (optional)
```

#### B. @Mentions in Comments
**Location:** Enhance comment system

```typescript
// Features:
- @mention users in comments
- Notify mentioned users
- Autocomplete user names
```

#### C. Document Discussion Threads
**Location:** Add to document detail page

```typescript
// Features:
- Threaded comments (reply to comments)
- Mark comments as resolved
- Filter comments (all, unresolved, mine)
```

---

### 8. MOBILE RESPONSIVENESS

**Current State:** Responsive but not optimized for mobile

#### Tasks:
- Test all pages on mobile devices
- Add mobile-specific navigation (bottom nav bar)
- Optimize tables for mobile (card view)
- Add swipe gestures for actions
- Mobile-friendly file upload
- Mobile document viewer

---

### 9. SECURITY ENHANCEMENTS

#### A. Audit Log Viewer
**Location:** `app/dashboard/admin/audit-log/page.tsx` (NEW)

```typescript
// Features:
- View all system activity
- Filter by user, action, entity type, date range
- Export audit log
- Highlight security events (failed logins, permission changes)
```

#### B. Two-Factor Authentication
**Location:** Integrate with Better Auth

```typescript
// Add:
- Enable 2FA for users
- QR code for authenticator apps
- Backup codes
- Force 2FA for admin users
```

#### C. Session Management
**Location:** `app/settings/security/page.tsx` (NEW)

```typescript
// Features:
- View active sessions
- Revoke sessions
- Session timeout settings
- Login history
```

---

### 10. UNIQUE & CLASSY FEATURES

#### A. AI-Powered Features
**Location:** Various

```typescript
// Ideas:
- AI document summarization (using existing Google AI)
- AI-suggested reviewers based on document type
- AI-generated document descriptions
- AI-powered search (semantic search)
- AI comment sentiment analysis
- AI workflow optimization suggestions
```

#### B. Document OCR
**Location:** `lib/edms/ocr.ts` (NEW)

```typescript
// Features:
- Extract text from scanned PDFs
- Make documents searchable
- Auto-fill metadata from document content
```

#### C. Digital Signatures
**Location:** `components/edms/document-signature.tsx` (NEW)

```typescript
// Features:
- Sign documents digitally
- Signature verification
- Signature audit trail
- Multiple signers
```

#### D. Document Watermarking
**Location:** `lib/edms/watermark.ts` (NEW)

```typescript
// Features:
- Add watermarks to documents (DRAFT, APPROVED, CONFIDENTIAL)
- Custom watermarks per project
- Automatic watermarking based on status
```

#### E. QR Code Generation
**Location:** Add to document detail page

```typescript
// Features:
- Generate QR code for each document
- QR code links to document detail page
- Print QR code labels
- Scan QR code to view document on mobile
```

#### F. Document Expiry & Retention
**Location:** Add to document schema and management

```typescript
// Features:
- Set document expiry dates
- Automatic archival of expired documents
- Retention policies per document type
- Automatic deletion after retention period
```

#### G. Custom Branding
**Location:** `app/dashboard/admin/branding/page.tsx` (NEW)

```typescript
// Features:
- Upload company logo
- Custom color scheme
- Custom email templates
- Custom document headers/footers
- White-label option
```

---

---

## 📊 ADDITIONAL PRIORITY FEATURES

### Task 2: User Activity Statistics
**File:** `app/dashboard/admin/users/[userId]/page.tsx` (NEW FILE)

Show detailed user activity and statistics.

### Task 3: Bulk User Operations
**File:** `app/dashboard/admin/users/page.tsx` (ENHANCE)

Add checkboxes, bulk select, and bulk actions (change role, activate/deactivate).

### Task 4: System Analytics Dashboard
**File:** `app/dashboard/admin/analytics/page.tsx` (NEW FILE)

Charts showing:
- Documents uploaded over time
- Workflows completed vs pending
- User growth
- Most active users/projects

### Task 5: Advanced Search
**File:** `app/dashboard/search/page.tsx` (ENHANCE)

Full-text search across documents, comments, workflows with advanced filters.

---

## 🔧 TECHNICAL REQUIREMENTS

### Code Quality Standards

1. **TypeScript Strict Mode**
   - No `any` types
   - Proper type inference
   - Use Zod for validation

2. **Error Handling**
   - Use `ActionResult<T>` pattern
   - Proper error messages
   - Log errors with context

3. **Performance**
   - Use React Server Components where possible
   - Minimize client-side JavaScript
   - Optimize database queries (use indexes)
   - Implement pagination for large lists

4. **Security**
   - Always check user permissions
   - Use `requireEdmsRole()` for protected actions
   - Sanitize user inputs
   - Prevent SQL injection (Drizzle handles this)
   - Validate file uploads

5. **UI/UX**
   - Follow existing design patterns
   - Use Shadcn UI components
   - Maintain consistent spacing and typography
   - Add loading states
   - Add empty states
   - Add error states
   - Mobile-first responsive design

6. **Testing**
   - Write unit tests for critical functions
   - Write integration tests for workflows
   - Test with different user roles
   - Test edge cases

---

## 📁 FILE STRUCTURE CONVENTIONS

```
app/
├── dashboard/
│   ├── admin/              # Admin-only pages
│   │   ├── users/          # User management
│   │   ├── roles/          # Role management
│   │   ├── settings/       # System settings
│   │   ├── analytics/      # Analytics dashboard
│   │   └── audit-log/      # Audit log viewer
│   ├── documents/          # Document management
│   ├── workflows/          # Workflow management
│   ├── projects/           # Project management
│   └── transmittals/       # Transmittal management

actions/
├── admin-users.ts          # Admin user management actions
├── documents.ts            # Document actions
├── workflows.ts            # Workflow actions
├── projects.ts             # Project actions
└── transmittals.ts         # Transmittal actions

components/
├── edms/                   # EDMS-specific components
│   ├── admin-user-edit-sheet.tsx
│   ├── document-compare-dialog.tsx
│   ├── workflow-template-sheet.tsx
│   └── ...
└── ui/                     # Shadcn UI components

lib/
├── edms/                   # EDMS business logic
│   ├── rbac.ts             # Role-based access control
│   ├── session.ts          # Session management
│   ├── notifications.ts    # Notification logic
│   ├── workflow-reminders.ts
│   ├── ocr.ts
│   └── watermark.ts
└── shared.ts               # Shared utilities

db/
├── schema/                 # Database schemas
│   ├── users.ts
│   ├── documents.ts
│   ├── workflows.ts
│   ├── projects.ts
│   └── ...
└── index.ts
```

---

## 🎨 DESIGN GUIDELINES

### Color Scheme
- Use existing Tailwind theme
- Primary: Blue tones for actions
- Success: Green for approvals
- Warning: Amber for pending
- Danger: Red for rejections
- Neutral: Slate for text and borders

### Typography
- Headings: Font semibold
- Body: Font normal
- Labels: Font medium, uppercase, tracking-wide
- Code: Font mono

### Spacing
- Use Tailwind spacing scale (4px increments)
- Consistent padding: p-4, p-6, p-8
- Consistent gaps: gap-4, gap-6, gap-8

### Components
- Use rounded-2xl or rounded-3xl for cards
- Use border-border/70 for subtle borders
- Use bg-card/95 for card backgrounds
- Use shadow-sm for subtle shadows

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Critical (Do First)
1. ✅ Admin user role editing
2. ✅ Admin user management UI
3. ✅ User detail page
4. ✅ Bulk user operations

### Phase 2: High Priority
5. ✅ Workflow templates
6. ✅ Document templates
7. ✅ Advanced search
8. ✅ Analytics dashboard

### Phase 3: Medium Priority
9. ✅ Project enhancements
10. ✅ Transmittal enhancements
11. ✅ Collaboration features
12. ✅ Mobile optimization

### Phase 4: Nice to Have
13. ✅ AI-powered features
14. ✅ Digital signatures
15. ✅ Document watermarking
16. ✅ Custom branding

---

## 🧪 TESTING CHECKLIST

### Before Marking Complete:

1. **Database**
   - [ ] Run migrations successfully
   - [ ] Verify all tables exist
   - [ ] Test foreign key constraints

2. **User Roles**
   - [ ] Create test users for each role
   - [ ] Verify role hierarchy works
   - [ ] Test permission checks

3. **Document Workflow**
   - [ ] Upload document as Contractor
   - [ ] Create workflow
   - [ ] Review as Client
   - [ ] Approve/Reject
   - [ ] Verify status updates
   - [ ] Check notifications sent

4. **Admin Features**
   - [ ] Edit user role
   - [ ] Deactivate user
   - [ ] View user activity
   - [ ] Export user list

5. **Edge Cases**
   - [ ] Test with no data
   - [ ] Test with large datasets
   - [ ] Test concurrent workflows
   - [ ] Test file upload limits
   - [ ] Test invalid inputs

---

## 📝 DOCUMENTATION REQUIREMENTS

### For Each New Feature:

1. **Code Comments**
   - Explain complex logic
   - Document function parameters
   - Add JSDoc comments for public APIs

2. **README Updates**
   - Add feature to feature list
   - Update setup instructions if needed
   - Add screenshots for UI features

3. **API Documentation**
   - Document new actions
   - Document request/response types
   - Add usage examples

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Critical (DO THESE FIRST) ⚠️
1. ✅ **Admin user role editing** - `actions/admin-users.ts`
2. ✅ **Admin user edit UI** - `components/edms/admin-user-edit-sheet.tsx`
3. ✅ **Update admin users page** - Add edit buttons
4. ✅ **User activity statistics** - Show documents, workflows, comments count
5. ✅ **Bulk user operations** - Select multiple users, bulk actions
6. ✅ **System analytics** - Charts and metrics dashboard

### Phase 2: High Priority
7. ✅ Workflow templates
8. ✅ Document templates
9. ✅ Advanced search with filters
10. ✅ User detail page with activity timeline

### Phase 3: Medium Priority
11. ✅ Project enhancements (timeline, milestones)
12. ✅ Transmittal enhancements
13. ✅ Real-time notifications (WebSocket)
14. ✅ Mobile optimization

### Phase 4: Nice to Have
15. ✅ AI-powered features (document summarization, smart suggestions)
16. ✅ Digital signatures
17. ✅ Document watermarking
18. ✅ Custom branding

---

## 🧪 TESTING CHECKLIST

### Before Marking Complete:

1. **Database**
   - [ ] Run `npm run db:push` successfully
   - [ ] Verify all tables exist
   - [ ] Test foreign key constraints

2. **Admin User Management**
   - [ ] Admin can edit user roles
   - [ ] Admin can edit user details
   - [ ] Admin can activate/deactivate users
   - [ ] Admin can delete users
   - [ ] Cannot delete last admin
   - [ ] Cannot self-demote
   - [ ] Cannot self-deactivate
   - [ ] All actions are logged
   - [ ] UI is responsive

3. **User Roles**
   - [ ] Create test users for each role
   - [ ] Verify role hierarchy works
   - [ ] Test permission checks

4. **Document Workflow**
   - [ ] Upload document as Contractor (vendor)
   - [ ] Create workflow
   - [ ] Review as Client
   - [ ] Approve/Reject
   - [ ] Verify status updates
   - [ ] Check notifications sent

5. **Edge Cases**
   - [ ] Test with no data
   - [ ] Test with large datasets
   - [ ] Test concurrent workflows
   - [ ] Test file upload limits
   - [ ] Test invalid inputs

---

## 📝 COMMANDS TO RUN

### Development
```bash
# Start development server
npm run dev
# or
bun dev

# Open database studio
npm run db:studio

# Run linter
npm run lint

# Format code
npm run format
```

### Database
```bash
# Push schema changes to database
npm run db:push

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate
```

### Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🎯 SUCCESS CRITERIA

The EDMS is complete when:

1. ✅ Admin can fully manage users (edit roles, deactivate, delete)
2. ✅ Admin can view user activity statistics
3. ✅ Admin can perform bulk operations on users
4. ✅ Analytics dashboard shows meaningful data
5. ✅ All workflows are tested and working
6. ✅ All pages are mobile-responsive
7. ✅ Search works across all entities
8. ✅ Notifications work reliably
9. ✅ No console errors
10. ✅ No TypeScript errors
11. ✅ All features documented
12. ✅ Client is happy and impressed

---

## 💡 UNIQUE SELLING POINTS

Make this EDMS stand out by:

1. **AI Integration** - Smart suggestions, auto-categorization
2. **Beautiful UI** - Classy, modern, professional design
3. **Real-time Collaboration** - Live updates, instant notifications
4. **Mobile-First** - Works perfectly on phones and tablets
5. **Customizable** - Branding, workflows, templates
6. **Secure** - Audit logs, 2FA, role-based access
7. **Fast** - Optimized performance, instant search
8. **Intuitive** - Easy to use, minimal training needed
9. **Comprehensive** - All construction document needs in one place
10. **Scalable** - Works for small teams and large enterprises

---

## 🔥 FINAL NOTES FOR CODEX-CLI

- **Start with Phase 1** - Admin user management is the highest priority
- **Don't break existing features** - Test thoroughly before committing
- **Follow existing patterns** - Look at how similar features are implemented
- **Use TypeScript strictly** - No `any` types, proper type inference
- **Use Zod for validation** - All user inputs must be validated
- **Use ActionResult pattern** - All server actions return `ActionResult<T>`
- **Log all admin actions** - Use `logEdmsActivity()` for audit trail
- **Revalidate paths** - Use `revalidatePath()` after data changes
- **Show loading states** - Use `useTransition()` for pending states
- **Show success/error toasts** - Use `toast()` for user feedback
- **Test with different roles** - Verify permissions work correctly
- **Mobile responsive** - Test on mobile devices
- **Ask for clarification** - If requirements are unclear, ask

---

## 📞 CLIENT EXPECTATIONS

The client wants:
- A **unique** EDMS that stands out from competitors
- A **classy** design that looks professional
- **Complete** features with no half-baked implementations
- **Admin powers** to manage users and system settings (HIGHEST PRIORITY)
- **Reliable** workflows that construction teams can depend on
- **Mobile access** for field workers
- **Fast** performance with no lag
- **Secure** system with proper access controls

**Budget:** Client is willing to pay extra for quality work  
**Timeline:** Complete Phase 1 (Admin features) ASAP, then proceed with other phases

---

## 🎬 GET STARTED

1. Read this entire document carefully
2. Review existing codebase structure
3. Start with Task 1 (Admin user management)
4. Create `actions/admin-users.ts`
5. Create `components/edms/admin-user-edit-sheet.tsx`
6. Update `app/dashboard/admin/users/page.tsx`
7. Test each feature thoroughly
8. Move to next task
9. Communicate progress regularly

**Let's build the best construction EDMS ever! 🚀**

---

## 📚 REFERENCE FILES

All analysis and documentation files are in the `hexed/` folder:
- `hexed/BRUTAL_CHECK_RESULTS.md` - Complete feature analysis
- `hexed/ADMIN_POWERS_ANALYSIS.md` - Detailed admin requirements
- `hexed/DATABASE.md` - Database schema documentation
- `hexed/REVOLUTION.md` - Project vision and goals
- `hexed/Dx.md` - Developer experience notes
