"use client";

import { Button } from "@midday/ui/button";
import { Loader2, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { acknowledgeTransmittal } from "@/actions/transmittals";
import { toast } from "@/hooks/use-toast";

export function TransmittalAcknowledgeButton({
  transmittalId,
  isActionable,
}: {
  transmittalId: string;
  isActionable: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      disabled={!isActionable || isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await acknowledgeTransmittal({ transmittalId });

          if (!result.success) {
            toast({
              title: "Acknowledgement failed",
              description: result.error.message,
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "Transmittal acknowledged",
            description:
              "The package status has been updated for the project team.",
          });

          router.refresh();
        });
      }}
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Saving
        </>
      ) : (
        <>
          <MailCheck className="size-4" />
          Acknowledge
        </>
      )}
    </Button>
  );
}
