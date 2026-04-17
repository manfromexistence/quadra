"use client";

import { useToast } from "@midday/ui/use-toast";
import { useEffect } from "react";

interface DevelopmentToastProps {
  pageName: string;
}

export function DevelopmentToast({ pageName }: DevelopmentToastProps) {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Under Active Development",
      description: `${pageName} is still being developed and may need some work. Features are being actively improved.`,
      duration: 6000,
    });
  }, [toast, pageName]);

  return null;
}
