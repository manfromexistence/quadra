import { EdmsShell } from "@/components/edms/shell";
import { getEdmsNotificationFeed, getEdmsUnreadNotificationCount } from "@/lib/edms/notification-feed";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export default async function EdmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getRequiredDashboardSessionUser();
  const [notifications, unreadCount] = await Promise.all([
    getEdmsNotificationFeed(user, 8),
    getEdmsUnreadNotificationCount(user),
  ]);

  return (
    <EdmsShell user={user} notifications={notifications} unreadCount={unreadCount}>
      {children}
    </EdmsShell>
  );
}
