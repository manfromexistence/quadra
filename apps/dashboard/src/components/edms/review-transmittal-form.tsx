"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { reviewTransmittal } from "@/actions/transmittals";
import { useToast } from "@midday/ui/use-toast";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@midday/ui/select";
import { Textarea } from "@midday/ui/textarea";

const reviewSchema = z.object({
  reviewStatus: z.enum(["approved", "approved_with_comments", "rejected"]),
  comments: z.string().trim(),
  approvalCode: z.string().trim().min(3, "Approval code is required."),
});

type ReviewValues = z.infer<typeof reviewSchema>;

export function ReviewTransmittalForm({ transmittalId }: { transmittalId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      reviewStatus: "approved_with_comments",
      comments: "",
      approvalCode: "",
    },
  });

  const onSubmit = (values: ReviewValues) => {
    startTransition(async () => {
      const result = await reviewTransmittal({
        transmittalId,
        reviewStatus: values.reviewStatus,
        comments: values.comments,
        approvalCode: values.approvalCode,
      });

      if (!result.success) {
        toast({
          title: "Review failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Review submitted",
        description: "The workflow, transmittal status, and notifications have been updated.",
      });

      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reviewStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="approved_with_comments">Approved with Comments</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-28 resize-none"
                  placeholder="Please revise column C3 dimensions as per structural calculations."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="approvalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approval code</FormLabel>
              <FormControl>
                <Input placeholder="APPROVED-WITH-COMMENTS-2026-04-15" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              Submit review
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
