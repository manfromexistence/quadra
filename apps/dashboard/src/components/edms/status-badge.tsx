import { Badge } from "@midday/ui/badge";
import { cn } from "@midday/ui/cn";

const EMPHASIZED_STATUS = new Set([
  "active",
  "approved",
  "completed",
  "acknowledged",
  "unread",
]);
const MUTED_STATUS = new Set(["draft", "archived"]);
const PURPOSE_CODES = new Set(["IFR", "IFA", "IFC", "IFI", "VOID"]);

export function EdmsStatusBadge({ status }: { status: string }) {
  const upperStatus = status.toUpperCase();
  const isPurposeCode = PURPOSE_CODES.has(upperStatus);

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.14em] uppercase font-mono",
        isPurposeCode &&
          upperStatus === "IFR" &&
          "border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
        isPurposeCode &&
          upperStatus === "IFA" &&
          "border-blue-600/30 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
        isPurposeCode &&
          upperStatus === "IFC" &&
          "border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
        isPurposeCode &&
          upperStatus === "IFI" &&
          "border-slate-600/30 bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400",
        isPurposeCode &&
          upperStatus === "VOID" &&
          "border-red-600/30 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
        !isPurposeCode &&
          EMPHASIZED_STATUS.has(status) &&
          "border-border bg-accent text-foreground",
        !isPurposeCode &&
          MUTED_STATUS.has(status) &&
          "border-border bg-muted text-muted-foreground",
        !isPurposeCode &&
          !EMPHASIZED_STATUS.has(status) &&
          !MUTED_STATUS.has(status) &&
          "border-border bg-background text-foreground",
      )}
    >
      {isPurposeCode ? upperStatus : formatEdmsLabel(status)}
    </Badge>
  );
}

export function formatEdmsLabel(value: string | null | undefined) {
  if (!value) {
    return "Unassigned";
  }

  if (value.toLowerCase() === "pmc") {
    return "PMC";
  }

  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
