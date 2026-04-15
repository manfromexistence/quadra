import Image from "next/image";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Story",
  description:
    "Why we built Quadra. Learn about our mission to help construction teams manage project documentation efficiently without the manual work.",
  path: "/story",
  og: { title: "Our Story", description: "Why we built Quadra" },
});

export default function StoryPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-32 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {/* Title */}
            <div className="space-y-4 text-center">
              <h1 className="font-serif text-3xl lg:text-3xl xl:text-3xl 2xl:text-3xl 3xl:text-4xl leading-tight lg:leading-tight xl:leading-[1.3] text-foreground">
                Why we started Quadra
              </h1>
            </div>

            {/* Content */}
            <div className="prose prose-sm sm:prose-base max-w-none space-y-8 font-sans text-foreground">
              {/* The problem */}
              <section className="space-y-4">
                <h2 className="font-sans text-base text-foreground">
                  The problem
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Managing construction project documentation has always been complex. Documents, workflows, transmittals, and approvals scattered across emails, folders, and different systems.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Construction teams need to collaborate across multiple stakeholders - Clients, PMC, Vendors, and Subcontractors. But most document management tools are either too generic or too complicated, requiring extensive training and setup.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Documents get lost in email threads. Version control becomes a nightmare. Approval workflows are manual and time-consuming. To understand project status, teams have to chase people, dig through folders, and piece together information from multiple sources.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  For construction professionals, that overhead slows down projects and creates risks. You are not lacking documents. You are lacking a system that keeps everything organized and accessible.
                </p>
              </section>

              {/* Divider */}
              <div className="flex items-center justify-center py-8">
                <div className="h-px w-full max-w-xs border-t border-border" />
              </div>

              {/* The idea */}
              <section className="space-y-4">
                <h2 className="font-sans text-base text-foreground">
                  The idea
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We did not want to build another generic document management tool. We wanted to build a system specifically designed for construction project workflows.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Quadra keeps construction documents, workflows, and approvals connected as projects progress. Documents, transmittals, workflows, and team members should not live in silos. They should work together and reflect what is actually happening on your projects.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Instead of hunting for information, Quadra brings it to you. Clear notifications, status updates, and approval workflows help you understand what has changed, what needs attention, and what is on track. This way you stay informed without constantly checking folders or chasing emails.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Quadra is built for construction teams who need role-based access, version control, and audit trails. It keeps everything organized and compliant so your projects run smoothly.
                </p>
              </section>

              {/* Divider */}
              <div className="flex items-center justify-center py-8">
                <div className="h-px w-full max-w-xs border-t border-border" />
              </div>

              {/* What we are focused on */}
              <section className="space-y-4">
                <h2 className="font-sans text-base text-foreground">
                  What we are focused on
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Quadra is built for construction professionals who manage complex projects with multiple stakeholders and need to maintain control over documentation without drowning in paperwork.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We focus on reducing manual document handling, maintaining version control and audit trails, streamlining approval workflows, and making it easy to understand project status at a glance. Most importantly, we build software that supports construction workflows naturally.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our goal is simple. When you manage construction projects, you should not have to spend your time chasing documents and approvals.
                </p>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Your project documentation should stay organized and accessible as work progresses.
                </p>
              </section>
            </div>

            {/* Founder Image */}
            <div className="w-full space-y-3">
              <Image
                src="/founder.png"
                alt="Founder"
                width={1200}
                height={450}
                className="w-full h-[350px] sm:h-[450px] object-cover object-center"
                priority
              />
              <div className="text-left">
                <p className="font-sans text-sm text-primary">
                  Mohammad
                </p>
                <p className="font-sans text-sm text-muted-foreground">
                  Founder, Quadra
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
