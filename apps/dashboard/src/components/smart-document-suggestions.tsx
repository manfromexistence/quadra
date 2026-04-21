"use client";

import { Badge } from "@midday/ui/badge";
import { Button } from "@midday/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@midday/ui/card";
import { FileText, FolderTree, Lightbulb, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Suggestion {
  id: string;
  type: "similar" | "related" | "template";
  title: string;
  description: string;
  confidence: number;
}

export function SmartDocumentSuggestions({
  currentDocument,
  projectDocuments,
}: {
  currentDocument?: any;
  projectDocuments?: any[];
}) {
  const [suggestions, _setSuggestions] = useState<Suggestion[]>([
    {
      id: "1",
      type: "similar",
      title: "Similar Document Found",
      description: "Document 'Spec-A-001' has similar content and structure",
      confidence: 0.92,
    },
    {
      id: "2",
      type: "related",
      title: "Related Workflow",
      description: "Consider adding this to the 'Structural Review' workflow",
      confidence: 0.85,
    },
    {
      id: "3",
      type: "template",
      title: "Use Template",
      description:
        "This document matches the 'Technical Specification' template",
      confidence: 0.78,
    },
  ]);

  const handleApplySuggestion = (suggestion: Suggestion) => {
    toast.success(`Applied suggestion: ${suggestion.title}`);
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="size-4 text-amber-600" />
          AI Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="mt-0.5">
              {suggestion.type === "similar" && (
                <FileText className="size-4 text-blue-600" />
              )}
              {suggestion.type === "related" && (
                <FolderTree className="size-4 text-green-600" />
              )}
              {suggestion.type === "template" && (
                <Lightbulb className="size-4 text-amber-600" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{suggestion.title}</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(suggestion.confidence * 100)}% match
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {suggestion.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApplySuggestion(suggestion)}
            >
              Apply
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
