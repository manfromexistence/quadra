"use client";

import { ExportStatus } from "@/components/export-status";
import { GlobalTimerProvider } from "@/components/global-timer-provider";
import { Header } from "@/components/header";
import { GlobalSheetsProvider } from "@/components/sheets/global-sheets-provider";
import { Sidebar } from "@/components/sidebar";
import { TimezoneDetector } from "@/components/timezone-detector";
import { TrialGuard } from "@/components/trial-guard";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
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
