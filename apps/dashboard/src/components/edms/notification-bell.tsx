"use client";

import { BellRing } from "lucide-react";
import Link from "next/link";
import { MarkAllNotificationsReadButton, MarkNotificationReadButton } from "@/components/edms/notification-actions";
import type { EdmsNotificationFeedItem } from "@/lib/edms/notification-feed";
import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@midday/ui/popover";
import { ScrollArea } from "@midday/ui/scroll-area";

export function EdmsNotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: EdmsNotificationFeedItem[];
  unreadCount: number;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
          <BellRing className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[420px] p-0">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">
                Review requests, transmittals, and approval updates.
              </p>
            </div>
            <MarkAllNotificationsReadButton disabled={notifications.every((item) => item.isRead)} />
          </div>
        </div>

        <ScrollArea className="max-h-[420px]">
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 px-4 py-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.isRead ? <Badge variant="outline">Unread</Badge> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {notification.projectName ? <span>{notification.projectName}</span> : null}
                      <span>{notification.createdLabel}</span>
                    </div>
                    {notification.actionUrl ? (
                      <Link href={notification.actionUrl} className="text-sm text-primary hover:underline">
                        Open item
                      </Link>
                    ) : null}
                  </div>
                  <MarkNotificationReadButton
                    notificationId={notification.id}
                    disabled={notification.isRead}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-3">
          <Button variant="ghost" asChild className="w-full justify-center">
            <Link href="/notifications">Open notification inbox</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
