"use client";

import { Button } from "@midday/ui/button";
import { Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { LinkDocumentsDialog } from "./link-documents-dialog";

interface LinkDocumentsButtonProps {
  activities: Array<{ id: string; name: string; wbs: string }>;
  documents: Array<{ code: string; title: string; rev: string }>;
}

export function LinkDocumentsButton({
  activities,
  documents,
}: LinkDocumentsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <LinkIcon className="size-4 mr-2" />
        Link Documents
      </Button>
      <LinkDocumentsDialog
        open={open}
        onOpenChange={setOpen}
        activities={activities}
        documents={documents}
      />
    </>
  );
}
