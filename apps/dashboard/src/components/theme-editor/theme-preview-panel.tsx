"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@midday/ui/card";
import { Checkbox } from "@midday/ui/checkbox";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { RadioGroup, RadioGroupItem } from "@midday/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@midday/ui/select";
import { Separator } from "@midday/ui/separator";
import { Slider } from "@midday/ui/slider";
import { Switch } from "@midday/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@midday/ui/tabs";
import { Textarea } from "@midday/ui/textarea";
import { useState } from "react";
import { useThemeEditorStore } from "@/store/theme-editor-store";

export function ThemePreviewPanel() {
  const themeState = useThemeEditorStore((state) => state.themeState);
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  return (
    <div className="flex h-full min-h-[70vh] flex-col border border-border bg-background">
      <div className="border-b border-border p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Preview
        </p>
        <h2 className="text-lg font-semibold">
          {themeState.currentMode === "dark" ? "Dark Mode" : "Light Mode"}
        </h2>
        <p className="text-sm text-muted-foreground">
          See your theme changes applied to real components instantly.
        </p>
      </div>

      <div className="grid flex-1 gap-4 p-4 xl:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Dashboard Overview</CardTitle>
                  <CardDescription>
                    Key metrics and interactive controls.
                  </CardDescription>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>

              <Separator />

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

              <Separator />

              <div className="space-y-2">
                <Label>Budget Allocation: {sliderValue[0]}%</Label>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  Drag the slider to adjust allocation
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>
                Input fields, dropdowns, and selection controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preview-input">Project Name</Label>
                <Input 
                  id="preview-input" 
                  placeholder="Enter project name..." 
                  defaultValue="Quadra EDMS"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preview-select">Document Type</Label>
                  <Select defaultValue="drawing">
                    <SelectTrigger id="preview-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drawing">Drawing</SelectItem>
                      <SelectItem value="specification">Specification</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="transmittal">Transmittal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preview-status">Status</Label>
                  <Select defaultValue="approved">
                    <SelectTrigger id="preview-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview-textarea">Description</Label>
                <Textarea 
                  id="preview-textarea" 
                  placeholder="Enter description..." 
                  rows={3}
                  defaultValue="This is a sample description for the theme preview."
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="preview-checkbox" 
                      checked={checkboxChecked}
                      onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
                    />
                    <Label htmlFor="preview-checkbox" className="text-sm font-normal">
                      Send notification on approval
                    </Label>
                  </div>
                  {checkboxChecked && (
                    <Badge variant="outline">Enabled</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="preview-switch" className="text-sm font-normal">
                    Enable auto-archive
                  </Label>
                  <Switch 
                    id="preview-switch" 
                    checked={switchChecked}
                    onCheckedChange={setSwitchChecked}
                  />
                </div>
                {switchChecked && (
                  <p className="text-xs text-muted-foreground pl-1">
                    Documents will be archived after 90 days
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Priority Level</Label>
                <RadioGroup defaultValue="medium">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="priority-low" />
                    <Label htmlFor="priority-low" className="text-sm font-normal">
                      Low Priority
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="priority-medium" />
                    <Label htmlFor="priority-medium" className="text-sm font-normal">
                      Medium Priority
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="priority-high" />
                    <Label htmlFor="priority-high" className="text-sm font-normal">
                      High Priority
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
              <Button>Save Changes</Button>
              <Button variant="outline">Cancel</Button>
              <Button variant="ghost">Reset</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>
                Document register with status indicators.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Document ID</TableHead>
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
                  <TableRow>
                    <TableCell className="px-6 font-mono text-xs">
                      MEC-HVAC-SPEC-0012
                    </TableCell>
                    <TableCell>Mechanical</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Rejected</Badge>
                    </TableCell>
                    <TableCell className="px-6">C</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-6 font-mono text-xs">
                      CIV-DWG-SITE-0089
                    </TableCell>
                    <TableCell>Civil</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Draft</Badge>
                    </TableCell>
                    <TableCell className="px-6">A</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tab Navigation</CardTitle>
              <CardDescription>
                Organize content into multiple sections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-3 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Project summary and key performance indicators.
                  </p>
                  <div className="flex gap-2">
                    <Badge>Active</Badge>
                    <Badge variant="secondary">On Track</Badge>
                    <Badge variant="outline">Q2 2026</Badge>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Project Manager</p>
                    <p className="text-sm text-muted-foreground">John Smith</p>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="space-y-3 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Project scope and deliverable information.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">$2.5M</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">18 months</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Team Size:</span>
                      <span className="font-medium">24 members</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="space-y-3 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Activity timeline and change history.
                  </p>
                  <div className="space-y-2">
                    <div className="flex gap-2 text-xs">
                      <span className="text-muted-foreground">2026-04-19:</span>
                      <span>Project initiated</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-muted-foreground">2026-04-18:</span>
                      <span>Design phase completed</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-muted-foreground">2026-04-15:</span>
                      <span>Approval received</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography & Colors</CardTitle>
              <CardDescription>
                Font styles and color palette.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Theme changes apply instantly across all interface elements.
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  Customizable: fonts, colors, spacing, shadows
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Color Palette
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded border bg-primary" />
                    <span className="text-xs">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded border bg-secondary" />
                    <span className="text-xs">Secondary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded border bg-accent" />
                    <span className="text-xs">Accent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded border bg-muted" />
                    <span className="text-xs">Muted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded border bg-destructive" />
                    <span className="text-xs">Destructive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded border bg-card" />
                    <span className="text-xs">Card</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Badges</CardTitle>
              <CardDescription>
                Labels and indicators in various styles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                Action buttons in all available styles and sizes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Variants
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Sizes
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">⚙</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
