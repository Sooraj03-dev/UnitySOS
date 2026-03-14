/**
 * Reusable hook for live-updating alerts via Supabase Realtime.
 *
 * Fetches initial alerts and subscribes to INSERT events on the alerts table.
 * New alerts appear instantly at the top of the list.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { fetchAlerts } from "@/lib/alerts";
import type { AlertData, AlertType } from "@/components/ui/AlertCard";

interface UseRealtimeAlertsOptions {
  /** Max number of alerts to fetch initially */
  limit?: number;
  /** Called when a new alert arrives via Realtime */
  onNewAlert?: (alert: AlertData) => void;
}

interface UseRealtimeAlertsReturn {
  alerts: AlertData[];
  loading: boolean;
  error: string | null;
}

/** Format a timestamp as relative time */
function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export function useRealtimeAlerts(options: UseRealtimeAlertsOptions = {}): UseRealtimeAlertsReturn {
  const { limit = 20, onNewAlert } = options;
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onNewAlertRef = useRef(onNewAlert);
  onNewAlertRef.current = onNewAlert;

  // Initial fetch
  useEffect(() => {
    fetchAlerts(limit)
      .then(setAlerts)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load alerts"))
      .finally(() => setLoading(false));
  }, [limit]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("realtime-alerts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          const row = payload.new as Record<string, string>;

          const newAlert: AlertData = {
            id: row.id,
            type: row.type as AlertType,
            description: row.description,
            distance: "—",
            time: formatTimeAgo(row.created_at),
            userName: row.user_name,
            role: "Civilian" as const,
            badgeStatus: "unverified" as const,
            photoUrl: row.photo_url || undefined,
          };

          // Prepend to the list
          setAlerts((prev) => [newAlert, ...prev]);

          // Notify consumers
          onNewAlertRef.current?.(newAlert);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { alerts, loading, error };
}
