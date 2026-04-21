"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import { cn } from "@midday/ui/cn";
import {
  Bell,
  FileText,
  FolderOpen,
  Home,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Home", href: "/projects" },
    { icon: FileText, label: "Documents", href: "/documents" },
    { icon: FolderOpen, label: "Projects", href: "/projects" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-around h-16 px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-xs transition-colors",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Header with Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          <Menu className="size-5" />
        </Button>
        <span className="font-semibold">Quadra EDMS</span>
        <div className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="size-5" />
          </Button>
          <Badge className="absolute -top-1 -right-1 size-4 flex items-center justify-center p-0">
            3
          </Badge>
        </div>
      </div>
    </>
  );
}
