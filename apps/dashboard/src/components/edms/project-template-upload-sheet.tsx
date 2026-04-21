"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@midday/ui/button";
import {
  Form,
  FormControl,
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
import { Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

const templateTypes = [
  "letter",
  "memo",
  "mom",
  "crs",
  "tq",
  "rfi",
  "transmittal",
  "other",
] as const;

const templateCategories = [
  "Correspondence",
  "Technical",
  "Commercial",
  "Legal",
  "Quality",
  "Safety",
  "Other",
] as const;

const uploadTemplateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Template name must be at least 2 characters.")
    .max(255, "Template name is too long."),
  type: z.enum(templateTypes),
  category: z.enum(templateCategories),
  description: z.string().trim().max(500, "Description is too long."),
  file: z.any().refine((file) => file?.size > 0, "File is required."),
  isGlobal: z.boolean().optional().default(true),
});

type UploadTemplateFormValues = z.infer<typeof uploadTemplateFormSchema>;

const defaultValues: UploadTemplateFormValues = {
  name: "",
  type: "letter",
  category: "Correspondence",
  description: "",
  file: undefined,
  isGlobal: true,
};

export function ProjectTemplateUploadSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<UploadTemplateFormValues>({
    resolver: zodResolver(uploadTemplateFormSchema),
    defaultValues,
  });

  const onSubmit = async (values: UploadTemplateFormValues) => {
    startTransition(async () => {
      try {
        const { nanoid } = await import("nanoid");
        const { db } = await import("@/db");
        const { projectTemplates } = await import(
          "@/db/schema/project-templates"
        );

        await db.insert(projectTemplates).values({
          id: nanoid(),
          name: values.name,
          description: values.description || null,
          category: values.category,
          disciplines: null,
          documentTypes: null,
          workflowSteps: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        toast({
          title: "Template uploaded",
          description: `"${values.name}" has been added to the library`,
        });

        setIsOpen(false);
        form.reset(defaultValues);
        router.refresh();
      } catch (error) {
        console.error("Failed to upload template:", error);
        toast({
          title: "Upload failed",
          description: "An error occurred while uploading the template",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Upload Template
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full px-0 sm:max-w-2xl">
        <SheetHeader className="space-y-1 px-6 pt-6">
          <SheetTitle>Upload Project Template</SheetTitle>
          <SheetDescription>
            Add a new template to the library for use across projects.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8 space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Standard Letter Template"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templateTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.toUpperCase()}
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templateCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Standard letter format for official correspondence"
                        className="min-h-20 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template file</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".doc,.docx,.xls,.xlsx,.pdf"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
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
                      Uploading
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      Upload Template
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
