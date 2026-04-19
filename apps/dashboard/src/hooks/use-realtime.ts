"use client";

import { useEffect, useRef } from "react";

type EventType = "INSERT" | "UPDATE" | "DELETE";

interface UseRealtimeProps<TN extends string> {
  channelName: string;
  /** Specific events to listen for. Defaults to ["INSERT", "UPDATE"]. */
  events?: EventType[];
  table: TN;
  filter?: string;
  onEvent: (payload: any) => void;
}

/**
 * Hook for subscribing to database changes.
 *
 * NOTE: Currently mocked for Turso/SQLite which doesn't have native realtime.
 * TODO: Implement using polling or websockets for real-time updates.
 */
export function useRealtime<TN extends string>({
  channelName,
  events = ["INSERT", "UPDATE"],
  table,
  filter,
  onEvent,
}: UseRealtimeProps<TN>) {
  const onEventRef = useRef(onEvent);

  // Update the ref when onEvent changes
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!filter) {
      return;
    }

    // TODO: Implement realtime subscriptions for Turso
    // Options:
    // 1. Polling: setInterval to check for changes
    // 2. WebSockets: Set up a websocket server for push updates
    // 3. Server-Sent Events (SSE): Stream updates from server
    // 4. tRPC subscriptions: Use tRPC's subscription feature

    console.log(
      `[Realtime Mock] Would subscribe to ${table} with filter: ${filter}`,
    );

    return () => {
      console.log(`[Realtime Mock] Would unsubscribe from ${table}`);
    };
  }, [channelName, table, filter]);
}
