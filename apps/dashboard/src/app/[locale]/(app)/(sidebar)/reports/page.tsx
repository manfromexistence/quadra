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
import { getDocuments } from "@/lib/edms/documents";
import { getTransmittals } from "@/lib/edms/transmittals";
import { ReportModalClient } from "./report-modal-client";

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

export default async function ReportsPage() {
  // Fetch data on server
  let documents: any[] = [];
  let transmittals: any[] = [];
  let error: string | null = null;

  try {
    const projectId = "PRJ-AHR-2026";
    const [docs, trans] = await Promise.all([
      getDocuments(projectId),
      getTransmittals(projectId),
    ]);
    documents = docs;
    transmittals = trans;
  } catch (err) {
    console.error("Failed to fetch data:", err);
    error = "Failed to load data. Please try again later.";
  }

  return (
    <ReportModalClient 
      documents={documents}
      transmittals={transmittals}
      error={error}
    />
  );
}
