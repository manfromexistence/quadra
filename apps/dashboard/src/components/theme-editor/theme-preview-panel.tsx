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
import { Progress } from "@midday/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { useThemeEditorStore } from "@/store/theme-editor-store";

export function ThemePreviewPanel() {
  const themeState = useThemeEditorStore((state) => state.themeState);

  return (
    <div className="flex h-full min-h-[70vh] flex-col border border-border bg-background">
      <div className="border-b border-border p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Live Preview
        </p>
        <h2 className="text-lg font-semibold">
          {themeState.currentMode === "dark" ? "Dark Mode" : "Light Mode"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Preview components use the same CSS variables applied to the dashboard
          shell.
        </p>
      </div>

      <div className="grid flex-1 gap-4 p-4 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Document Control Summary</CardTitle>
                  <CardDescription>
                    Previewing Quadra theme tokens on real dashboard components.
                  </CardDescription>
                </div>
                <Badge variant="secondary">Quadra</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-2">
                    <CardDescription>Approved</CardDescription>
                    <CardTitle className="text-2xl">128</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-2">
                    <CardDescription>Under Review</CardDescription>
                    <CardTitle className="text-2xl">18</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-2">
                    <CardDescription>Transmittals</CardDescription>
                    <CardTitle className="text-2xl">9</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Portfolio completion</span>
                  <span className="font-medium">78%</span>
                </div>
                <Progress value={78} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button>Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Register Preview</CardTitle>
              <CardDescription>
                Table surfaces, borders, muted foreground, and badges.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Document</TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="px-6">Rev</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="px-6 font-mono text-xs">
                      ABD-STD-EXT-2026-01
                    </TableCell>
                    <TableCell>Structural</TableCell>
                    <TableCell>
                      <Badge>Approved</Badge>
                    </TableCell>
                    <TableCell className="px-6">B</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-6 font-mono text-xs">
                      AHR-ELE-DWG-0045
                    </TableCell>
                    <TableCell>Electrical</TableCell>
                    <TableCell>
                      <Badge variant="outline">Under Review</Badge>
                    </TableCell>
                    <TableCell className="px-6">A</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-sidebar-border/80 bg-sidebar p-4 text-sidebar-foreground shadow-sm">
            <div className="rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/70">
                Sidebar
              </p>
              <h3 className="mt-2 text-lg font-semibold">EDMS Navigation</h3>
              <div className="mt-4 space-y-2">
                <div className="rounded-xl bg-sidebar-primary px-3 py-2 text-sidebar-primary-foreground">
                  Projects
                </div>
                <div className="rounded-xl px-3 py-2">Documents</div>
                <div className="rounded-xl px-3 py-2">Workflows</div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>
                Fonts and spacing update live through the shared theme store.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Construction dashboard themes now share the same Quadra token
                source and apply through the dashboard provider without breaking
                dark mode.
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                font-sans / font-serif / font-mono variables are editable in the
                control panel.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
