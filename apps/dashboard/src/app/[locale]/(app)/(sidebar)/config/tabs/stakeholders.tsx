"use client";

import { Button } from "@midday/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@midday/ui/table";
import { Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteStakeholder } from "@/actions/project-config";
import { StakeholderModal } from "@/components/modals/stakeholder-modal";

interface ConfigStakeholdersProps {
  projectId: string;
  stakeholders: Array<{
    id: string;
    stakeholderId: string;
    name: string;
    role: string;
    contact: string | null;
  }>;
}

export function ConfigStakeholders({
  projectId,
  stakeholders,
}: ConfigStakeholdersProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<
    (typeof stakeholders)[0] | undefined
  >();

  function openAddModal() {
    setEditingStakeholder(undefined);
    setIsModalOpen(true);
  }

  function openEditModal(stakeholder: (typeof stakeholders)[0]) {
    setEditingStakeholder(stakeholder);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this stakeholder?")) {
      try {
        await deleteStakeholder(id);
        router.refresh();
      } catch (error) {
        console.error("Error deleting stakeholder:", error);
      }
    }
  }
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Project Stakeholders</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Organizations and parties involved in the project
            </p>
          </div>
          <Button size="sm" onClick={openAddModal}>
            + Add Stakeholder
          </Button>
        </div>

        {stakeholders.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border bg-muted/30 p-12 text-center">
            <Users className="size-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No stakeholders yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started by adding your first stakeholder
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={openAddModal}>
                + Add Stakeholder
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stakeholders.map((stakeholder) => (
                  <TableRow key={stakeholder.id}>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {stakeholder.stakeholderId}
                      </span>
                    </TableCell>
                    <TableCell>{stakeholder.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium border border-border bg-muted">
                        {stakeholder.role.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {stakeholder.contact || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(stakeholder)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(stakeholder.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <StakeholderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        stakeholder={editingStakeholder}
      />
    </>
  );
}
