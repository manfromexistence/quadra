"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { useEffect, useState } from "react";

interface DocumentCodeBuilderProps {
  projectCode?: string;
  onChange: (code: string) => void;
}

const DISCIPLINES = [
  { value: "ARC", label: "Architecture" },
  { value: "STR", label: "Structural" },
  { value: "MEP", label: "MEP" },
  { value: "ELE", label: "Electrical" },
  { value: "MEC", label: "Mechanical" },
  { value: "PLB", label: "Plumbing" },
  { value: "CIV", label: "Civil" },
  { value: "GEN", label: "General" },
];

const DOCUMENT_TYPES = [
  { value: "DWG", label: "Drawing" },
  { value: "SPEC", label: "Specification" },
  { value: "RPT", label: "Report" },
  { value: "CALC", label: "Calculation" },
  { value: "STD", label: "Standard" },
  { value: "DOC", label: "Document" },
];

export function DocumentCodeBuilder({
  projectCode = "PRJ",
  onChange,
}: DocumentCodeBuilderProps) {
  const [segments, setSegments] = useState({
    project: projectCode,
    discipline: "ARC",
    type: "DWG",
    number: "0001",
  });

  const fullCode = `${segments.project}-${segments.discipline}-${segments.type}-${segments.number}`;

  useEffect(() => {
    onChange(fullCode);
  }, [fullCode, onChange]);

  const handleSegmentChange = (segment: string, value: string) => {
    setSegments((prev) => ({ ...prev, [segment]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Code Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="project-code">Project</Label>
            <Input
              id="project-code"
              value={segments.project}
              onChange={(e) =>
                handleSegmentChange("project", e.target.value.toUpperCase())
              }
              className="font-mono uppercase"
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discipline">Discipline</Label>
            <Select
              value={segments.discipline}
              onValueChange={(value) =>
                handleSegmentChange("discipline", value)
              }
            >
              <SelectTrigger id="discipline" className="font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISCIPLINES.map((disc) => (
                  <SelectItem
                    key={disc.value}
                    value={disc.value}
                    className="font-mono"
                  >
                    {disc.value} - {disc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-type">Type</Label>
            <Select
              value={segments.type}
              onValueChange={(value) => handleSegmentChange("type", value)}
            >
              <SelectTrigger id="doc-type" className="font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="font-mono"
                  >
                    {type.value} - {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-number">Number</Label>
            <Input
              id="doc-number"
              value={segments.number}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                handleSegmentChange("number", value.padStart(4, "0"));
              }}
              className="font-mono"
              maxLength={4}
              placeholder="0001"
            />
          </div>
        </div>

        <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Generated Document Code
          </p>
          <p className="font-mono text-2xl font-bold tracking-wider text-primary">
            {fullCode}
          </p>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Format:</strong> PROJECT-DISCIPLINE-TYPE-NUMBER
          </p>
          <p>
            <strong>Example:</strong> PRJ-ARC-DWG-0001 (Project Architecture
            Drawing 0001)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
