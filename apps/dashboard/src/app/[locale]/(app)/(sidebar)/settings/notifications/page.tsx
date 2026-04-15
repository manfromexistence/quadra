import type { Metadata } from "next";
import { Suspense } from "react";
import { NotificationsSettingsList } from "@/components/notifications-settings-list";

export const metadata: Metadata = {
  title: "Notifications | Quadra EDMS",
};

export default async function Notifications() {
  return (
    <Suspense>
      <NotificationsSettingsList />
    </Suspense>
  );
}
