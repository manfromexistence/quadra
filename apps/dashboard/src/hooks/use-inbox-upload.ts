"use client";

import { useToast } from "@midday/ui/use-toast";
import { useCallback, useRef } from "react";

export function useInboxUpload() {
  const { toast, dismiss, update } = useToast();
  const toastIdRef = useRef<string | undefined>(undefined);

  // dismiss/update from useToast are new arrow functions each render;
  // keep them in a ref so the callback doesn't recreate each render.
  const toastRef = useRef({ toast, dismiss, update });
  toastRef.current = { toast, dismiss, update };

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;

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

      toastRef.current.dismiss(toastIdRef.current);
      toastIdRef.current = undefined;

      toastRef.current.toast({
        title: "Upload successful.",
        variant: "success",
        duration: 2000,
      });
    } catch {
      toastRef.current.dismiss(toastIdRef.current);
      toastIdRef.current = undefined;

      toastRef.current.toast({
        duration: 2500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    }
  }, []);

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
