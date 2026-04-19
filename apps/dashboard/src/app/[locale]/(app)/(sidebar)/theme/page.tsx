import type { Metadata } from "next";
import { ScrollableContent } from "@/components/scrollable-content";
import { ThemeEditor } from "@/components/theme-editor/editor";
import { getRequiredDashboardSessionUser } from "@/lib/edms/session";

export const metadata: Metadata = {
  title: "Theme Editor | Quadra EDMS",
  description:
    "Live-edit the default Quadra dashboard theme from inside the EDMS workspace.",
};

export default async function ThemePage() {
  await getRequiredDashboardSessionUser();

  return (
    <ScrollableContent>
      <div className="flex flex-col gap-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Appearance
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Theme Editor
          </h1>
          <p className="text-sm leading-6 text-muted-foreground md:text-base">
            The dashboard now uses the Quadra theme as the default preset.
            Adjust the live token set here and the changes will apply through
            the shared dashboard theme provider.
          </p>
        </div>

        <ThemeEditor />
      </div>
    </ScrollableContent>
  );
}
