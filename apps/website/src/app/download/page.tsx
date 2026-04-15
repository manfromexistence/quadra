import { Download } from "@/components/download";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Download",
  description:
    "Download Quadra for Mac. Your construction projects, always one click away. Access your project documentation directly from your desktop.",
  path: "/download",
  og: {
    title: "Download",
    description: "Quadra for Mac — always one click away",
  },
});

export default function Page() {
  return <Download />;
}
