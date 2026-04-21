"use client";

import { Badge } from "@midday/ui/badge";
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
import { Textarea } from "@midday/ui/textarea";
import { useToast } from "@midday/ui/use-toast";
import { Loader2, Search, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { z } from "zod/v3";
import { sendSupportAction } from "@/actions/send-support-action";
import { useZodForm } from "@/hooks/use-zod-form";
import { useTRPC } from "@/trpc/client";

const formSchema = z.object({
  subject: z.string(),
  priority: z.string(),
  type: z.string(),
  message: z.string(),
  url: z.string().optional(),
  transmittalId: z.string().optional(),
  recipientEmail: z.string().email().optional(),
});

export function SupportForm() {
  const { toast } = useToast();
  const trpc = useTRPC();
  const [transmittalSearch, setTransmittalSearch] = useState("");
  const [selectedTransmittal, setSelectedTransmittal] = useState<{
    id: string;
    number: string;
    subject: string;
  } | null>(null);

  // Fetch transmittals from database
  const { data: transmittals = [] } = trpc.transmittals.list.useQuery();

  const filteredTransmittals = transmittals
    .map((t) => ({
      id: t.id,
      number: t.transmittalNumber,
      subject: t.subject,
    }))
    .filter(
      (t) =>
        t.number.toLowerCase().includes(transmittalSearch.toLowerCase()) ||
        t.subject.toLowerCase().includes(transmittalSearch.toLowerCase()),
    );

  const form = useZodForm(formSchema, {
    defaultValues: {
      subject: undefined,
      type: undefined,
      priority: undefined,
      message: undefined,
      transmittalId: undefined,
      recipientEmail: undefined,
    },
  });

  const sendSupport = useAction(sendSupportAction, {
    onSuccess: () => {
      toast({
        duration: 2500,
        title: "Support ticket sent.",
        variant: "success",
      });

      form.reset();
      setSelectedTransmittal(null);
      setTransmittalSearch("");
    },
    onError: () => {
      toast({
        duration: 3500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(sendSupport.execute)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Summary of the problem you have"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Product</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EDMS">EDMS</SelectItem>
                    <SelectItem value="Transactions">Transactions</SelectItem>
                    <SelectItem value="Vault">Vault</SelectItem>
                    <SelectItem value="Inbox">Inbox</SelectItem>
                    <SelectItem value="Invoicing">Invoicing</SelectItem>
                    <SelectItem value="Tracker">Tracker</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Severity</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="recipientEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Email (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="support@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Link to Transmittal (Optional)</FormLabel>
          <div className="space-y-2">
            {selectedTransmittal ? (
              <div className="flex items-center justify-between p-2 border rounded-lg bg-accent">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedTransmittal.number}
                  </Badge>
                  <span className="text-sm">{selectedTransmittal.subject}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTransmittal(null);
                    form.setValue("transmittalId", undefined);
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search transmittals by number or subject..."
                  value={transmittalSearch}
                  onChange={(e) => setTransmittalSearch(e.target.value)}
                  className="pl-9"
                />
                {transmittalSearch && filteredTransmittals.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 border rounded-lg bg-background shadow-md max-h-48 overflow-auto">
                    {filteredTransmittals.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                        onClick={() => {
                          setSelectedTransmittal(t);
                          form.setValue("transmittalId", t.id);
                          setTransmittalSearch("");
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {t.number}
                          </Badge>
                          <span className="text-sm">{t.subject}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </FormItem>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue you're facing, along with any relevant information. Please be as detailed and specific as possible."
                  className="resize-none min-h-[150px]"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={
            sendSupport.status === "executing" || !form.formState.isValid
          }
        >
          {sendSupport.status === "executing" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
}
