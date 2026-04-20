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
import { addDiscipline, updateDiscipline } from "@/actions/project-config";

interface DisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  discipline?: {
    id: string;
    code: string;
    name: string;
    color: string;
  };
}

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#dc2626", // red-600
  "#22c55e", // green
  "#a855f7", // purple
  "#ec4899", // pink
  "#84cc16", // lime
];

export function DisciplineModal({
  isOpen,
  onClose,
  projectId,
  discipline,
}: DisciplineModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(
    discipline?.color ?? PRESET_COLORS[0],
  );

  const isEditing = !!discipline;

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const data = {
        code: formData.get("code") as string,
        name: formData.get("name") as string,
        color: selectedColor,
      };

      if (isEditing) {
        await updateDiscipline(discipline.id, data);
      } else {
        await addDiscipline({
          projectId,
          ...data,
        });
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error saving discipline:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Discipline" : "Add Discipline"}
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
              placeholder="ARC"
              defaultValue={discipline?.code ?? ""}
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
              placeholder="Architecture"
              defaultValue={discipline?.name ?? ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`size-8 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-foreground"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            <Input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-20 h-8"
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
