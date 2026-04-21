"use client";

import { Button } from "@midday/ui/button";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { deleteDocumentType } from "@/actions/project-config";
import { DocTypesTable } from "@/components/doc-types-table";
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
            <DocTypesTable
              documentTypes={documentTypes}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
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
