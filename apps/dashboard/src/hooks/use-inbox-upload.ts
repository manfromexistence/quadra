"use client";

import { LogEvents } from "@midday/events/events";
import { useToast } from "@midday/ui/use-toast";
import { stripSpecialCharacters } from "@midday/utils";
import { useOpenPanel } from "@openpanel/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { useUserQuery } from "@/hooks/use-user";
import { useTRPC } from "@/trpc/client";

export function useInboxUpload() {
  const trpc = useTRPC();
  const { data: user } = useUserQuery();
  const { track } = useOpenPanel();
  const queryClient = useQueryClient();
  const { toast, dismiss, update } = useToast();
  const toastIdRef = useRef<string | undefined>(undefined);

  // dismiss/update from useToast are new arrow functions each render;
  // keep them in a ref so the callback doesn't recreate every render.
  const toastRef = useRef({ toast, dismiss, update });
  toastRef.current = { toast, dismiss, update };

  const { mutateAsync: createInboxItem } = useMutation(
    trpc.inbox.create.mutationOptions(),
  );
  const { mutate: processAttachments } = useMutation(
    trpc.inbox.processAttachments.mutationOptions(),
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      const path = [user?.teamId, "inbox"] as string[];
      const _progress = files.map(() => 0);

      const { id } = toastRef.current.toast({
        title: `Uploading ${files.length} ${files.length === 1 ? "file" : "files"}`,
        progress: 0,
        variant: "progress",
        description: "Please do not close browser until completed",
        duration: Number.POSITIVE_INFINITY,
      });

      toastIdRef.current = id;

      try {
        // Mock upload process - just simulate progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (toastIdRef.current) {
            toastRef.current.update(toastIdRef.current, {
              id: toastIdRef.current,
              progress: i,
              title: `Uploading ${files.length} ${files.length === 1 ? "file" : "files"}`,
            });
          }
        }

        // Mock creating inbox items
        await Promise.all(
          files.map(async (file) => {
            const processedFilename = stripSpecialCharacters(file.name);
            const filePath = [...path, processedFilename];
            return createInboxItem({
              filename: processedFilename,
              mimetype: file.type,
              size: file.size,
              filePath,
            });
          }),
        );

        queryClient.invalidateQueries({
          queryKey: trpc.inbox.get.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.inbox.get.infiniteQueryKey(),
        });

        // Mock process attachments
        processAttachments(
          files.map((file) => ({
            filePath: [...path, stripSpecialCharacters(file.name)],
            mimetype: file.type,
            size: file.size,
          })),
        );

        toastRef.current.dismiss(toastIdRef.current);
        toastIdRef.current = undefined;

        track(LogEvents.InboxUpload.name, { count: files.length });
        toastRef.current.toast({
          title: "Upload successful.",
          variant: "success",
          duration: 2000,
        });
      } catch {
        queryClient.invalidateQueries({
          queryKey: trpc.inbox.get.queryKey(),
        });
        toastRef.current.dismiss(toastIdRef.current);
        toastIdRef.current = undefined;

        toastRef.current.toast({
          duration: 2500,
          variant: "error",
          title: "Something went wrong please try again.",
        });
      }
    },
    [user?.teamId, queryClient, trpc, createInboxItem, processAttachments],
  );

  const openFilePicker = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept =
      "image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif,application/pdf";
    input.onchange = () => {
      if (input.files?.length) {
        uploadFiles(Array.from(input.files));
      }
    };
    input.click();
  }, [uploadFiles]);

  return { openFilePicker, uploadFiles };
}
