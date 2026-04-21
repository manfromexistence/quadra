"use client";

import { Button } from "@midday/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@midday/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@midday/ui/dropdown-menu";
import { Input } from "@midday/ui/input";
import { Bookmark, BookmarkCheck, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SavedView {
  id: string;
  name: string;
  filters: Record<string, any>;
  columns: string[];
  sortBy?: string;
}

interface SavedViewsProps {
  currentFilters: Record<string, any>;
  currentColumns: string[];
  currentSortBy?: string;
  onLoadView: (view: SavedView) => void;
}

export function SavedViews({
  currentFilters,
  currentColumns,
  currentSortBy,
  onLoadView,
}: SavedViewsProps) {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [viewName, setViewName] = useState("");

  const handleSaveView = () => {
    if (!viewName.trim()) {
      toast.error("Please enter a view name");
      return;
    }

    const newView: SavedView = {
      id: Date.now().toString(),
      name: viewName,
      filters: currentFilters,
      columns: currentColumns,
      sortBy: currentSortBy,
    };

    setSavedViews([...savedViews, newView]);
    setViewName("");
    setIsSaveDialogOpen(false);
    toast.success("View saved successfully");
  };

  const handleLoadView = (view: SavedView) => {
    onLoadView(view);
    toast.success(`Loaded view: ${view.name}`);
  };

  const handleDeleteView = (viewId: string) => {
    setSavedViews(savedViews.filter((v) => v.id !== viewId));
    toast.success("View deleted");
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="mr-2 size-4" />
            Save View
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter view name..."
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSaveDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveView} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {savedViews.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Bookmark className="mr-2 size-4" />
              Saved Views
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {savedViews.map((view) => (
              <DropdownMenuItem
                key={view.id}
                onClick={() => handleLoadView(view)}
                className="cursor-pointer"
              >
                <BookmarkCheck className="mr-2 size-4" />
                <span className="flex-1">{view.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteView(view.id);
                  }}
                >
                  <Trash2 className="size-3" />
                </Button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
