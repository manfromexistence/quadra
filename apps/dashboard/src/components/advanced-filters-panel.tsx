"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import { Input } from "@midday/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@midday/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@midday/ui/sheet";
import { Filter } from "lucide-react";
import { useState } from "react";

interface FilterOption {
  id: string;
  label: string;
  type: "select" | "date" | "text";
  options?: { value: string; label: string }[];
}

interface AdvancedFiltersPanelProps {
  filters: FilterOption[];
  onApply: (filters: Record<string, any>) => void;
  onReset: () => void;
  activeFiltersCount?: number;
}

export function AdvancedFiltersPanel({
  filters,
  onApply,
  onReset,
  activeFiltersCount = 0,
}: AdvancedFiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleApply = () => {
    onApply(filterValues);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilterValues({});
    onReset();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 size-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-4">
          {filters.map((filter) => (
            <div key={filter.id} className="space-y-2">
              <label
                htmlFor={`filter-${filter.id}`}
                className="text-sm font-medium"
              >
                {filter.label}
              </label>
              {filter.type === "select" && (
                <Select
                  value={filterValues[filter.id]}
                  onValueChange={(value) =>
                    setFilterValues({ ...filterValues, [filter.id]: value })
                  }
                >
                  <SelectTrigger id={`filter-${filter.id}`}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {filter.type === "date" && (
                <Input
                  id={`filter-${filter.id}`}
                  type="date"
                  value={filterValues[filter.id] || ""}
                  onChange={(e) =>
                    setFilterValues({
                      ...filterValues,
                      [filter.id]: e.target.value,
                    })
                  }
                />
              )}
              {filter.type === "text" && (
                <Input
                  placeholder="Enter value..."
                  value={filterValues[filter.id] || ""}
                  onChange={(e) =>
                    setFilterValues({
                      ...filterValues,
                      [filter.id]: e.target.value,
                    })
                  }
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
