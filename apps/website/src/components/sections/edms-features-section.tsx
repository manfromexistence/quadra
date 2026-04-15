"use client";

import { track } from "@midday/events/client";
import { LogEvents } from "@midday/events/events";
import { Icons } from "@midday/ui/icons";
import Link from "next/link";

export function EdmsFeaturesSection() {
  return (
    <section className="bg-background py-12 sm:py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12 lg:mb-16">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground">
            Built for Construction Teams
          </h2>
          <p className="font-sans text-base lg:text-lg text-muted-foreground leading-normal max-w-2xl mx-auto">
            Manage every aspect of your construction project documentation from a single platform
          </p>
        </div>

        <div className="space-y-4">
          {/* Top Row - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <Link
              href="/file-storage"
              className="group relative overflow-hidden bg-background border border-border p-6 sm:p-8 hover:bg-secondary hover:border-foreground/20 transition-all duration-200 touch-manipulation"
              style={{ WebkitTapHighlightColor: "transparent" }}
              onClick={() =>
                track({
                  event: LogEvents.CTA.name,
                  channel: LogEvents.CTA.channel,
                  label: "Document Management",
                  position: "edms_features",
                })
              }
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 mb-4">
                    <Icons.Vault className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-sans text-foreground mb-2">
                    Document Vault
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Centralized storage with version control, audit trails, and role-based access for all project documents
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/transactions"
              className="group relative overflow-hidden bg-background border border-border p-6 sm:p-8 hover:bg-secondary hover:border-foreground/20 transition-all duration-200 touch-manipulation"
              style={{ WebkitTapHighlightColor: "transparent" }}
              onClick={() =>
                track({
                  event: LogEvents.CTA.name,
                  channel: LogEvents.CTA.channel,
                  label: "Transmittals",
                  position: "edms_features",
                })
              }
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 mb-4">
                    <Icons.Transactions className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-sans text-foreground mb-2">
                    Transmittals
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Track document submissions between Clients, PMC, Vendors, and Subcontractors with automated notifications
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/invoicing"
              className="group relative overflow-hidden bg-background border border-border p-6 sm:p-8 hover:bg-secondary hover:border-foreground/20 transition-all duration-200 touch-manipulation"
              style={{ WebkitTapHighlightColor: "transparent" }}
              onClick={() =>
                track({
                  event: LogEvents.CTA.name,
                  channel: LogEvents.CTA.channel,
                  label: "Workflows",
                  position: "edms_features",
                })
              }
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 mb-4">
                    <Icons.Invoice className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-sans text-foreground mb-2">
                    Approval Workflows
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Streamline document approvals with customizable workflows and real-time status tracking
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Middle Row - 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <Link
              href="/customers"
              className="group relative overflow-hidden bg-background border border-border p-6 sm:p-8 hover:bg-secondary hover:border-foreground/20 transition-all duration-200 touch-manipulation"
              style={{ WebkitTapHighlightColor: "transparent" }}
              onClick={() =>
                track({
                  event: LogEvents.CTA.name,
                  channel: LogEvents.CTA.channel,
                  label: "Stakeholder Management",
                  position: "edms_features",
                })
              }
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 mb-4">
                    <Icons.Customers className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-sans text-foreground mb-2">
                    Stakeholder Management
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Manage relationships with Clients, PMC, Vendors, and Subcontractors in one organized system
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/insights"
              className="group relative overflow-hidden bg-secondary border border-border p-6 sm:p-8 hover:border-foreground/20 transition-all duration-200 touch-manipulation"
              style={{ WebkitTapHighlightColor: "transparent" }}
              onClick={() =>
                track({
                  event: LogEvents.CTA.name,
                  channel: LogEvents.CTA.channel,
                  label: "Project Insights",
                  position: "edms_features",
                })
              }
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 mb-4">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-sans text-foreground mb-2">
                    Project Insights
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Real-time dashboards showing document status, pending approvals, and project progress at a glance
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Bottom Row - Full Width CTA */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <a
              href="https://app-quadra.vercel.app/"
              onClick={() =>
                track({
                  event: LogEvents.CTA.name,
                  channel: LogEvents.CTA.channel,
                  label: "Start managing projects",
                  position: "edms_features_cta",
                })
              }
              className="relative overflow-hidden bg-primary/5 border border-primary/20 p-6 sm:p-8 lg:p-10 transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 group touch-manipulation"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <p className="text-xs tracking-wide text-primary/80 mb-2">
                    Ready to streamline your construction documentation?
                  </p>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif text-foreground mb-3">
                    Start managing your projects with Quadra
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                    Join construction teams who have eliminated manual document handling and reduced approval times by 60%
                  </p>
                </div>
                <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                  <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform duration-200">
                    <span className="text-sm font-sans">Get started</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    14-day free trial
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
