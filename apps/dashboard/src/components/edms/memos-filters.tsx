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

export function MemosFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [category, setCategory] = useState(
    searchParams.get("category") ?? "all",
  );

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (query) params.set("query", query);
    if (category && category !== "all") params.set("category", category);

    startTransition(() => {
      router.push(`/memos?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setQuery("");
    setCategory("all");
    startTransition(() => {
      router.push("/memos");
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
        placeholder="Search memos…"
        className="max-w-[280px]"
      />
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Internal">Internal</SelectItem>
          <SelectItem value="Administrative">Administrative</SelectItem>
          <SelectItem value="Quality">Quality</SelectItem>
          <SelectItem value="Safety">Safety</SelectItem>
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
      {(query || category !== "all") && (
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
