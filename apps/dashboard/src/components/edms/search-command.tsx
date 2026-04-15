"use client";

import { BellRing, FileStack, FolderKanban, Loader2, Search, Send, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: "project" | "document" | "workflow" | "transmittal" | "notification";
  href: string;
  meta: string;
}

const CATEGORY_ICONS = {
  project: FolderKanban,
  document: FileStack,
  workflow: Workflow,
  transmittal: Send,
  notification: BellRing,
} as const;

const CATEGORY_LABELS = {
  project: "Projects",
  document: "Documents",
  workflow: "Workflows",
  transmittal: "Transmittals",
  notification: "Notifications",
} as const;

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search projects, documents, workflows..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : query.trim().length === 0 ? (
          <CommandEmpty>Start typing to search across your workspace...</CommandEmpty>
        ) : results.length === 0 ? (
          <CommandEmpty>No results found for "{query}"</CommandEmpty>
        ) : (
          <>
            {Object.entries(groupedResults).map(([category, items], index) => {
              const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
              const label = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS];

              return (
                <div key={category}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={label}>
                    {items.map((result) => (
                      <CommandItem
                        key={`${result.category}-${result.id}`}
                        value={`${result.title} ${result.subtitle} ${result.meta}`}
                        onSelect={() => {
                          router.push(result.href);
                          onOpenChange(false);
                        }}
                        className="flex items-start gap-3 py-3"
                      >
                        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium leading-none">{result.title}</p>
                            <Badge variant="outline" className="rounded-full text-xs">
                              {result.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                          <p className="text-xs text-muted-foreground">{result.meta}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </div>
              );
            })}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}


