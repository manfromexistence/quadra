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
          <div className="max-w-md w-full text-center">
            <h2 className="text-xl font-medium mb-4">Something went wrong</h2>
            <p className="text-sm text-gray-400 mb-6">
              We've been notified and are looking into it.
              <br />
              If this issue persists, please contact support.
            </p>

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
