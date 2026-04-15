import { TimeTracking } from "@/components/time-tracking";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Project Time Tracking for Construction Teams",
  description:
    "Track project hours with ease. Get monthly breakdowns, link time to projects and tasks, and generate reports. Built for construction professionals and project managers.",
  path: "/time-tracking",
  og: {
    title: "Time Tracking",
    description: "Project hours, monthly breakdowns, and reports",
  },
  keywords: [
    "time tracking",
    "project hours",
    "time tracker",
    "project time tracking",
    "construction time management",
  ],
});

export default function Page() {
  return <TimeTracking />;
}
