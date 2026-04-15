import { StartPage } from "@/components/startpage";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Quadra — Electronic Document Management System for Construction",
  description:
    "Streamline your construction project documentation with Quadra. Manage documents, workflows, transmittals, and approvals in one powerful platform. Built for Clients, PMC, Vendors, and Subcontractors.",
  path: "/",
  og: {
    title: "Quadra",
    description: "Electronic Document Management System for Construction",
  },
});

export default function Page() {
  return <StartPage />;
}
