import "@/styles/globals.css";
import { cn } from "@midday/ui/cn";
import "@midday/ui/globals.css";
import { Provider as Analytics } from "@midday/events/client";
import { Toaster } from "@midday/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactElement } from "react";
import { DesktopHeader } from "@/components/desktop-header";
import { isDesktopApp } from "@/utils/desktop";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.quadra-edms.com"),
  title: "Quadra EDMS | Construction Document Management",
  description:
    "Manage construction projects, documents, workflows, and transmittals efficiently with Quadra EDMS.",
  twitter: {
    title: "Quadra EDMS | Construction Document Management",
    description:
      "Manage construction projects, documents, workflows, and transmittals efficiently with Quadra EDMS.",
  },
  openGraph: {
    title: "Quadra EDMS | Construction Document Management",
    description:
      "Manage construction projects, documents, workflows, and transmittals efficiently with Quadra EDMS.",
    url: "https://appquadraedms.vercel.app",
    siteName: "Quadra EDMS",
    locale: "en_US",
    type: "website",
  },
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Use Inter for both sans and serif as fallback
const hedvigSans = inter;
const hedvigSerif = inter;

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

export default async function Layout({
  children,
  params,
}: {
  children: ReactElement;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isDesktop = await isDesktopApp();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(isDesktop && "desktop")}
    >
      <head>
        {process.env.NODE_ENV === "development" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  if (typeof window === 'undefined') return;
                  
                  // Store original console methods
                  const originalWarn = console.warn;
                  const originalLog = console.log;
                  const originalInfo = console.info;
                  const originalError = console.error;
                  
                  // Completely override console.warn - suppress ALL warnings in development
                  console.warn = function(...args) {
                    // In development, we only want to see actual application warnings
                    // Suppress all framework/tooling warnings
                    return;
                  };
                  
                  // Override console.log to suppress development noise
                  console.log = function(...args) {
                    const message = args.join(' ');
                    
                    // Allow only actual application logs (not framework logs)
                    if (
                      message.includes('[HMR]') ||
                      message.includes('[Fast Refresh]') ||
                      message.includes('forward-logs-shared.ts') ||
                      message.includes('connected') ||
                      message.includes('rebuilding') ||
                      message.includes('done in') ||
                      message.includes('Download the React DevTools') ||
                      message.includes('>> query') ||
                      message.includes('<< query') ||
                      message.includes('>> mutation') ||
                      message.includes('<< mutation') ||
                      message.includes('[Realtime Mock]') ||
                      message.includes('Would subscribe') ||
                      message.includes('Would unsubscribe') ||
                      message.includes('IncrementalCache') ||
                      message.includes('FileSystemCache') ||
                      message.includes('use-cache')
                    ) {
                      return;
                    }
                    
                    return originalLog.apply(console, args);
                  };
                  
                  // Override console.info
                  console.info = function(...args) {
                    const message = args.join(' ');
                    if (
                      message.includes('[HMR]') ||
                      message.includes('[Fast Refresh]') ||
                      message.includes('connected') ||
                      message.includes('rebuilding')
                    ) {
                      return;
                    }
                    return originalInfo.apply(console, args);
                  };
                  
                  // Keep console.error for actual errors, but filter out development noise
                  console.error = function(...args) {
                    const message = args.join(' ');
                    
                    // Suppress development-related errors that aren't real issues
                    if (
                      message.includes('was preloaded using link preload') ||
                      message.includes('Download the React DevTools') ||
                      message.includes('Understand this warning') ||
                      message.includes('Understand this error')
                    ) {
                      return;
                    }
                    
                    return originalError.apply(console, args);
                  };
                  
                  // Intercept and suppress browser warnings at the window level
                  const originalOnError = window.onerror;
                  window.onerror = function(message, source, lineno, colno, error) {
                    if (typeof message === 'string') {
                      if (
                        message.includes('was preloaded using link preload') ||
                        message.includes('Download the React DevTools') ||
                        message.includes('Understand this warning')
                      ) {
                        return true; // Prevent default error handling
                      }
                    }
                    
                    if (originalOnError) {
                      return originalOnError.call(this, message, source, lineno, colno, error);
                    }
                    return false;
                  };
                  
                  // Suppress unhandled promise rejections for development warnings
                  window.addEventListener('unhandledrejection', function(event) {
                    if (event.reason && typeof event.reason === 'string') {
                      if (
                        event.reason.includes('was preloaded using link preload') ||
                        event.reason.includes('Download the React DevTools')
                      ) {
                        event.preventDefault();
                        return;
                      }
                    }
                  });
                  
                  // Override the global error handler for resource loading errors
                  window.addEventListener('error', function(event) {
                    if (event.message && typeof event.message === 'string') {
                      if (
                        event.message.includes('was preloaded using link preload') ||
                        event.message.includes('Download the React DevTools')
                      ) {
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                      }
                    }
                  }, true);
                  
                })();
              `,
            }}
          />
        )}
      </head>
      <body
        className={cn(
          `${hedvigSans.variable} ${hedvigSerif.variable} font-sans`,
          "whitespace-pre-line overscroll-none antialiased",
        )}
      >
        <DesktopHeader />

        <NuqsAdapter>
          <Providers locale={locale}>
            {children}
            <Toaster />
          </Providers>
          <Analytics />
        </NuqsAdapter>
      </body>
    </html>
  );
}
