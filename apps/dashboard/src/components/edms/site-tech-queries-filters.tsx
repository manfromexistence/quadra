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

export function SiteTechQueriesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [discipline, setDiscipline] = useState(
    searchParams.get("discipline") ?? "all",
  );
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (query) params.set("query", query);
    if (discipline && discipline !== "all")
      params.set("discipline", discipline);
    if (status && status !== "all") params.set("status", status);

    startTransition(() => {
      router.push(`/site-tech-queries?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setQuery("");
    setDiscipline("all");
    setStatus("all");
    startTransition(() => {
      router.push("/site-tech-queries");
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
        placeholder="Search site queries…"
        className="max-w-[280px]"
      />
      <Select value={discipline} onValueChange={setDiscipline}>
        <SelectTrigger className="w-[160px] font-mono">
          <SelectValue placeholder="All Disciplines" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Disciplines</SelectItem>
          <SelectItem value="CIV">CIV</SelectItem>
          <SelectItem value="STR">STR</SelectItem>
          <SelectItem value="MEC">MEC</SelectItem>
          <SelectItem value="ELE">ELE</SelectItem>
          <SelectItem value="INS">INS</SelectItem>
          <SelectItem value="PIP">PIP</SelectItem>
          <SelectItem value="PRO">PRO</SelectItem>
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Open">Open</SelectItem>
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
      {(query || discipline !== "all" || status !== "all") && (
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
