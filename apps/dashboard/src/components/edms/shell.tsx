"use client";

import { Avatar, AvatarFallback, AvatarImageNext } from "@midday/ui/avatar";
import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import { Card } from "@midday/ui/card";
import { cn } from "@midday/ui/cn";
import { Icons } from "@midday/ui/icons";
import { Sheet, SheetContent } from "@midday/ui/sheet";
import {
  BarChart3,
  BellRing,
  FileStack,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Send,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ComponentType, useState } from "react";
import { signOut } from "@/lib/auth-client";
import type { EdmsNotificationFeedItem } from "@/lib/edms/notification-feed";
import { EdmsNotificationBell } from "./notification-bell";
import { formatEdmsLabel } from "./status-badge";

const edmsNav = [
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/documents", label: "Documents", icon: FileStack },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/transmittals", label: "Transmittals", icon: Send },
  { href: "/notifications", label: "Notifications", icon: BellRing },
] as const;

const coreNav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
] as const;

export function EdmsShell({
  user,
  notifications,
  unreadCount,
  children,
}: {
  user: {
    name: string;
    email: string;
    image: string;
    role: string;
    organization: string | null;
  };
  notifications: EdmsNotificationFeedItem[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(221,196,154,0.24),_transparent_30%),linear-gradient(180deg,_rgba(250,248,242,1),_rgba(245,241,233,1))] text-foreground dark:bg-background">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="lg:hidden sticky top-0 z-40 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Icons.LogoSmall className="size-6" />
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] uppercase">
                  Quadra
                </p>
                <p className="text-xs text-muted-foreground">EDMS workspace</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
          </div>
        </div>

        <SheetContent side="left" className="p-0 sm:max-w-xs">
          <div className="h-full overflow-y-auto p-4">
            <SidebarContent
              pathname={pathname}
              user={user}
              onSignOut={handleSignOut}
            />
          </div>
        </SheetContent>
      </Sheet>

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-background/80 p-4 backdrop-blur lg:block">
        <SidebarContent
          pathname={pathname}
          user={user}
          onSignOut={handleSignOut}
        />
      </aside>

      <main className="lg:pl-72">
        <div className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-4 py-3 md:px-6 lg:px-8">
            <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
              <BellRing className="size-3.5" />
              <span>Unread alerts: {unreadCount}</span>
            </div>
            <EdmsNotificationBell notifications={notifications} unreadCount={unreadCount} />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  onSignOut,
}: {
  pathname: string;
  user: {
    name: string;
    email: string;
    image: string;
    role: string;
    organization: string | null;
  };
  onSignOut: () => Promise<void>;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="border-border bg-background/95 p-4 shadow-sm">
        <Link href="/projects" className="flex items-center gap-3">
          <Icons.LogoSmall className="size-7" />
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase">
              Quadra
            </p>
            <p className="text-sm text-muted-foreground">Construction EDMS</p>
          </div>
        </Link>
      </Card>

      <nav className="space-y-4">
        <NavSection label="EDMS" pathname={pathname} items={edmsNav} />
        <NavSection
          label="Core Dashboard"
          pathname={pathname}
          items={coreNav}
        />
      </nav>

      <Card className="mt-auto border-border bg-background/95 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="size-11 overflow-hidden">
            <AvatarImageNext
              src={user.image || "https://github.com/evilrabbit.png"}
              alt={user.name}
              width={44}
              height={44}
            />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full">
            {formatEdmsLabel(user.role)}
          </Badge>
          {user.organization ? (
            <Badge variant="outline" className="rounded-full">
              {user.organization}
            </Badge>
          ) : null}
        </div>

        <Button
          variant="outline"
          className="mt-4 w-full justify-start"
          onClick={() => void onSignOut()}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </Card>
    </div>
  );
}

function NavSection({
  label,
  pathname,
  items,
}: {
  label: string;
  pathname: string;
  items: readonly {
    href: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
  }[];
}) {
  return (
    <Card className="border-border bg-background/95 p-3 shadow-sm">
      <p className="px-2 pb-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
        {label}
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors",
                active ? "bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}


