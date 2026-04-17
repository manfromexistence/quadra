# EDMS Pages Component Usage Guide

## Overview

This document outlines the component architecture for EDMS pages in the application.

## ✅ UPDATED: EDMS Pages Now Use Standard Dashboard UI

**As of the latest update**, all EDMS pages have been migrated to use the standard dashboard component pattern:

1. **Projects** (`/projects`)
2. **Documents** (`/documents`)
3. **Workflows** (`/workflows`)
4. **Transmittals** (`/transmittals`)
5. **Activities** (if exists)

These pages now follow the same UI pattern as Invoices, Customers, and Transactions pages.

### EDMS-Specific Components

These pages use components from `src/components/edms/`:

#### Core EDMS Components

- **`EdmsMetricCard`** - Custom metric cards with branded styling
  - Uses specific icon mapping (Building2, FileStack, GitPullRequestArrow, Send, BellRing)
  - Tone-based styling (amber, blue, emerald, rose, slate)
  - Consistent border-border bg-card pattern
  - Uppercase tracking labels with specific font sizes

- **`EdmsStatusBadge`** - Custom status badges
  - Rounded-full design
  - Uppercase tracking with specific letter-spacing
  - Three-tier styling: emphasized, muted, default
  - Custom `formatEdmsLabel()` utility function

- **`EdmsDataState`** - Fallback data indicator
  - Shows when using mock/fallback data
  - Consistent messaging pattern

#### EDMS Feature Components

- **`ProjectCreateSheet`** - Project creation dialog
- **`DocumentCreateSheet`** - Document creation dialog
- **`DocumentBulkUploadSheet`** - Bulk document upload
- **`WorkflowCreateSheet`** - Workflow creation dialog
- **`WorkflowActionSheet`** - Workflow action dialog
- **`TransmittalCreateSheet`** - Transmittal creation dialog
- **`EdmsQuickUpload`** - Quick upload widget
- **`ActivityEntryPopover`** - Activity log entries
- **`ProjectPreviewPopover`** - Project preview
- **`DocumentPreviewPopover`** - Document preview
- **`WorkflowPreviewPopover`** - Workflow preview
- **`TransmittalPreviewPopover`** - Transmittal preview

### EDMS Page Structure Pattern (Updated)

```tsx
import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { CollapsibleSummary } from "@/components/collapsible-summary";
import { EdmsDataState } from "@/components/edms/data-state";
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Page Title | Quadra EDMS",
};

export default async function EdmsPage() {
  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          {/* Metrics in CollapsibleSummary */}
          <CollapsibleSummary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
              {data.metrics.map((metric) => (
                <Link key={metric.label} href={metric.link} className="block h-full">
                  <div className="group cursor-pointer transition-all hover:scale-[1.02] h-full">
                    <EdmsMetricCard metric={metric} />
                  </div>
                </Link>
              ))}
            </div>
          </CollapsibleSummary>

          {/* Header Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Page Title
                </h1>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  Description text
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Action buttons */}
            </div>
          </div>

          {/* Data State Indicator */}
          <EdmsDataState
            isUsingFallbackData={data.isUsingFallbackData}
            message={data.statusMessage}
          />

          {/* Main Content with ErrorBoundary */}
          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle>Section Title</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Content with EdmsStatusBadge for status indicators */}
                </CardContent>
              </Card>
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
```

### Key EDMS Styling Patterns (Maintained)

1. **Headers**: `text-3xl font-semibold tracking-tight md:text-4xl`
2. **Descriptions**: `text-sm leading-6 text-muted-foreground md:text-base`
3. **Cards**: `border-border bg-card shadow-sm`
4. **Hover Effects**: `hover:bg-accent hover:shadow-md`
5. **Grid Layouts**: `grid gap-4 md:grid-cols-2 xl:grid-cols-4 auto-rows-fr`
6. **Metric Cards**: Still use `EdmsMetricCard` for branded appearance
7. **Status Badges**: Still use `EdmsStatusBadge` for consistent status display

---

## Other Pages (Standard UI)

Pages like **Invoices**, **Customers**, **Transactions**, **Testimonials** use standard components:

### Standard Components

- **`CollapsibleSummary`** - Collapsible summary section wrapper
- **`ScrollableContent`** - Scrollable content wrapper
- **`ErrorBoundary`** with **`ErrorFallback`** - Error handling
- **Standard data tables** from `src/components/tables/`
- **Page-specific headers** (e.g., `InvoiceHeader`, `CustomersHeader`)
- **Page-specific summary cards** (e.g., `InvoicesOpen`, `MostActiveClient`)

