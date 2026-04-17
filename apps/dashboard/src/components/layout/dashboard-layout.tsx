"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExportStatus } from "@/components/export-status";
import { GlobalTimerProvider } from "@/components/global-timer-provider";
import { Header } from "@/components/header";
import { GlobalSheetsProvider } from "@/components/sheets/global-sheets-provider";
import { Sidebar } from "@/components/sidebar";
import { TimezoneDetector } from "@/components/timezone-detector";
import { TrialGuard } from "@/components/trial-guard";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@midday/ui/spinner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: session } = await authClient.getSession();
        
        if (!session) {
          router.push("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="relative">
      <Sidebar />

      <div className="md:ml-[70px] pt-[70px] pb-4">
        <Header />
        <TrialGuard plan="pro" createdAt={new Date().toISOString()}>
          <div className="px-4 md:px-8">{children}</div>
        </TrialGuard>
      </div>

      <ExportStatus />
      <GlobalSheetsProvider />
      <GlobalTimerProvider />
      <TimezoneDetector />
    </div>
  );
}