import { Pricing } from "@/components/pricing";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Pricing",
  description:
    "Simple, transparent pricing for Quadra. Start free and upgrade as you grow. Document management, workflows, and transmittals for construction teams.",
  path: "/pricing",
  og: { title: "Pricing", description: "Start free, upgrade as you grow" },
  keywords: [
    "quadra pricing",
    "construction edms pricing",
    "document management software cost",
    "construction software pricing",
  ],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Quadra",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, macOS",
  description:
    "Construction document management software for workflows, transmittals, approvals, and project documentation.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan available",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "100",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Pricing />
    </>
  );
}
