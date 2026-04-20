"use client";

import { Button } from "@midday/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@midday/ui/dialog";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addDocumentType, updateDocumentType } from "@/actions/project-config";

interface DocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  documentType?: {
    id: string;
    code: string;
    name: string;
  };
}

export function DocumentTypeModal({
  isOpen,
  onClose,
  projectId,
  documentType,
}: DocumentTypeModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!documentType;

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const data = {
        code: formData.get("code") as string,
        name: formData.get("name") as string,
      };

      if (isEditing) {
        await updateDocumentType(documentType.id, data);
      } else {
        await addDocumentType({
          projectId,
          ...data,
        });
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error saving document type:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Document Type" : "Add Document Type"}
          </DialogTitle>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">
              Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              name="code"
              className="font-mono"
              placeholder="DWG"
              defaultValue={documentType?.code ?? ""}
              required
              maxLength={5}
            />
            <p className="text-xs text-muted-foreground">
              3-5 character code used in document numbering
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Drawing"
              defaultValue={documentType?.name ?? ""}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
