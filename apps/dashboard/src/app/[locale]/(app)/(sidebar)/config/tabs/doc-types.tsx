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
import { deleteDocumentType } from "@/actions/project-config";
import { DocumentTypeModal } from "@/components/modals/document-type-modal";

interface ConfigDocTypesProps {
  projectId: string;
  documentTypes: Array<{
    id: string;
    code: string;
    name: string;
    docCount: number;
  }>;
}

const DocumentTypeRow = memo(
  ({
    docType,
    onEdit,
    onDelete,
  }: {
    docType: ConfigDocTypesProps["documentTypes"][0];
    onEdit: (docType: ConfigDocTypesProps["documentTypes"][0]) => void;
    onDelete: (id: string) => void;
  }) => (
    <TableRow>
      <TableCell>
        <span className="font-mono text-sm font-medium">{docType.code}</span>
      </TableCell>
      <TableCell>{docType.name}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {docType.docCount} docs
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(docType)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(docType.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ),
);

DocumentTypeRow.displayName = "DocumentTypeRow";

export const ConfigDocTypes = memo(function ConfigDocTypes({
  projectId,
  documentTypes,
}: ConfigDocTypesProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocType, setEditingDocType] = useState<
    (typeof documentTypes)[0] | undefined
  >();

  const openAddModal = useCallback(() => {
    setEditingDocType(undefined);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((docType: (typeof documentTypes)[0]) => {
    setEditingDocType(docType);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm("Are you sure you want to delete this document type?")) {
        try {
          await deleteDocumentType(id);
          router.refresh();
        } catch (error) {
          console.error("Error deleting document type:", error);
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
            <h3 className="text-lg font-semibold">Document Types</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Categories of documents used in the project
            </p>
          </div>
          <Button size="sm" onClick={openAddModal}>
            + Add Type
          </Button>
        </div>

        {documentTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border bg-muted/30 p-12 text-center">
            <FileText className="size-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              No document types yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started by adding your first document type
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={openAddModal}>
                + Add Type
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
                {documentTypes.map((docType) => (
                  <DocumentTypeRow
                    key={docType.id}
                    docType={docType}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <DocumentTypeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        projectId={projectId}
        documentType={editingDocType}
      />
    </>
  );
});
