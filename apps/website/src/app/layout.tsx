import "@/styles/globals.css";
import { cn } from "@midday/ui/cn";
import "@midday/ui/globals.css";
import { Provider as Analytics } from "@midday/events/client";
import type { Metadata } from "next";
import { Hedvig_Letters_Sans, Hedvig_Letters_Serif } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactElement } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { baseUrl } from "./sitemap";

const hedvigSans = Hedvig_Letters_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "optional",
  variable: "--font-hedvig-sans",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "arial"],
});

const hedvigSerif = Hedvig_Letters_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "optional",
  variable: "--font-hedvig-serif",
  preload: true,
  adjustFontFallback: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Quadra — Electronic Document Management System for Construction",
    template: "%s | Quadra",
  },
  description:
    "Streamline your construction project documentation with Quadra. Manage documents, workflows, transmittals, and approvals in one powerful platform. Built for Clients, PMC, Vendors, and Subcontractors.",
  openGraph: {
    title: "Quadra — Electronic Document Management System for Construction",
    description:
      "Streamline your construction project documentation with Quadra. Manage documents, workflows, transmittals, and approvals in one powerful platform. Built for Clients, PMC, Vendors, and Subcontractors.",
    url: baseUrl,
    siteName: "Quadra",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "Quadra — Electronic Document Management System for Construction",
    description:
      "Streamline your construction project documentation with Quadra. Manage documents, workflows, transmittals, and approvals in one powerful platform. Built for Clients, PMC, Vendors, and Subcontractors.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)" },
    { media: "(prefers-color-scheme: dark)" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Quadra",
  url: "https://quadra-edms.vercel.app",
  sameAs: [],
  description:
    "Streamline your construction project documentation with Quadra. Manage documents, workflows, transmittals, and approvals in one powerful platform. Built for Clients, PMC, Vendors, and Subcontractors.",
};

export default function Layout({ children }: { children: ReactElement }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body
        className={cn(
          `${hedvigSans.variable} ${hedvigSerif.variable} font-sans`,
          "bg-background overflow-x-hidden font-sans antialiased",
        )}
      >
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="container mx-auto px-4 overflow-hidden md:overflow-visible">
              {children}
            </main>
            <Footer />
            <Analytics />
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
