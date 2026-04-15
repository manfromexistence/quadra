import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const EMPHASIZED_STATUS = new Set(["active", "approved", "completed", "acknowledged", "unread"]);
const MUTED_STATUS = new Set(["draft", "archived"]);

export function EdmsStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.14em] uppercase",
        EMPHASIZED_STATUS.has(status)
          ? "border-border bg-accent text-foreground"
          : MUTED_STATUS.has(status)
            ? "border-border bg-muted text-muted-foreground"
            : "border-border bg-background text-foreground"
      )}
    >
      {formatEdmsLabel(status)}
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
