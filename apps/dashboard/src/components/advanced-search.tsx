"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@midday/ui/dialog";
import { Input } from "@midday/ui/input";
import { FileText, Filter, FolderTree, Search, Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  type: "document" | "project" | "transmittal";
  title: string;
  description: string;
  path: string;
}

export function AdvancedSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    // In a real implementation, this would call an API
    // For now, simulate results
    const mockResults: SearchResult[] = [
      {
        id: "1",
        type: "document",
        title: "Spec-A-001",
        description: "Technical Specification for Refinery",
        path: "/documents/1",
      },
      {
        id: "2",
        type: "project",
        title: "Al Hamra Refinery",
        description: "Main refinery expansion project",
        path: "/projects/1",
      },
      {
        id: "3",
        type: "transmittal",
        title: "TM-2026-001",
        description: "Transmittal for structural drawings",
        path: "/transmittals/1",
      },
    ];

    setResults(
      mockResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description.toLowerCase().includes(query.toLowerCase()),
      ),
    );
  };

  const addFilter = (filter: string) => {
    if (!filters.includes(filter)) {
      setFilters([...filters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setFilters(filters.filter((f) => f !== filter));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "document":
        return FileText;
      case "project":
        return FolderTree;
      case "transmittal":
        return Send;
      default:
        return FileText;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Search className="mr-2 size-4" />
          Advanced Search
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search documents, projects, transmittals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
            {filters.map((filter) => (
              <Badge key={filter} variant="secondary" className="gap-1">
                {filter}
                <X
                  className="size-3 cursor-pointer"
                  onClick={() => removeFilter(filter)}
                />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addFilter("status:approved")}
            >
              + Add Filter
            </Button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {results.map((result) => {
              const Icon = getIcon(result.type);
              return (
                <div
                  key={result.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => {
                    toast(`Navigating to ${result.title}`);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="size-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{result.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {result.description}
                    </div>
                  </div>
                  <Badge variant="outline">{result.type}</Badge>
                </div>
              );
            })}
            {results.length === 0 && query && (
              <div className="text-center py-8 text-muted-foreground">
                No results found for "{query}"
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
