"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BellRing, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateNotificationPreferences } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

const notificationPreferencesSchema = z.object({
  documentSubmission: z.boolean(),
  reviewRequest: z.boolean(),
  approvalDecision: z.boolean(),
  transmittalUpdate: z.boolean(),
  emailNotifications: z.boolean(),
});

type NotificationPreferencesValues = z.infer<typeof notificationPreferencesSchema>;

export function NotificationPreferencesForm({
  defaultValues,
}: {
  defaultValues: NotificationPreferencesValues;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<NotificationPreferencesValues>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues,
  });

  const onSubmit = (values: NotificationPreferencesValues) => {
    startTransition(async () => {
      const result = await updateNotificationPreferences(values);

      if (!result.success) {
        toast({
          title: "Preference update failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });

      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>
          Control which EDMS events should appear in your inbox and whether matching alerts should
          also be sent by email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <PreferenceToggle
              control={form.control}
              name="documentSubmission"
              title="Document submissions"
              description="Notify me when new controlled documents are registered."
              icon={BellRing}
            />
            <PreferenceToggle
              control={form.control}
              name="reviewRequest"
              title="Review requests"
              description="Notify me when a workflow step is assigned to me."
              icon={BellRing}
            />
            <PreferenceToggle
              control={form.control}
              name="approvalDecision"
              title="Approval decisions"
              description="Notify me when a document is approved or rejected."
              icon={BellRing}
            />
            <PreferenceToggle
              control={form.control}
              name="transmittalUpdate"
              title="Transmittal updates"
              description="Notify me when a package is sent or acknowledged."
              icon={BellRing}
            />
            <PreferenceToggle
              control={form.control}
              name="emailNotifications"
              title="Email delivery"
              description="Send matching EDMS alerts to your email address when the related event toggle is also enabled."
              icon={Mail}
            />

            <div className="flex justify-end border-t pt-6">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <BellRing className="size-4" />
                    Save preferences
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function PreferenceToggle({
  control,
  name,
  title,
  description,
  icon: Icon,
}: {
  control: ReturnType<typeof useForm<NotificationPreferencesValues>>["control"];
  name: keyof NotificationPreferencesValues;
  title: string;
  description: string;
  icon: typeof BellRing;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 items-center justify-center rounded-full border border-border/70 bg-background">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium">{title}</FormLabel>
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
