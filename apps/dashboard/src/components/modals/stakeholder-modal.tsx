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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addStakeholder, updateStakeholder } from "@/actions/project-config";

interface StakeholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  stakeholder?: {
    id: string;
    stakeholderId: string;
    name: string;
    role: string;
    contact: string | null;
  };
}

const STAKEHOLDER_ROLES = [
  "Client",
  "PMC",
  "Contractor",
  "Designer",
  "Subcontractor",
  "Authority",
  "Consultant",
  "Supplier",
  "Other",
];

export function StakeholderModal({
  isOpen,
  onClose,
  projectId,
  stakeholder,
}: StakeholderModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!stakeholder;

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const data = {
        stakeholderId: formData.get("stakeholderId") as string,
        name: formData.get("name") as string,
        role: formData.get("role") as string,
        contact: (formData.get("contact") as string) || null,
      };

      if (isEditing) {
        await updateStakeholder(stakeholder.id, data);
      } else {
        await addStakeholder({
          projectId,
          ...data,
        });
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error saving stakeholder:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Stakeholder" : "Add Stakeholder"}
          </DialogTitle>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stakeholderId">
              Stakeholder ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stakeholderId"
              name="stakeholderId"
              className="font-mono"
              placeholder="CLI-001"
              defaultValue={stakeholder?.stakeholderId ?? ""}
              required
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this stakeholder
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Organization Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Client Project Management"
              defaultValue={stakeholder?.name ?? ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select name="role" defaultValue={stakeholder?.role ?? ""} required>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {STAKEHOLDER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              name="contact"
              type="email"
              placeholder="pm@client.com"
              defaultValue={stakeholder?.contact ?? ""}
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
