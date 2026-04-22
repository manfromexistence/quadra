"use client";

import { Button } from "@midday/ui/button";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      import("@sentry/nextjs").then((Sentry) => {
        Sentry.captureException(error);
      });
    }
  }, [error]);

  return (
    <div className="h-[calc(100vh-200px)] w-full flex items-center justify-center">
      <div className="max-w-2xl w-full text-center px-4">
        <h2 className="font-medium mb-4">Something went wrong</h2>

        <div className="text-left mb-6">
          <p className="text-sm text-[#878787] mb-2">Error Message:</p>
          <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-900 overflow-auto max-h-32">
            {error.message}
          </pre>
        </div>

        {error.stack && (
          <div className="text-left mb-6">
            <p className="text-sm text-[#878787] mb-2">Stack Trace:</p>
            <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-900 overflow-auto max-h-64">
              {error.stack}
            </pre>
          </div>
        )}

        {error.digest && (
          <p className="text-xs text-[#4a4a4a] mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <Button onClick={() => reset()} variant="outline">
          Try again
        </Button>
      </div>
    </div>
  );
}
