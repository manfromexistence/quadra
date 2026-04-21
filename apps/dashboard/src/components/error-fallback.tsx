"use client";

import { Button } from "@midday/ui/button";
import { useRouter } from "next/navigation";

export function ErrorFallback({ error }: { error?: Error }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-md font-semibold">Something went wrong</h2>
        {error && (
          <details className="text-xs text-muted-foreground text-left">
            <summary className="cursor-pointer hover:text-foreground">
              Error details
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
      <Button onClick={() => router.refresh()} variant="outline">
        Try again
      </Button>
    </div>
  );
}
