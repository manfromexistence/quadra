"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@midday/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { AlertCircle, CheckCircle, Clock, GripVertical } from "lucide-react";
import { useState } from "react";

interface WorkflowStage {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  items: WorkflowItem[];
}

interface WorkflowItem {
  id: string;
  title: string;
  status: string;
}

function SortableItem({ item }: { item: WorkflowItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-background border rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <GripVertical className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">{item.title}</span>
      </div>
    </div>
  );
}

function DroppableColumn({
  stage,
  onDrop,
}: {
  stage: WorkflowStage;
  onDrop: (itemId: string, stageId: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: stage.id });

  const statusColors = {
    pending:
      "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
    in_progress:
      "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    completed:
      "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    blocked: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
  };

  const statusIcons = {
    pending: Clock,
    in_progress: AlertCircle,
    completed: CheckCircle,
    blocked: AlertCircle,
  };

  const StatusIcon = statusIcons[stage.status];

  return (
    <Card className={`min-h-[300px] ${statusColors[stage.status]}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="size-4" />
            {stage.title}
          </div>
          <Badge variant="outline">{stage.items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef} className="space-y-2">
        <SortableContext items={stage.items.map((i) => i.id)}>
          {stage.items.map((item) => (
            <SortableItem key={item.id} item={item} />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}

export function DragDropWorkflow() {
  const [stages, setStages] = useState<WorkflowStage[]>([
    {
      id: "pending",
      title: "Pending Review",
      status: "pending",
      items: [
        { id: "1", title: "Document A - Rev 1", status: "pending" },
        { id: "2", title: "Document B - Rev 2", status: "pending" },
      ],
    },
    {
      id: "in_progress",
      title: "In Progress",
      status: "in_progress",
      items: [{ id: "3", title: "Document C - Rev 3", status: "in_progress" }],
    },
    {
      id: "completed",
      title: "Completed",
      status: "completed",
      items: [{ id: "4", title: "Document D - Rev 1", status: "completed" }],
    },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which stage the item was dropped in
    const targetStage = stages.find((stage) => stage.id === overId);
    if (!targetStage) return;

    // Move item to new stage
    setStages((prevStages) =>
      prevStages.map((stage) => {
        if (stage.id === overId) {
          const item = prevStages
            .flatMap((s) => s.items)
            .find((i) => i.id === activeId);
          if (item) {
            return {
              ...stage,
              items: [...stage.items, { ...item, status: stage.status }],
            };
          }
        }
        return {
          ...stage,
          items: stage.items.filter((i) => i.id !== activeId),
        };
      }),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workflow Status</h3>
        <Badge variant="outline">Drag items to change status</Badge>
      </div>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stages.map((stage) => (
            <DroppableColumn key={stage.id} stage={stage} onDrop={() => {}} />
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-background border rounded-lg p-3 shadow-lg opacity-50">
              <div className="flex items-center gap-2">
                <GripVertical className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {
                    stages
                      .flatMap((s) => s.items)
                      .find((i) => i.id === activeId)?.title
                  }
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
