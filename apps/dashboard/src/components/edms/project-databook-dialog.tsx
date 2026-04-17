"use client";

import { BookOpen, Download, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { generateProjectDataBook, getProjectDataBookDocuments } from "@/actions/project-databook";
import { toast } from "@/hooks/use-toast";
import { Button } from "@midday/ui/button";
import { Checkbox } from "@midday/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@midday/ui/dialog";
import { ScrollArea } from "@midday/ui/scroll-area";

interface ProjectDataBookDialogProps {
  projectId: string;
  projectName: string;
}

interface DataBookDocument {
  id: string;
  documentNumber: string;
  title: string;
  discipline: string | null;
  category: string | null;
  revision: string | null;
  fileUrl: string;
  fileName: string;
}

export function ProjectDataBookDialog({ projectId, projectName }: ProjectDataBookDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<DataBookDocument[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      startTransition(async () => {
        const result = await getProjectDataBookDocuments(projectId);
        if (result.success && result.data) {
          setDocuments(result.data.documents);
          // Select all documents by default
          setSelectedDocs(new Set(result.data.documents.map((d) => d.id)));
        } else {
          toast({
            title: "Failed to load documents",
            description: !result.success
              ? result.error.message
              : "Could not fetch project documents",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      });
    }
  }, [isOpen, projectId]);

  const toggleDocument = (docId: string) => {
    setSelectedDocs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedDocs.size === documents.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(documents.map((d) => d.id)));
    }
  };

  const handleGenerate = () => {
    if (selectedDocs.size === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to compile.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await generateProjectDataBook(projectId, Array.from(selectedDocs));

      if (result.success && result.data) {
        toast({
          title: "Data Book Generated",
          description: `Successfully compiled ${selectedDocs.size} document(s) into ${result.data.fileName}.`,
        });

        // Trigger download
        window.open(result.data.downloadUrl, "_blank");

        setIsOpen(false);
      } else {
        toast({
          title: "Generation failed",
          description: !result.success
            ? result.error.message
            : "Failed to generate Project Data Book",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BookOpen className="size-4" />
          Project Data Book
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generate Project Data Book</DialogTitle>
          <DialogDescription>
            Compile all approved final documents into a single PDF for project closeout and client
            delivery. Select the documents to include in the compilation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <p className="font-medium">{projectName}</p>
              <p className="text-sm text-muted-foreground">
                {documents.length} document(s) available
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              disabled={isLoading || documents.length === 0}
            >
              {selectedDocs.size === documents.length ? "Deselect All" : "Select All"}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
              <p className="text-muted-foreground">
                No documents found for this project. Upload and approve documents to generate a
                Project Data Book.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-lg border border-border">
              <div className="space-y-2 p-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3 transition-colors hover:bg-muted/30"
                  >
                    <Checkbox
                      checked={selectedDocs.has(doc.id)}
                      onCheckedChange={() => toggleDocument(doc.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{doc.documentNumber}</p>
                          <p className="text-sm text-muted-foreground">{doc.title}</p>
                        </div>
                        {doc.revision && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                            Rev {doc.revision}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {doc.discipline && <span>{doc.discipline}</span>}
                        {doc.category && <span>• {doc.category}</span>}
                        <span>• {doc.fileName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <p className="font-medium">Selected: {selectedDocs.size} document(s)</p>
              <p className="text-sm text-muted-foreground">
                These documents will be compiled into a single PDF
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isPending || selectedDocs.size === 0 || isLoading}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Generate Data Book
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


