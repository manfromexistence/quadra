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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import {
  BarChart3,
  Clock,
  Download,
  FileBarChart,
  FilePieChart,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { ReportModal } from "@/components/edms/report-modal";

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

const RECENT_REPORTS = [
  {
    name: "Master Document Register",
    generatedBy: "S. Kumar",
    format: "XLSX",
    date: "2026-04-16 14:22",
    size: "342 KB",
  },
  {
    name: "Weekly Progress Report",
    generatedBy: "System (scheduled)",
    format: "PDF",
    date: "2026-04-15 06:00",
    size: "1.2 MB",
  },
  {
    name: "Overdue & Pending Report",
    generatedBy: "S. Kumar",
    format: "PDF",
    date: "2026-04-14 09:45",
    size: "218 KB",
  },
  {
    name: "Transmittal Log (March)",
    generatedBy: "S. Kumar",
    format: "XLSX",
    date: "2026-04-01 10:12",
    size: "89 KB",
  },
];

// Sample report data
const SAMPLE_REPORTS = {
  mdr: {
    id: "mdr",
    title: "Master Document Register",
    description: "Complete list of all project documents",
    columns: [
      { key: "code", label: "Document Code" },
      { key: "title", label: "Title" },
      { key: "discipline", label: "Discipline" },
      { key: "rev", label: "Rev" },
      { key: "status", label: "Status" },
      { key: "author", label: "Author" },
      { key: "date", label: "Date" },
    ],
    data: [
      {
        code: "AHR-CIV-DWG-0001",
        title: "Site Grading Plan — Phase 1",
        discipline: "Civil",
        rev: "B",
        status: "approved",
        author: "R. Patel",
        date: "2026-04-14",
      },
      {
        code: "AHR-STR-CAL-0012",
        title: "Primary Steel Structure Calculation",
        discipline: "Structural",
        rev: "0",
        status: "under_review",
        author: "M. Hassan",
        date: "2026-04-13",
      },
      {
        code: "AHR-MEC-SPC-0023",
        title: "Heat Exchanger Technical Specification",
        discipline: "Mechanical",
        rev: "C",
        status: "approved",
        author: "S. Kumar",
        date: "2026-04-12",
      },
      {
        code: "AHR-ELE-DWG-0045",
        title: "Main Substation Single Line Diagram",
        discipline: "Electrical",
        rev: "A",
        status: "submitted",
        author: "A. Khan",
        date: "2026-04-11",
      },
      {
        code: "AHR-INS-DAT-0008",
        title: "Control Valve Datasheet — Unit 100",
        discipline: "Instrumentation",
        rev: "1",
        status: "approved",
        author: "N. Islam",
        date: "2026-04-10",
      },
    ],
  },
  txlog: {
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
    data: [
      {
        id: "TM-AHR-0042",
        date: "2026-04-15",
        recipient: "Gulf National Petroleum",
        subject: "IFC Drawings for Substation",
        docs: "3",
        purpose: "IFC",
        status: "sent",
      },
      {
        id: "TM-AHR-0041",
        date: "2026-04-12",
        recipient: "PMC Engineering",
        subject: "IFR Instrumentation Datasheets",
        docs: "5",
        purpose: "IFR",
        status: "acknowledged",
      },
      {
        id: "TM-AHR-0040",
        date: "2026-04-08",
        recipient: "Gulf National Petroleum",
        subject: "IFA Structural Calculations Package",
        docs: "2",
        purpose: "IFA",
        status: "acknowledged",
      },
    ],
  },
  progress: {
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
        status: "approved",
      },
      {
        discipline: "Structural",
        planned: "38",
        actual: "35",
        variance: "-3",
        status: "under_review",
      },
      {
        discipline: "Mechanical",
        planned: "52",
        actual: "48",
        variance: "-4",
        status: "approved",
      },
      {
        discipline: "Electrical",
        planned: "41",
        actual: "39",
        variance: "-2",
        status: "submitted",
      },
      {
        discipline: "Instrumentation",
        planned: "29",
        actual: "31",
        variance: "+2",
        status: "approved",
      },
    ],
  },
};

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<
    typeof SAMPLE_REPORTS.mdr | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRunReport = (reportId: string) => {
    const report = SAMPLE_REPORTS[reportId as keyof typeof SAMPLE_REPORTS];
    if (report) {
      setSelectedReport(report);
      setModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Reports
            </h1>
            <p className="text-sm leading-6 text-muted-foreground md:text-base">
              Generate standard and custom reports from the project data. All
              reports can be exported to PDF, Excel, or scheduled for automatic
              distribution.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">
            <Clock className="size-4 mr-2" />
            Schedule Reports
          </Button>
          <Button>+ Custom Report</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {REPORT_CATALOG.map((report) => (
          <Card
            key={report.id}
            className="group cursor-pointer border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            onClick={() => handleRunReport(report.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center border border-border bg-muted">
                  <report.icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <Badge
                  variant="secondary"
                  className="shrink-0 text-xs uppercase tracking-wider"
                >
                  {report.tag}
                </Badge>
              </div>
              <CardTitle className="text-base transition-colors group-hover:text-primary">
                {report.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {report.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Last run: 2026-04-16
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  Run →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Report Activity</CardTitle>
            <Badge variant="secondary" className="uppercase tracking-wider">
              Last 7 Days
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Report</TableHead>
                <TableHead>Generated By</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_REPORTS.map((report, index) => (
                <TableRow
                  key={index}
                  className="transition-colors hover:bg-accent"
                >
                  <TableCell className="px-6">{report.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {report.generatedBy}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {report.format}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {report.date}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {report.size}
                  </TableCell>
                  <TableCell className="px-6">
                    <Button variant="ghost" size="sm">
                      <Download className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReportModal
        report={selectedReport}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
