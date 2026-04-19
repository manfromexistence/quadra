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
import { ThemeScript } from "@/components/theme-script";
import { isDesktopApp } from "@/utils/desktop";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.quadra-edms.com"),
  title: "Quadra EDMS | Construction Document Management",
  description:
    "Manage construction projects, documents, workflows, and transmittals efficiently with Quadra EDMS.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
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
    { media: "(prefers-color-scheme: light)", color: "#f7f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
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
        <ThemeScript />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
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
