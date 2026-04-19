"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { cn } from "@midday/ui/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { AlertTriangle, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { AddSectionDialog } from "@/components/edms/add-section-dialog";
import { CompileDataBookDialog } from "@/components/edms/compile-databook-dialog";

const DATABOOK_SECTIONS = [
  {
    code: "SEC-01",
    title: "Project Management & Contracts",
    required: 12,
    collected: 12,
    docs: [
      { code: "PMC-001", title: "Project Execution Plan", status: "collected" },
      {
        code: "PMC-002",
        title: "Quality Management Plan",
        status: "collected",
      },
      { code: "PMC-003", title: "HSE Management Plan", status: "collected" },
    ],
  },
  {
    code: "SEC-02",
    title: "Engineering Design Documentation",
    required: 45,
    collected: 38,
    docs: [
      {
        code: "AHR-CIV-DWG-0001",
        title: "Site Grading Plan — Phase 1",
        status: "collected",
      },
      {
        code: "AHR-STR-CAL-0012",
        title: "Primary Steel Structure Calculation",
        status: "collected",
      },
      {
        code: "AHR-MEC-SPC-0023",
        title: "Heat Exchanger Technical Specification",
        status: "pending",
      },
      {
        code: "AHR-ELE-DWG-0045",
        title: "Main Substation Single Line Diagram",
        status: "missing",
      },
      {
        code: "AHR-INS-DAT-0008",
        title: "Control Valve Datasheet — Unit 100",
        status: "collected",
      },
    ],
  },
  {
    code: "SEC-03",
    title: "Vendor Documentation & Data Sheets",
    required: 28,
    collected: 22,
    docs: [
      {
        code: "VND-HX-001",
        title: "Heat Exchanger Vendor Drawing",
        status: "collected",
      },
      {
        code: "VND-PMP-012",
        title: "Pump Performance Curves",
        status: "pending",
      },
      {
        code: "VND-VLV-023",
        title: "Control Valve Datasheet",
        status: "missing",
      },
    ],
  },
  {
    code: "SEC-04",
    title: "Inspection & Test Records",
    required: 34,
    collected: 18,
    docs: [
      {
        code: "ITR-WLD-001",
        title: "Welding Inspection Report — Unit 100",
        status: "collected",
      },
      {
        code: "ITR-HYD-002",
        title: "Hydrostatic Test Report — Pipeline A",
        status: "pending",
      },
      {
        code: "ITR-ELE-003",
        title: "Electrical Continuity Test",
        status: "missing",
      },
    ],
  },
  {
    code: "SEC-05",
    title: "Material Certificates & Mill Test Reports",
    required: 56,
    collected: 42,
    docs: [
      {
        code: "MTC-STL-001",
        title: "Steel Plate Material Certificate",
        status: "collected",
      },
      {
        code: "MTC-PIP-002",
        title: "Pipe Mill Test Report",
        status: "collected",
      },
      {
        code: "MTC-BLT-003",
        title: "Bolt Material Certificate",
        status: "pending",
      },
    ],
  },
  {
    code: "SEC-06",
    title: "Commissioning & Startup Documentation",
    required: 22,
    collected: 8,
    docs: [
      {
        code: "COM-SYS-001",
        title: "System Completion Certificate",
        status: "pending",
      },
      {
        code: "COM-PRF-002",
        title: "Performance Test Report",
        status: "missing",
      },
    ],
  },
  {
    code: "SEC-07",
    title: "As-Built Drawings & Red-Line Markups",
    required: 38,
    collected: 15,
    docs: [
      {
        code: "AB-CIV-001",
        title: "As-Built Foundation Layout",
        status: "collected",
      },
      {
        code: "AB-PIP-002",
        title: "As-Built Piping Isometric",
        status: "pending",
      },
      {
        code: "AB-ELE-003",
        title: "As-Built Electrical Single Line",
        status: "missing",
      },
    ],
  },
];

const AUTO_POPULATE_RULES = [
  {
    pattern: "*-CIV-DWG-* with status IFC",
    section: "SEC-02 Engineering Design",
    trigger: "On approval",
  },
  {
    pattern: "VND-* (any)",
    section: "SEC-03 Vendor Data",
    trigger: "On upload",
  },
  {
    pattern: "ITR-* (any)",
    section: "SEC-04 Inspection & Test",
    trigger: "On upload",
  },
  {
    pattern: "MTC-* (any)",
    section: "SEC-05 Material Certificates",
    trigger: "On upload",
  },
  {
    pattern: "AB-* (as-built)",
    section: "SEC-07 As-Built Drawings",
    trigger: "On tag",
  },
];

export default function DatabookPage() {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["SEC-01"]),
  );
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [compileOpen, setCompileOpen] = useState(false);

  const toggleSection = (code: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const totalRequired = DATABOOK_SECTIONS.reduce(
    (s, sec) => s + sec.required,
    0,
  );
  const totalCollected = DATABOOK_SECTIONS.reduce(
    (s, sec) => s + sec.collected,
    0,
  );
  const coverage =
    totalRequired > 0 ? (totalCollected / totalRequired) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Data Book Compilation
            </h1>
            <p className="text-sm leading-6 text-muted-foreground md:text-base">
              Organise final deliverables into a structured handover dossier.
              Track missing items, compile sections, and export the master data
              book.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline">
            <AlertTriangle className="size-4 mr-2" />
            Missing Items
          </Button>
          <Button variant="secondary" onClick={() => setAddSectionOpen(true)}>
            <Plus className="size-4 mr-2" />
            Add Section
          </Button>
          <Button onClick={() => setCompileOpen(true)}>
            Compile Data Book →
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Book Structure</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click a section to expand items
                  </p>
                </div>
                <Badge variant="secondary" className="uppercase tracking-wider">
                  {DATABOOK_SECTIONS.length} Sections
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t border-border">
                {DATABOOK_SECTIONS.map((section) => {
                  const pct =
                    section.required > 0
                      ? (section.collected / section.required) * 100
                      : 0;
                  const isOpen = openSections.has(section.code);

                  return (
                    <div
                      key={section.code}
                      className="border-b border-border last:border-b-0"
                    >
                      <div
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => toggleSection(section.code)}
                      >
                        <ChevronRight
                          className={cn(
                            "size-4 text-muted-foreground transition-transform",
                            isOpen && "rotate-90",
                          )}
                        />
                        <Badge
                          variant="outline"
                          className="font-mono text-xs font-semibold shrink-0"
                        >
                          {section.code}
                        </Badge>
                        <div className="flex-1 font-medium text-sm">
                          {section.title}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-border relative overflow-hidden">
                            <div
                              className={cn(
                                "absolute inset-y-0 left-0",
                                pct === 100
                                  ? "bg-emerald-600"
                                  : pct >= 70
                                    ? "bg-amber-600"
                                    : "bg-red-600",
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">
                            {section.collected}/{section.required}
                          </span>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="bg-muted/30">
                          {section.docs.length > 0 ? (
                            section.docs.map((doc) => (
                              <div
                                key={doc.code}
                                className="grid grid-cols-[140px_1fr_100px_100px_100px] gap-3 items-center px-4 py-3 border-t border-border text-sm hover:bg-accent/30"
                              >
                                <div className="font-mono text-xs font-medium">
                                  {doc.code}
                                </div>
                                <div>{doc.title}</div>
                                <div>
                                  {doc.status === "collected" && (
                                    <Badge className="bg-emerald-600 text-white border-0 text-[10px]">
                                      ● HAVE
                                    </Badge>
                                  )}
                                  {doc.status === "pending" && (
                                    <Badge className="bg-amber-600 text-white border-0 text-[10px]">
                                      ● PENDING
                                    </Badge>
                                  )}
                                  {doc.status === "missing" && (
                                    <Badge className="bg-red-600 text-white border-0 text-[10px]">
                                      ● MISSING
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  PDF · A4
                                </div>
                                <div>
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-6 text-sm text-muted-foreground italic text-center">
                              No items defined yet — add documents from register
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Auto-Populate Rules</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatic document filing based on patterns
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Edit Rules
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">
                      When document matches
                    </TableHead>
                    <TableHead>Auto-file to Section</TableHead>
                    <TableHead className="px-6">Trigger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AUTO_POPULATE_RULES.map((rule, index) => (
                    <TableRow key={index} className="hover:bg-accent/50">
                      <TableCell className="px-6">
                        <span className="font-mono text-xs">
                          {rule.pattern}
                        </span>
                      </TableCell>
                      <TableCell>{rule.section}</TableCell>
                      <TableCell className="px-6 text-sm text-muted-foreground">
                        {rule.trigger}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6 lg:h-fit">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Coverage Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-border"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(coverage / 100) * 264} 264`}
                    className={cn(
                      coverage === 100
                        ? "text-emerald-600"
                        : coverage >= 70
                          ? "text-amber-600"
                          : "text-red-600",
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-serif font-normal">
                    {Math.round(coverage)}
                    <span className="text-sm">%</span>
                  </span>
                </div>
              </div>
              <div className="font-mono text-sm mb-1">
                {totalCollected} / {totalRequired}
              </div>
              <div className="text-xs text-muted-foreground">
                documents collected
              </div>

              <div className="border-t border-border my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Complete</span>
                  <span className="font-mono">
                    {
                      DATABOOK_SECTIONS.filter(
                        (s) => s.collected === s.required,
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In Progress</span>
                  <span className="font-mono">
                    {
                      DATABOOK_SECTIONS.filter(
                        (s) => s.collected > 0 && s.collected < s.required,
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Not Started</span>
                  <span className="font-mono">
                    {DATABOOK_SECTIONS.filter((s) => s.collected === 0).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Section Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {DATABOOK_SECTIONS.map((section) => {
                const pct =
                  section.required > 0
                    ? Math.round((section.collected / section.required) * 100)
                    : 0;
                return (
                  <div
                    key={section.code}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {section.code}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-16 h-1.5 bg-border relative overflow-hidden">
                        <div
                          className={cn(
                            "absolute inset-y-0 left-0",
                            pct === 100
                              ? "bg-emerald-600"
                              : pct >= 70
                                ? "bg-amber-600"
                                : "bg-red-600",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Data Book Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  Title
                </div>
                <div className="text-sm">
                  Al Hamra Refinery Expansion — Project Data Book
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Revision
                  </div>
                  <div className="font-mono text-xs">Rev 02</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Compiler
                  </div>
                  <div className="text-xs">S. Kumar</div>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  Target Issue Date
                </div>
                <div className="font-mono text-xs">2026-12-31</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddSectionDialog
        open={addSectionOpen}
        onOpenChange={setAddSectionOpen}
      />
      <CompileDataBookDialog
        open={compileOpen}
        onOpenChange={setCompileOpen}
        sections={DATABOOK_SECTIONS}
        metadata={{
          title: "Al Hamra Refinery Expansion — Project Data Book",
          revision: "Rev 02",
          compiler: "S. Kumar",
          targetDate: "2026-12-31",
        }}
      />
    </div>
  );
}
