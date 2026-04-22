"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import { ScrollArea } from "@midday/ui/scroll-area";
import {
  BarChart3,
  Clock,
  Download,
  FileBarChart,
  FilePieChart,
  FileText,
  Search,
  TrendingUp,
} from "lucide-react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { useEffect, useState } from "react";
import { ReportModal } from "@/components/edms/report-modal";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { getDocuments } from "@/lib/edms/documents";
import { getTransmittals } from "@/lib/edms/transmittals";

const REPORT_CATALOG = [
  {
    id: "mdr",
    icon: FileText,
    title: "Master Document Register (MDR)",
    description:
      "Complete list of all project documents with metadata, revisions, and current status. Primary deliverable for contract compliance.",
    tag: "STANDARD",
  },
  {
    id: "txlog",
    icon: FileBarChart,
    title: "Transmittal Log",
    description:
      "Chronological record of all outgoing transmittals with recipients, purposes, and acknowledgement status.",
    tag: "STANDARD",
  },
  {
    id: "progress",
    icon: TrendingUp,
    title: "Engineering Progress Report",
    description:
      "Planned vs actual progress by discipline and document type. Includes S-curve data and weekly/monthly deltas.",
    tag: "PROGRESS",
  },
  {
    id: "overdue",
    icon: Clock,
    title: "Overdue & Pending Report",
    description:
      "Documents past SLA for review or approval, grouped by recipient and age. Escalation candidates flagged.",
    tag: "EXCEPTION",
  },
  {
    id: "submission",
    icon: FilePieChart,
    title: "Submission Status by Discipline",
    description:
      "Matrix view: rows are documents, columns are disciplines × status, showing aggregate submission health.",
    tag: "SUMMARY",
  },
  {
    id: "audit",
    icon: BarChart3,
    title: "Audit Trail Export",
    description:
      "Full system activity log for the period, filterable by user, action, or document. ISO 19650 compliance-ready.",
    tag: "COMPLIANCE",
  },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [transmittals, setTransmittals] = useState<any[]>([]);

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectId = "PRJ-AHR-2026";
        const [docs, trans] = await Promise.all([
          getDocuments(projectId),
          getTransmittals(projectId),
        ]);
        setDocuments(docs);
        setTransmittals(trans);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data. Please try again later.");
      }
    };
    fetchData();
  }, []);

  const filteredReports = REPORT_CATALOG.filter((report) =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRunReport = (reportId: string) => {
    let reportData: any = null;

    if (reportId === "mdr") {
      reportData = {
        id: "mdr",
        title: "Master Document Register",
        description: "Complete list of all project documents with metadata",
        columns: [
          { key: "code", label: "Code" },
          { key: "title", label: "Title" },
          { key: "discipline", label: "Discipline" },
          { key: "rev", label: "Rev" },
          { key: "status", label: "Status" },
          { key: "author", label: "Author" },
          { key: "date", label: "Date" },
        ],
        data: documents.map((d: any) => ({
          code: d.code,
          title: d.title,
          discipline: "N/A", // TODO: Add discipline to getDocuments function
          rev: d.rev,
          status: "Pending", // TODO: Add status to getDocuments function
          author: "Unknown", // TODO: Add author to getDocuments function
          date: "N/A", // TODO: Add date to getDocuments function
        })),
      };
    } else if (reportId === "txlog") {
      reportData = {
        id: "txlog",
        title: "Transmittal Log",
        description: "Chronological record of all outgoing transmittals",
        columns: [
          { key: "id", label: "ID" },
          { key: "date", label: "Date" },
          { key: "recipient", label: "Recipient" },
          { key: "subject", label: "Subject" },
          { key: "docs", label: "Docs" },
          { key: "purpose", label: "Purpose" },
          { key: "status", label: "Status" },
        ],
        data: transmittals.map((t: any) => ({
          id: t.transmittalNumber,
          date: t.createdAt
            ? new Date(t.createdAt).toISOString().split("T")[0]
            : "N/A",
          recipient: t.sentTo || "N/A",
          subject: t.subject,
          docs: t.documentCount?.toString() || "0",
          purpose: t.purpose || "N/A",
          status: t.status,
        })),
      };
    } else if (reportId === "progress") {
      reportData = {
        id: "progress",
        title: "Engineering Progress Report",
        description: "Planned vs actual progress by discipline",
        columns: [
          { key: "discipline", label: "Discipline" },
          { key: "planned", label: "Planned" },
          { key: "actual", label: "Actual" },
          { key: "variance", label: "Variance" },
          { key: "status", label: "Status" },
        ],
        data: [
          {
            discipline: "Civil",
            planned: "45",
            actual: "42",
            variance: "-3",
            status: "On Track",
          },
          {
            discipline: "Structural",
            planned: "38",
            actual: "35",
            variance: "-3",
            status: "On Track",
          },
          {
            discipline: "Mechanical",
            planned: "52",
            actual: "48",
            variance: "-4",
            status: "On Track",
          },
          {
            discipline: "Electrical",
            planned: "41",
            actual: "39",
            variance: "-2",
            status: "On Track",
          },
          {
            discipline: "Instrumentation",
            planned: "29",
            actual: "31",
            variance: "+2",
            status: "Ahead",
          },
        ],
      };
    }

    if (reportData) {
      setSelectedReport(reportData);
      setModalOpen(true);
    }
  };

  return (
    <ScrollableContent>
      <ErrorBoundary errorComponent={ErrorFallback}>
        <div className="flex flex-col gap-6 p-6">
          {error && (
            <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Reports
              </h1>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                Generate and download project reports including design reviews,
                transmittal logs, progress reports, and compliance matrices.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredReports.map((report) => (
              <Card
                key={report.id}
                className="group hover:border-primary/50 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-muted">
                      <report.icon className="size-5" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {report.tag}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3">
                    {report.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {report.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleRunReport(report.id)}
                    className="w-full"
                    size="sm"
                  >
                    <Download className="size-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Recent Transmittals
            </h2>
            <div className="rounded-md border">
              <ScrollArea className="h-64">
                <div className="divide-y">
                  {transmittals.slice(0, 5).map((t: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-muted">
                          <FileText className="size-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {t.transmittalNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.subject} • Status: {t.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {transmittals.length === 0 && (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No transmittals found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <ReportModal
          report={selectedReport}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </ErrorBoundary>
    </ScrollableContent>
  );
}
