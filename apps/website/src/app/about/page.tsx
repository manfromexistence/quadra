import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "About",
  description:
    "About Quadra. Learn more about the team and company behind your construction document management system.",
  path: "/about",
  og: {
    title: "About Quadra",
    description: "The team behind your construction EDMS",
  },
});

export default function AboutPage() {
  return <div>AboutPage</div>;
}
