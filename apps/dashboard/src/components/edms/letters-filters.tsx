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

export function LettersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [direction, setDirection] = useState(
    searchParams.get("direction") ?? "all",
  );
  const [category, setCategory] = useState(
    searchParams.get("category") ?? "all",
  );

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (query) params.set("query", query);
    if (direction && direction !== "all") params.set("direction", direction);
    if (category && category !== "all") params.set("category", category);

    startTransition(() => {
      router.push(`/letters?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setQuery("");
    setDirection("all");
    setCategory("all");
    startTransition(() => {
      router.push("/letters");
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
        placeholder="Search letters…"
        className="max-w-[280px]"
      />
      <Select value={direction} onValueChange={setDirection}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Directions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Directions</SelectItem>
          <SelectItem value="Outgoing">Outgoing</SelectItem>
          <SelectItem value="Incoming">Incoming</SelectItem>
        </SelectContent>
      </Select>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Progress Report">Progress Report</SelectItem>
          <SelectItem value="Procurement">Procurement</SelectItem>
          <SelectItem value="Approval">Approval</SelectItem>
          <SelectItem value="Variation">Variation</SelectItem>
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
      {(query || direction !== "all" || category !== "all") && (
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
