"use client";

import { Menu, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export function DashboardHeader({ userName, userEmail, userRole }: DashboardHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Sidebar Toggle */}
        <SidebarTrigger className="-ml-1" />

        {/* Logo and Brand - Only visible on mobile when sidebar is closed */}
        <Link href="/dashboard" className="flex items-center gap-3 md:hidden">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="size-6 text-primary"
            >
              <rect width="256" height="256" fill="none" />
              <line
                x1="208"
                y1="128"
                x2="207.8"
                y2="128.2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="24"
              />
              <line
                x1="168.2"
                y1="167.8"
                x2="128"
                y2="208"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="24"
              />
              <line
                x1="192"
                y1="40"
                x2="115.8"
                y2="116.2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="24"
              />
              <line
                x1="76.2"
                y1="155.8"
                x2="40"
                y2="192"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="24"
              />
              <circle cx="188" cy="148" r="24" fill="none" stroke="currentColor" strokeWidth="24" />
              <circle cx="96" cy="136" r="24" fill="none" stroke="currentColor" strokeWidth="24" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold">QUADRA</h1>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative hidden w-full max-w-md md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents, projects..."
              className="w-full pl-10"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="size-5" />
          </Button>
        </div>

        {/* Breadcrumb or page title can go here */}
        <div className="hidden flex-1 md:block" />
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="border-t border-border/40 p-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents, projects..."
              className="w-full pl-10"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
