"use client";

import { useEffect, useState } from "react";

interface RealtimeUpdate {
  type: "document" | "transmittal" | "workflow" | "notification";
  action: "create" | "update" | "delete";
  data: any;
}

export function useRealtimeUpdates(channel: string) {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In a real implementation, this would connect to WebSocket or SSE
    // For now, we'll simulate with event listeners
    const handleUpdate = (event: CustomEvent<RealtimeUpdate>) => {
      setUpdates((prev) => [event.detail, ...prev].slice(0, 50));
    };

    window.addEventListener(
      `realtime:${channel}`,
      handleUpdate as EventListener,
    );
    setIsConnected(true);

    return () => {
      window.removeEventListener(
        `realtime:${channel}`,
        handleUpdate as EventListener,
      );
      setIsConnected(false);
    };
  }, [channel]);

  const broadcastUpdate = (update: RealtimeUpdate) => {
    window.dispatchEvent(
      new CustomEvent(`realtime:${channel}`, { detail: update }),
    );
  };

  return {
    updates,
    isConnected,
    broadcastUpdate,
    clearUpdates: () => setUpdates([]),
  };
}

// Hook for document-specific updates
export function useDocumentUpdates(documentId: string) {
  return useRealtimeUpdates(`document:${documentId}`);
}

// Hook for project-specific updates
export function useProjectUpdates(projectId: string) {
  return useRealtimeUpdates(`project:${projectId}`);
}
