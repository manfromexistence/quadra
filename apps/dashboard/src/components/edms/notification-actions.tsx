"use client";

import { Button } from "@midday/ui/button";
import { BellRing, CheckCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications";
import { toast } from "@/hooks/use-toast";

export function MarkNotificationReadButton({
  notificationId,
  disabled,
}: {
  notificationId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await markNotificationRead({ notificationId });

          if (!result.success) {
            toast({
              title: "Notification update failed",
              description: result.error.message,
              variant: "destructive",
            });
            return;
          }

          router.refresh();
        });
      }}
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Saving
        </>
      ) : (
        <>
          <BellRing className="size-4" />
          Mark read
        </>
      )}
    </Button>
  );
}

export function MarkAllNotificationsReadButton({
  disabled,
}: {
  disabled: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await markAllNotificationsRead();

          if (!result.success) {
            toast({
              title: "Notification update failed",
              description: result.error.message,
              variant: "destructive",
            });
            return;
          }

          router.refresh();
        });
      }}
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Saving
        </>
      ) : (
        <>
          <CheckCheck className="size-4" />
          Mark all read
        </>
      )}
    </Button>
  );
}
