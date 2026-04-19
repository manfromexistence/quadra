"use client";

import { Button } from "@midday/ui/button";
import { Input } from "@midday/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function RFIsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [category, setCategory] = useState(
    searchParams.get("category") ?? "all",
  );
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (query) params.set("query", query);
    if (category && category !== "all") params.set("category", category);
    if (status && status !== "all") params.set("status", status);

    startTransition(() => {
      router.push(`/rfis?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setQuery("");
    setCategory("all");
    setStatus("all");
    startTransition(() => {
      router.push("/rfis");
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
        placeholder="Search RFIs…"
        className="max-w-[280px]"
      />
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Materials">Materials</SelectItem>
          <SelectItem value="Design">Design</SelectItem>
          <SelectItem value="QA/QC">QA/QC</SelectItem>
          <SelectItem value="Safety">Safety</SelectItem>
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Open">Open</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Responded">Responded</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={handleApplyFilters}
        variant="secondary"
        size="sm"
        disabled={isPending}
      >
        {isPending ? "Applying..." : "Apply Filters"}
      </Button>
      {(query || category !== "all" || status !== "all") && (
        <Button
          onClick={handleReset}
          variant="ghost"
          size="sm"
          disabled={isPending}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
