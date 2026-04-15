"use client";

import { AuthPanel } from "@/components/auth/auth-panel";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/ui/revola";
import { PostLoginActionType } from "@/hooks/use-post-login-action";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "signin" | "signup";
  trigger?: React.ReactNode;
  postLoginActionType?: PostLoginActionType | null;
}

export function AuthDialog({
  open,
  onOpenChange,
  initialMode = "signin",
  trigger,
  postLoginActionType,
}: AuthDialogProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger> : null}
      <ResponsiveDialogContent className="overflow-hidden sm:max-w-xl">
        <AuthPanel
          initialMode={initialMode}
          onSuccess={() => onOpenChange(false)}
          postLoginActionType={postLoginActionType}
          variant="dialog"
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
