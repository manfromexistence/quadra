"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { assignProjectMember } from "@/actions/projects";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

const projectMemberRoles = ["admin", "client", "pmc", "vendor", "subcontractor", "user"] as const;

const assignProjectMemberFormSchema = z.object({
  userId: z.string().min(1, "User selection is required."),
  role: z.enum(projectMemberRoles),
});

type AssignProjectMemberFormValues = z.infer<typeof assignProjectMemberFormSchema>;

const defaultValues: AssignProjectMemberFormValues = {
  userId: "",
  role: "vendor",
};

interface ProjectMemberSheetProps {
  projectId: string;
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    organization: string | null;
  }[];
}

export function ProjectMemberSheet({ projectId, users }: ProjectMemberSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AssignProjectMemberFormValues>({
    resolver: zodResolver(assignProjectMemberFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [form, isOpen]);

  const onSubmit = (values: AssignProjectMemberFormValues) => {
    startTransition(async () => {
      const result = await assignProjectMember({
        projectId,
        userId: values.userId,
        role: values.role,
      });

      if (!result.success) {
        toast({
          title: "Team assignment failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: result.data.created ? "Member assigned" : "Member role updated",
        description: "The project team has been refreshed for this workspace.",
      });

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button disabled={users.length === 0}>
          <UserPlus2 className="size-4" />
          Assign member
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto px-6 sm:max-w-xl">
        <SheetHeader className="space-y-1">
          <div className="px-6 pt-6">
            <SheetTitle>Assign project member</SheetTitle>
            <SheetDescription>
              Add a project participant and define the role they will hold inside this workspace.
            </SheetDescription>
          </div>
        </SheetHeader>

        {users.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
            <p className="text-sm text-muted-foreground">
              All available users are already assigned to this project.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6 px-6 pb-6">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} - {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Existing global users can be assigned immediately to the project team.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectMemberRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This role controls how the user participates in reviews, approvals, and
                      document submission on this project.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-3 border-t pt-6">
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
                      <UserPlus2 className="size-4" />
                      Save assignment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
