import { Transactions } from "@/components/transactions";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Construction Document Management & Project Tracking",
  description:
    "Track all your project documents in one place. Automatically organize and manage documents, workflows, and transmittals. Built for construction teams.",
  path: "/transactions",
  og: {
    title: "Documents",
    description: "Every document, automatically organized and tracked",
  },
  keywords: [
    "document tracking",
    "construction documents",
    "document management",
    "document organization",
    "construction project management",
  ],
});

export default function Page() {
  return <Transactions />;
}
