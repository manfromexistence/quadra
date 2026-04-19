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

export function MeetingsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "all");

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (query) params.set("query", query);
    if (type && type !== "all") params.set("type", type);

    startTransition(() => {
      router.push(`/meetings?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setQuery("");
    setType("all");
    startTransition(() => {
      router.push("/meetings");
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
        placeholder="Search meetings…"
        className="max-w-[280px]"
      />
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Meeting Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Meeting Types</SelectItem>
          <SelectItem value="Weekly Progress">Weekly Progress</SelectItem>
          <SelectItem value="Design Review">Design Review</SelectItem>
          <SelectItem value="Safety">Safety</SelectItem>
          <SelectItem value="Kickoff">Kickoff</SelectItem>
          <SelectItem value="Closeout">Closeout</SelectItem>
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
      {(query || type !== "all") && (
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
