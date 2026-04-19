"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@midday/ui/avatar";
import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@midday/ui/sidebar";
import {
  BarChart3,
  BellRing,
  BookOpen,
  Building2,
  CalendarDays,
  FileStack,
  FolderKanban,
  Grid3X3,
  History,
  LayoutDashboard,
  LogOut,
  Search,
  Send,
  Settings,
  Sparkles,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { authClient } from "@/lib/auth-client";
import type { DashboardUser } from "@/lib/edms/dashboard";
import { SearchCommand } from "./search-command";
import { formatEdmsLabel } from "./status-badge";

const PRIMARY_NAVIGATION = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { title: "Documents", href: "/dashboard/documents", icon: FileStack },
  { title: "Search", href: "/dashboard/search", icon: Search },
  { title: "Workflows", href: "/dashboard/workflows", icon: Workflow },
  { title: "Transmittals", href: "/dashboard/transmittals", icon: Send },
  { title: "Notifications", href: "/dashboard/notifications", icon: BellRing },
] as const;

const PLANNING_NAVIGATION = [
  {
    title: "Schedule & Progress",
    href: "/dashboard/schedule",
    icon: CalendarDays,
  },
  { title: "Data Book", href: "/dashboard/databook", icon: BookOpen },
  { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
] as const;

const CONFIG_NAVIGATION = [
  { title: "Distribution Matrix", href: "/dashboard/matrix", icon: Grid3X3 },
  { title: "Audit Trail", href: "/dashboard/audit", icon: History },
] as const;

const ADMIN_NAVIGATION = [
  { title: "Admin Dashboard", href: "/dashboard/admin", icon: Settings },
  { title: "Users", href: "/dashboard/admin/users", icon: Building2 },
  {
    title: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: LayoutDashboard,
  },
] as const;

const SECONDARY_NAVIGATION = [
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Theme Studio", href: "/theme", icon: Sparkles },
] as const;

export function EdmsDashboardSidebar({ user }: { user: DashboardUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleLogOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarHeader className="gap-3 border-b border-sidebar-border/80 px-3 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/40 p-3"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-sidebar-accent shadow-sm overflow-hidden">
              <BrandLogo size={40} priority />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="truncate text-lg font-bold">QUADRA</p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                Document Management System
              </p>
            </div>
          </Link>

          {/* Search Command Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-4" />
            <span className="flex-1 text-left text-sm">
              Search workspace...
            </span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <div className="flex flex-wrap gap-2 px-1">
            <Badge variant="secondary" className="rounded-full">
              {formatEdmsLabel(user.role)}
            </Badge>
            {user.organization ? (
              <Badge
                variant="outline"
                className="rounded-full border-sidebar-border"
              >
                {user.organization}
              </Badge>
            ) : null}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {PRIMARY_NAVIGATION.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isNavItemActive(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Planning & Delivery</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {PLANNING_NAVIGATION.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isNavItemActive(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Configuration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {CONFIG_NAVIGATION.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isNavItemActive(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {user.role === "admin" && (
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {ADMIN_NAVIGATION.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isNavItemActive(pathname, item.href)}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {SECONDARY_NAVIGATION.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isNavItemActive(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/80 p-3">
          <div className="rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/40 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border border-sidebar-border/80 overflow-hidden">
                <AvatarImage
                  src={user.image || "https://github.com/shadcn.png"}
                  alt={user.name}
                />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/70">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-3 w-full justify-start border-sidebar-border bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogOut}
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* Search Command Dialog */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
