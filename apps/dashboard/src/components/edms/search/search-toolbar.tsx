"use client";

import { Bookmark, Clock3, Filter, History, Search, SquarePen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/hooks/use-toast";

interface SearchToolbarProps {
  initialFilters: GlobalSearchFilters;
  projects: SearchOption[];
  uploaders: SearchOption[];
}

type SearchCategory = "project" | "document" | "workflow" | "transmittal" | "notification";

interface GlobalSearchFilters {
  query: string;
  categories: SearchCategory[];
  status: string;
  projectId: string;
  uploaderId: string;
  fromDate: string;
  toDate: string;
}

interface SearchOption {
  id: string;
  label: string;
  description: string | null;
}

const GLOBAL_SEARCH_CATEGORIES: SearchCategory[] = [
  "project",
  "document",
  "workflow",
  "transmittal",
  "notification",
];

interface SavedSearchEntry {
  id: string;
  label: string;
  filters: GlobalSearchFilters;
  createdAt: string;
}

const LOCAL_STORAGE_HISTORY_KEY = "quadra-edms-search-history";
const LOCAL_STORAGE_SAVED_KEY = "quadra-edms-search-presets";
const ALL_OPTION_VALUE = "__all__";

const STATUS_OPTIONS = [
  "",
  "active",
  "on-hold",
  "completed",
  "archived",
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "pending",
  "in_progress",
  "sent",
  "acknowledged",
  "closed",
  "read",
  "unread",
] as const;

export function SearchToolbar({ initialFilters, projects, uploaders }: SearchToolbarProps) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const [recentSearches, setRecentSearches] = useState<SavedSearchEntry[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearchEntry[]>([]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    setRecentSearches(readSearchEntries(LOCAL_STORAGE_HISTORY_KEY));
    setSavedSearches(readSearchEntries(LOCAL_STORAGE_SAVED_KEY));
  }, []);

  const summaryLabel = useMemo(() => buildSummaryLabel(filters), [filters]);

  const updateFilter = (key: keyof GlobalSearchFilters, value: string | string[]) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submitSearch = () => {
    const nextUrl = buildSearchUrl(filters);
    pushSearchEntry(LOCAL_STORAGE_HISTORY_KEY, filters, summaryLabel, setRecentSearches);
    router.push(nextUrl);
  };

  const savePreset = () => {
    if (!filters.query && filters.categories.length === GLOBAL_SEARCH_CATEGORIES.length) {
      toast({
        title: "Nothing new to save",
        description: "Add a query or at least one filter before saving a preset.",
      });
      return;
    }

    pushSearchEntry(LOCAL_STORAGE_SAVED_KEY, filters, summaryLabel, setSavedSearches, true);
    toast({
      title: "Search preset saved",
      description: "Your search setup is now available in this browser.",
    });
  };

  const clearFilters = () => {
    const resetFilters: GlobalSearchFilters = {
      query: "",
      categories: [...GLOBAL_SEARCH_CATEGORIES],
      status: "",
      projectId: "",
      uploaderId: "",
      fromDate: "",
      toDate: "",
    };

    setFilters(resetFilters);
    router.push("/dashboard/search");
  };

  const applySavedSearch = (entry: SavedSearchEntry) => {
    setFilters(entry.filters);
    router.push(buildSearchUrl(entry.filters));
  };

  return (
    <Card className="border-border bg-card/95 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle>Search workspace</CardTitle>
        <CardDescription>
          Filter by category, status, project, uploader, and date range. Searches are remembered in
          this browser for quick reuse.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.query}
                onChange={(event) => updateFilter("query", event.target.value)}
                placeholder="Search documents, comments, workflows, and transmittals"
                className="pl-9"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitSearch();
                  }
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={savePreset}>
                <Bookmark className="size-4" />
                Save preset
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters}>
                <X className="size-4" />
                Clear
              </Button>
              <Button type="button" onClick={submitSearch}>
                <Search className="size-4" />
                Search
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="size-4 text-muted-foreground" />
              Categories
            </div>
            <ToggleGroup
              type="multiple"
              variant="outline"
              spacing={1}
              value={filters.categories}
              onValueChange={(value) =>
                updateFilter("categories", value.length > 0 ? value : [...GLOBAL_SEARCH_CATEGORIES])
              }
              className="flex flex-wrap justify-start"
            >
              {GLOBAL_SEARCH_CATEGORIES.map((category) => (
                <ToggleGroupItem key={category} value={category}>
                  {formatCategory(category)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FieldSelect
              label="Status"
              value={filters.status}
              placeholder="Any status"
              options={STATUS_OPTIONS.map((status) => ({
                value: status || ALL_OPTION_VALUE,
                label: status ? formatStatus(status) : "Any status",
              }))}
              onValueChange={(value) => updateFilter("status", value)}
            />
            <FieldSelect
              label="Project"
              value={filters.projectId}
              placeholder="Any project"
              options={[
                { value: ALL_OPTION_VALUE, label: "Any project" },
                ...projects.map((project) => ({
                  value: project.id,
                  label: project.description
                    ? `${project.label} - ${project.description}`
                    : project.label,
                })),
              ]}
              onValueChange={(value) => updateFilter("projectId", value)}
            />
            <FieldSelect
              label="Uploader"
              value={filters.uploaderId}
              placeholder="Any uploader"
              options={[
                { value: ALL_OPTION_VALUE, label: "Any uploader" },
                ...uploaders.map((uploader) => ({
                  value: uploader.id,
                  label: uploader.description
                    ? `${uploader.label} - ${uploader.description}`
                    : uploader.label,
                })),
              ]}
              onValueChange={(value) => updateFilter("uploaderId", value)}
            />
            <div className="grid gap-3">
              <label className="text-sm font-medium">Date range</label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  type="date"
                  value={filters.fromDate}
                  onChange={(event) => updateFilter("fromDate", event.target.value)}
                  aria-label="Search from date"
                />
                <Input
                  type="date"
                  value={filters.toDate}
                  onChange={(event) => updateFilter("toDate", event.target.value)}
                  aria-label="Search to date"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full">
            {summaryLabel}
          </Badge>
          {filters.query ? (
            <Badge variant="secondary" className="rounded-full">
              Query
            </Badge>
          ) : null}
          {filters.status ? (
            <Badge variant="secondary" className="rounded-full">
              {formatStatus(filters.status)}
            </Badge>
          ) : null}
          {filters.projectId ? (
            <Badge variant="secondary" className="rounded-full">
              Project filtered
            </Badge>
          ) : null}
          {filters.uploaderId ? (
            <Badge variant="secondary" className="rounded-full">
              Uploader filtered
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <PresetPanel
            title="Recent searches"
            icon={<Clock3 className="size-4" />}
            entries={recentSearches}
            onSelect={applySavedSearch}
            emptyMessage="Your recent searches will appear here after you run a query."
          />
          <PresetPanel
            title="Saved presets"
            icon={<SquarePen className="size-4" />}
            entries={savedSearches}
            onSelect={applySavedSearch}
            emptyMessage="Save a search setup to reuse it later from this browser."
          />
        </div>

        <p className="text-xs leading-5 text-muted-foreground">
          Searches persist locally in this browser only. They do not create new database records.
        </p>
      </CardContent>
    </Card>
  );
}

function FieldSelect({
  label,
  value,
  placeholder,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{label}</label>
      <Select
        value={value || ALL_OPTION_VALUE}
        onValueChange={(nextValue) =>
          onValueChange(nextValue === ALL_OPTION_VALUE ? "" : nextValue)
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={`${label}-${option.value}`} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PresetPanel({
  title,
  icon,
  entries,
  onSelect,
  emptyMessage,
}: {
  title: string;
  icon: ReactNode;
  entries: SavedSearchEntry[];
  onSelect: (entry: SavedSearchEntry) => void;
  emptyMessage: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {entries.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">{emptyMessage}</p>
        ) : (
          entries.map((entry) => (
            <Button
              key={entry.id}
              type="button"
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => onSelect(entry)}
            >
              <History className="size-4" />
              <span className="max-w-48 truncate">{entry.label}</span>
            </Button>
          ))
        )}
      </div>
    </div>
  );
}

function buildSearchUrl(filters: GlobalSearchFilters) {
  const params = new URLSearchParams();

  if (filters.query.trim().length > 0) {
    params.set("q", filters.query.trim());
  }

  if (
    filters.categories.length > 0 &&
    filters.categories.length < GLOBAL_SEARCH_CATEGORIES.length
  ) {
    params.set("category", filters.categories.join(","));
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.projectId) {
    params.set("projectId", filters.projectId);
  }

  if (filters.uploaderId) {
    params.set("uploaderId", filters.uploaderId);
  }

  if (filters.fromDate) {
    params.set("from", filters.fromDate);
  }

  if (filters.toDate) {
    params.set("to", filters.toDate);
  }

  const queryString = params.toString();
  return queryString ? `/dashboard/search?${queryString}` : "/dashboard/search";
}

function pushSearchEntry(
  storageKey: string,
  filters: GlobalSearchFilters,
  label: string,
  setEntries: Dispatch<SetStateAction<SavedSearchEntry[]>>,
  dedupeByFilters = false
) {
  const entry: SavedSearchEntry = {
    id: `${storageKey}-${Date.now()}`,
    label,
    filters,
    createdAt: new Date().toISOString(),
  };

  const nextEntries = mergeSearchEntries(readSearchEntries(storageKey), entry, dedupeByFilters);
  window.localStorage.setItem(storageKey, JSON.stringify(nextEntries));
  setEntries(nextEntries);
}

function readSearchEntries(storageKey: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as SavedSearchEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

function mergeSearchEntries(
  entries: SavedSearchEntry[],
  nextEntry: SavedSearchEntry,
  dedupeByFilters: boolean
) {
  const filtered = dedupeByFilters
    ? entries.filter((entry) => JSON.stringify(entry.filters) !== JSON.stringify(nextEntry.filters))
    : entries.filter((entry) => entry.label !== nextEntry.label);

  return [nextEntry, ...filtered].slice(0, 8);
}

function buildSummaryLabel(filters: GlobalSearchFilters) {
  const parts = [filters.query.trim() || "All records"];

  if (
    filters.categories.length > 0 &&
    filters.categories.length < GLOBAL_SEARCH_CATEGORIES.length
  ) {
    parts.push(filters.categories.map(formatCategory).join(", "));
  }

  if (filters.status) {
    parts.push(formatStatus(filters.status));
  }

  if (filters.projectId) {
    parts.push("Project");
  }

  if (filters.uploaderId) {
    parts.push("Uploader");
  }

  if (filters.fromDate || filters.toDate) {
    parts.push(`${filters.fromDate || "start"} to ${filters.toDate || "now"}`);
  }

  return parts.join(" | ").slice(0, 96);
}

function formatCategory(category: string) {
  return category.replace(/[_-]+/g, " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatStatus(status: string) {
  return status.replace(/[_-]+/g, " ").replace(/^\w/, (letter) => letter.toUpperCase());
}
