"use client";

import "@/styles/globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0C0C0C] text-white antialiased">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            <h2 className="text-xl font-medium mb-4">Something went wrong</h2>

            <div className="text-left mb-6">
              <p className="text-sm text-gray-400 mb-2">Error Message:</p>
              <pre className="text-xs bg-red-900/20 p-3 rounded border border-red-900 overflow-auto max-h-32">
                {error.message}
              </pre>
            </div>

            {error.stack && (
              <div className="text-left mb-6">
                <p className="text-sm text-gray-400 mb-2">Stack Trace:</p>
                <pre className="text-xs bg-red-900/20 p-3 rounded border border-red-900 overflow-auto max-h-64">
                  {error.stack}
                </pre>
              </div>
            )}

            {error.digest && (
              <p className="text-xs text-gray-600 mb-6">
                Error ID: {error.digest}
              </p>
            )}

            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
