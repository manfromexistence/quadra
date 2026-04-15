import { Testimonials } from "@/components/testimonials";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Customer Stories",
  description:
    "See how construction teams use Quadra to manage their projects with less paperwork.",
  path: "/testimonials",
  og: {
    title: "Customer Stories",
    description: "How construction teams manage projects with Quadra",
  },
  keywords: [
    "customer testimonials",
    "user stories",
    "quadra reviews",
    "customer success",
    "testimonials",
  ],
});

export default function Page() {
  return <Testimonials />;
}
