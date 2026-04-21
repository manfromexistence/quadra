import { Button } from "@midday/ui/button";
import { Card } from "@midday/ui/card";
import { FilePlus, FolderPlus, Search, Sparkles } from "lucide-react";
import Link from "next/link";

interface ImprovedEmptyStateProps {
  type:
    | "documents"
    | "projects"
    | "transmittals"
    | "workflows"
    | "notifications";
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function ImprovedEmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
}: ImprovedEmptyStateProps) {
  const content = {
    documents: {
      icon: FilePlus,
      defaultTitle: "No documents yet",
      defaultDescription:
        "Get started by uploading your first document or creating a new one",
      defaultActionLabel: "Upload Documents",
      defaultActionHref: "/documents/new",
    },
    projects: {
      icon: FolderPlus,
      defaultTitle: "No projects yet",
      defaultDescription:
        "Create a project to start managing your documents and workflows",
      defaultActionLabel: "Create Project",
      defaultActionHref: "/projects/new",
    },
    transmittals: {
      icon: Sparkles,
      defaultTitle: "No transmittals yet",
      defaultDescription:
        "Transmittals track document exchanges between parties",
      defaultActionLabel: "Create Transmittal",
      defaultActionHref: "/transmittals/new",
    },
    workflows: {
      icon: Search,
      defaultTitle: "No workflows yet",
      defaultDescription:
        "Workflows help automate document review and approval processes",
      defaultActionLabel: "Create Workflow",
      defaultActionHref: "/workflows/new",
    },
    notifications: {
      icon: Sparkles,
      defaultTitle: "No notifications",
      defaultDescription: "You're all caught up! Check back later for updates",
      defaultActionLabel: null,
      defaultActionHref: null,
    },
  };

  const config = content[type];
  const Icon = config.icon;

  return (
    <Card className="border-border bg-card shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="mb-6 rounded-full bg-muted p-6">
          <Icon className="size-12 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">
          {title || config.defaultTitle}
        </h3>
        <p className="mb-6 max-w-md text-muted-foreground">
          {description || config.defaultDescription}
        </p>
        {(actionLabel || config.defaultActionLabel) && (
          <Button asChild>
            <Link href={actionHref || config.defaultActionHref || "#"}>
              {actionLabel || config.defaultActionLabel}
            </Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
