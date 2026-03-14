import { supabase } from "@/lib/supabase";
import type { AlertType } from "@/components/ui/AlertCard";
import type { AlertData } from "@/components/ui/AlertCard";

export interface CreateAlertInput {
  type: AlertType;
  description: string;
  latitude?: number;
  longitude?: number;
}

/** Post a new alert to Supabase */
export async function createAlert(input: CreateAlertInput) {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("You must be logged in to post an alert.");

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous";

  const { data, error } = await supabase
    .from("alerts")
    .insert({
      user_id: user.id,
      user_name: userName,
      type: input.type,
      description: input.description,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Fetch recent alerts from Supabase */
export async function fetchAlerts(limit = 20): Promise<AlertData[]> {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type as AlertType,
    description: row.description,
    distance: "—",
    time: formatTimeAgo(row.created_at),
    userName: row.user_name,
    role: "Civilian" as const,
    badgeStatus: "unverified" as const,
  }));
}

/** Helper to format timestamps as relative time */
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
