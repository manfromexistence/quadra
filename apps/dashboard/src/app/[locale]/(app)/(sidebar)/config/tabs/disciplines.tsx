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
import { FileText, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { deleteDiscipline } from "@/actions/project-config";
import { DisciplineModal } from "@/components/modals/discipline-modal";

interface ConfigDisciplinesProps {
  projectId: string;
  disciplines: Array<{
    id: string;
    code: string;
    name: string;
    color: string;
    docCount: number;
  }>;
}

export const ConfigDisciplines = memo(function ConfigDisciplines({
  projectId,
  disciplines,
}: ConfigDisciplinesProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<
    (typeof disciplines)[0] | undefined
  >();

  const openAddModal = useCallback(() => {
    setEditingDiscipline(undefined);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((discipline: (typeof disciplines)[0]) => {
    setEditingDiscipline(discipline);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm("Are you sure you want to delete this discipline?")) {
        try {
          await deleteDiscipline(id);
          router.refresh();
        } catch (error) {
          console.error("Error deleting discipline:", error);
        }
      }
    },
    [router],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Disciplines</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Engineering and design disciplines used in document classification
            </p>
          </div>
          <Button size="sm" onClick={openAddModal}>
            + Add Discipline
          </Button>
        </div>

        {disciplines.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border bg-muted/30 p-12 text-center">
            <FileText className="size-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No disciplines yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started by adding your first discipline
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={openAddModal}>
                + Add Discipline
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplines.map((discipline) => (
                  <DisciplineRow
                    key={discipline.id}
                    discipline={discipline}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <DisciplineModal
        isOpen={isModalOpen}
        onClose={closeModal}
        projectId={projectId}
        discipline={editingDiscipline}
      />
    </>
  );
});

const DisciplineRow = memo(function DisciplineRow({
  discipline,
  onEdit,
  onDelete,
}: {
  discipline: {
    id: string;
    code: string;
    name: string;
    color: string;
    docCount: number;
  };
  onEdit: (discipline: any) => void;
  onDelete: (id: string) => void;
}) {
  const handleEdit = useCallback(() => {
    onEdit(discipline);
  }, [discipline, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(discipline.id);
  }, [discipline.id, onDelete]);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div
            className="size-3 rounded-sm"
            style={{ backgroundColor: discipline.color }}
          />
          <span className="font-mono text-sm font-medium">
            {discipline.code}
          </span>
        </div>
      </TableCell>
      <TableCell>{discipline.name}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {discipline.docCount} docs
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
