"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@midday/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@midday/ui/form";
import { Input } from "@midday/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@midday/ui/sheet";
import { Textarea } from "@midday/ui/textarea";
import { FilePlus2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createDocument } from "@/actions/documents";
import { toast } from "@/hooks/use-toast";
import { DocumentFileUpload } from "./document-file-upload";
import { ImageCardUpload } from "./image-card-upload";

const documentStatuses = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "superseded",
] as const;

const documentCreateSchema = z.object({
  projectId: z.string().min(1, "Project is required."),
  documentNumber: z.string().trim(),
  title: z.string().trim().min(2, "Document title is required."),
  description: z.string().trim(),
  discipline: z.string().trim(),
  category: z.string().trim(),
  version: z.string().trim().min(1, "Version is required."),
  revision: z.string().trim(),
  status: z.enum(documentStatuses),
  fileName: z.string().trim().min(2, "File name is required."),
  fileSize: z.number().nonnegative().optional(),
  fileType: z.string().trim(),
  fileUrl: z.string().trim().url("Enter a valid file URL."),
  tags: z.string().trim(),
  images: z.array(z.string().url()).optional(),
});

type DocumentCreateValues = z.infer<typeof documentCreateSchema>;

const defaultValues: DocumentCreateValues = {
  projectId: "",
  documentNumber: "",
  title: "",
  description: "",
  discipline: "",
  category: "",
  version: "1.0",
  revision: "",
  status: "draft",
  fileName: "",
  fileSize: undefined,
  fileType: "pdf",
  fileUrl: "",
  tags: "",
  images: [],
};

export function DocumentCreateSheet({
  projects,
}: {
  projects: { id: string; name: string; projectNumber: string | null }[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<DocumentCreateValues>({
    resolver: zodResolver(documentCreateSchema),
    defaultValues,
  });
  const selectedProjectId = form.watch("projectId");

  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [form, isOpen]);

  const onSubmit = (values: DocumentCreateValues) => {
    startTransition(async () => {
      const result = await createDocument(values);

      if (!result.success) {
        toast({
          title: "Document creation failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Document added",
        description:
          "The document record is now available in control with its initial version.",
      });

      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>
          <FilePlus2 className="size-4" />
          Upload document
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto px-6 sm:max-w-3xl">
        <SheetHeader className="space-y-1">
          <div className="px-6 pt-6">
            <SheetTitle>Register document</SheetTitle>
            <SheetDescription>
              Capture the first controlled revision now with direct upload
              support and a URL fallback for environments where storage is still
              being finalized.
            </SheetDescription>
          </div>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-6 px-6 pb-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.projectNumber
                              ? `${project.projectNumber} - ${project.name}`
                              : project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Leave blank to auto-generate"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      If omitted, the EDMS will generate the next number from
                      the project, discipline, and category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Podium slab reinforcement details"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-24 resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="discipline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discipline</FormLabel>
                    <FormControl>
                      <Input placeholder="Structural" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Drawing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="revision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revision</FormLabel>
                    <FormControl>
                      <Input placeholder="A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File name</FormLabel>
                    <FormControl>
                      <Input placeholder="podium-slab-rebar.pdf" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fileType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File type</FormLabel>
                    <FormControl>
                      <Input placeholder="pdf" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DocumentFileUpload
              projectId={selectedProjectId}
              folder="documents"
              helperText="Upload the controlled file directly to EDMS storage. If object storage is not configured in this environment yet, you can still paste an external file URL below."
              onUploaded={(file) => {
                form.setValue("fileName", file.fileName, {
                  shouldValidate: true,
                });
                form.setValue("fileType", file.fileType, {
                  shouldValidate: true,
                });
                form.setValue("fileUrl", file.fileUrl, {
                  shouldValidate: true,
                });
                form.setValue("fileSize", file.fileSize, {
                  shouldValidate: true,
                });
              }}
            />

            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://storage.example.com/files/podium-slab-rebar.pdf"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Direct upload is preferred. External URLs remain supported
                    as a fallback path.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="podium, structural, issue-for-review"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated tags for quick retrieval.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <ImageCardUpload
                    value={field.value}
                    onChange={field.onChange}
                    label="Document images"
                    helperText="Add preview images, diagrams, or visual references (up to 5 images)"
                    maxImages={5}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <FilePlus2 className="size-4" />
                    Create document
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
