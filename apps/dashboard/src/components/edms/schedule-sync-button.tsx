"use client";

import { Button } from "@midday/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { ScheduleSyncDialog } from "./schedule-sync-dialog";

export function ScheduleSyncButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <RefreshCw className="size-4 mr-2" />
        Sync Schedule
      </Button>
      <ScheduleSyncDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
