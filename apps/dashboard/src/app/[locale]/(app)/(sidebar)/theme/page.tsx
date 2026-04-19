import type { Metadata } from "next";
import { ScrollableContent } from "@/components/scrollable-content";
import { ThemeEditor } from "@/components/theme-editor/editor";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "Theme Editor | Quadra EDMS",
  description:
    "Customize your dashboard appearance with the Quadra theme editor.",
};

export default async function ThemePage() {
  await getRequiredDashboardSessionUser();

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6 pt-4">
        <div className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Theme Editor
          </h1>
          <p className="text-sm leading-6 text-muted-foreground md:text-base">
            Customize colors, typography, and layout to match your brand
            identity.
          </p>
        </div>

        <ThemeEditor />
      </div>
    </ScrollableContent>
  );
}
