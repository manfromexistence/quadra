import { DatabaseZap } from "lucide-react";

export function EdmsDataState({
  isUsingFallbackData,
  message,
}: {
  isUsingFallbackData: boolean;
  message: string | null;
}) {
  if (!isUsingFallbackData || !message) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-card px-4 py-3 text-sm">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-foreground">
        <DatabaseZap className="size-4" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">Live EDMS data is not ready yet</p>
        <p className="leading-6 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