### Standard Page Structure Pattern

```tsx
import { CollapsibleSummary } from "@/components/collapsible-summary";
import { ScrollableContent } from "@/components/scrollable-content";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { ErrorFallback } from "@/components/error-fallback";

export default async function StandardPage() {
  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          {/* Summary Section */}
          <CollapsibleSummary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
              {/* Summary cards */}
            </div>
          </CollapsibleSummary>

          {/* Header */}
          <PageHeader />

          {/* Main Content */}
          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense fallback={<Skeleton />}>
              <DataTable />
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
```

---

## Key Differences Summary (After Update)

| Aspect | EDMS Pages (Updated) | Other Pages |
|--------|---------------------|-------------|
| **Wrapper** | ✅ `<ScrollableContent>` | `<ScrollableContent>` |
| **Layout** | ✅ `<CollapsibleSummary>` for metrics | `<CollapsibleSummary>` for metrics |
| **Metric Cards** | `EdmsMetricCard` (custom branded) | Page-specific summary components |
| **Status Badges** | `EdmsStatusBadge` (uppercase, rounded-full) | Standard `Badge` component |
| **Error Handling** | ✅ `ErrorBoundary` + `EdmsDataState` | `ErrorBoundary` with `ErrorFallback` |
| **Data Tables** | Direct `Table` components with custom styling | `DataTable` components from tables directory |
| **Hydration** | ✅ Wrapped in `HydrateClient` | Wrapped in `HydrateClient` |
| **Header Style** | Large titles with descriptions (after metrics) | Dedicated header components |
| **Suspense** | ✅ Used for async content | Used for async content |

### What Changed

✅ **Now Using:**
- `HydrateClient` wrapper
- `ScrollableContent` wrapper
- `CollapsibleSummary` for metrics section
- `ErrorBoundary` with `ErrorFallback`
- `Suspense` for loading states
- Metadata export

✅ **Still Using (EDMS-Specific):**
- `EdmsMetricCard` for branded metric display
- `EdmsStatusBadge` for status indicators
- `EdmsDataState` for fallback data warnings
- EDMS-specific sheets and popovers
- Custom EDMS styling patterns

---

## Migration Guidelines

### When creating new EDMS pages:

1. ✅ Use `EdmsMetricCard` for metrics
2. ✅ Use `EdmsStatusBadge` for status indicators
3. ✅ Include `EdmsDataState` for fallback data handling
4. ✅ Follow the section-based layout pattern
5. ✅ Use `border-border bg-card shadow-sm` for cards
6. ✅ Import EDMS-specific sheets and popovers from `@/components/edms/`
7. ✅ Use direct `Table` components with custom styling
8. ✅ Apply hover effects: `hover:bg-accent hover:shadow-md`

### When creating standard pages:

1. ✅ Use `ScrollableContent` wrapper
2. ✅ Use `CollapsibleSummary` for summary sections
3. ✅ Use `ErrorBoundary` with `ErrorFallback`
4. ✅ Use `HydrateClient` for data hydration
5. ✅ Use page-specific header components
6. ✅ Use `DataTable` components from tables directory
7. ✅ Use standard `Badge` component for status

---

## Component Import Paths

### EDMS Components
```tsx
import { EdmsMetricCard } from "@/components/edms/metric-card";
import { EdmsStatusBadge } from "@/components/edms/status-badge";
import { EdmsDataState } from "@/components/edms/data-state";
import { ProjectCreateSheet } from "@/components/edms/project-create-sheet";
// ... other EDMS components
```

### Standard Components
```tsx
import { CollapsibleSummary } from "@/components/collapsible-summary";
import { ScrollableContent } from "@/components/scrollable-content";
import { ErrorFallback } from "@/components/error-fallback";
import { DataTable } from "@/components/tables/[entity]/data-table";
// ... other standard components
```

### Shared UI Components (Both use these)
```tsx
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@midday/ui/table";
import { Input } from "@midday/ui/input";
import { Badge } from "@midday/ui/badge";
```

---

## Notes

- EDMS pages have a more custom, branded feel with specific typography and spacing
- Standard pages follow a more traditional dashboard pattern with collapsible sections
- Both patterns are valid and should be maintained for their respective page types
- Do not mix patterns - keep EDMS pages using EDMS components and standard pages using standard components
