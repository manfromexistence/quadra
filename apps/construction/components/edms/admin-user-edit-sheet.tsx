"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, Loader2, PencilLine, ShieldAlert, Trash2, UserCog2, UserX2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  deleteUser,
  getUserActivitySummary,
  toggleUserStatus,
  type UserActivitySummary,
  updateUserDetails,
  updateUserRole,
} from "@/actions/admin-users";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
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
import { formatEdmsLabel } from "./status-badge";

const userRoles = ["admin", "client", "pmc", "vendor", "subcontractor", "user"] as const;

const adminUserFormSchema = z.object({
  role: z.enum(userRoles),
  organization: z.string().trim().max(255, "Organization is too long."),
  jobTitle: z.string().trim().max(255, "Job title is too long."),
  phone: z.string().trim().max(50, "Phone is too long."),
  department: z.string().trim().max(255, "Department is too long."),
  isActive: z.boolean(),
});

type AdminUserFormValues = z.infer<typeof adminUserFormSchema>;

export interface AdminEditableUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
  organization: string | null;
  jobTitle: string | null;
  phone: string | null;
  department: string | null;
  isActive: boolean | null;
}

interface AdminUserEditSheetProps {
  user: AdminEditableUser;
  currentAdminId: string;
}

function buildDefaultValues(user: AdminEditableUser): AdminUserFormValues {
  return {
    role: normalizeRole(user.role),
    organization: user.organization ?? "",
    jobTitle: user.jobTitle ?? "",
    phone: user.phone ?? "",
    department: user.department ?? "",
    isActive: Boolean(user.isActive ?? true),
  };
}

export function AdminUserEditSheet({ user, currentAdminId }: AdminUserEditSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<UserActivitySummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultValues = useMemo(() => buildDefaultValues(user), [user]);
  const isCurrentAdmin = user.id === currentAdminId;

  const form = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset(buildDefaultValues(user));
    setIsLoadingSummary(true);

    void getUserActivitySummary(user.id)
      .then((result) => {
        if (!result.success) {
          toast({
            title: "Activity summary unavailable",
            description: result.error.message,
            variant: "destructive",
          });
          setSummary(null);
          return;
        }

        setSummary(result.data);
      })
      .finally(() => {
        setIsLoadingSummary(false);
      });
  }, [form, isOpen, user]);

  const onSubmit = (values: AdminUserFormValues) => {
    startTransition(async () => {
      const detailResult = await updateUserDetails({
        userId: user.id,
        organization: values.organization,
        jobTitle: values.jobTitle,
        phone: values.phone,
        department: values.department,
      });

      if (!detailResult.success) {
        toast({
          title: "Profile update failed",
          description: detailResult.error.message,
          variant: "destructive",
        });
        return;
      }

      const previousRole = normalizeRole(user.role);

      if (values.role !== previousRole) {
        const roleResult = await updateUserRole({
          userId: user.id,
          role: values.role,
        });

        if (!roleResult.success) {
          toast({
            title: "Role update failed",
            description: roleResult.error.message,
            variant: "destructive",
          });
          return;
        }
      }

      const previousStatus = Boolean(user.isActive ?? true);

      if (values.isActive !== previousStatus) {
        const statusResult = await toggleUserStatus({
          userId: user.id,
          isActive: values.isActive,
        });

        if (!statusResult.success) {
          toast({
            title: "Status update failed",
            description: statusResult.error.message,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "User updated",
        description: `${user.name} has been updated in the QUADRA workspace.`,
      });

      setIsOpen(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(user.id);

      if (!result.success) {
        toast({
          title: "Delete failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User deleted",
        description: `${user.name} was removed from the workspace.`,
      });

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <PencilLine className="size-4" />
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto px-6 sm:max-w-2xl">
        <SheetHeader className="space-y-1">
          <div className="px-6 pt-6">
            <SheetTitle>Edit user</SheetTitle>
            <SheetDescription>
              Manage role, contact details, and account status for {user.name}.
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-6 pb-6 pt-8">
          <Card className="gap-4 border-dashed bg-muted/20 py-4">
            <CardContent className="grid gap-4 px-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="space-y-2">
                <div>
                  <p className="text-base font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border px-2.5 py-1">
                    {formatEdmsLabel(normalizeRole(user.role))}
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-1">
                    {Boolean(user.isActive ?? true) ? "Active" : "Inactive"}
                  </span>
                  {isCurrentAdmin ? (
                    <span className="rounded-full border border-border px-2.5 py-1">
                      Current session
                    </span>
                  ) : null}
                </div>
              </div>

              <div
                className={cn(
                  "grid min-w-48 gap-2 rounded-xl border bg-background p-3 text-sm",
                  isLoadingSummary && "opacity-70"
                )}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="size-4 text-muted-foreground" />
                  Activity summary
                </div>
                {isLoadingSummary ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading summary
                  </div>
                ) : summary ? (
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <SummaryMetric label="Documents" value={summary.documentsUploaded} />
                    <SummaryMetric label="Comments" value={summary.commentsAdded} />
                    <SummaryMetric label="Workflows" value={summary.workflowsCreated} />
                    <SummaryMetric label="Assignments" value={summary.projectsAssigned} />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No activity summary available yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace role</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {formatEdmsLabel(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Controls access to projects, workflows, approvals, and administration.
                      </FormDescription>
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
                        <Input placeholder="Document control" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <FormControl>
                        <Input placeholder="QUADRA Construction" {...field} />
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
                      <FormLabel>Job title</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior document controller" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+8801XXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="rounded-xl border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <FormLabel>Active access</FormLabel>
                          <FormDescription>
                            Disable the user if they should no longer access the dashboard.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isCurrentAdmin ? (
                <div className="flex items-start gap-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-sm">
                  <ShieldAlert className="mt-0.5 size-4 text-amber-600" />
                  <p className="text-muted-foreground">
                    This is your current admin account. You cannot deactivate or demote it here.
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      type="button"
                      disabled={isPending || isCurrentAdmin}
                    >
                      <Trash2 className="size-4" />
                      Delete user
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogMedia>
                        <UserX2 className="size-6" />
                      </AlertDialogMedia>
                      <AlertDialogTitle>Delete {user.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the account and reassigns or clears dependent records where
                        necessary. The action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        disabled={isPending}
                        onClick={handleDelete}
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Deleting
                          </>
                        ) : (
                          <>
                            <Trash2 className="size-4" />
                            Delete user
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <UserCog2 className="size-4" />
                        Save changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-2">
      <p className="text-[11px] uppercase tracking-[0.14em]">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function normalizeRole(role: string | null) {
  if (!role || !userRoles.includes(role as (typeof userRoles)[number])) {
    return "user";
  }

  return role as (typeof userRoles)[number];
}
