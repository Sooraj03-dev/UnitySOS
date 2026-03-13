import { MapPin, Clock } from "lucide-react";
import { RoleBadge, VerifiedBadge } from "@/components/ui/Badges";
import type { UserRole, BadgeStatus } from "@/components/ui/Badges";
import { cn } from "@/lib/utils";

export type AlertType = "SOS" | "Medical" | "Blocked Route" | "Resources" | "General";

export interface AlertData {
  id: string;
  type: AlertType;
  description: string;
  distance: string;
  time: string;
  userName: string;
  role: UserRole;
  badgeStatus: BadgeStatus;
}

const alertTypeCfg: Record<AlertType, { color: string; bg: string; border: string; dot: string }> = {
  SOS:            { color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",     dot: "bg-red-500" },
  Medical:        { color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200",  dot: "bg-orange-500" },
  "Blocked Route":{ color: "text-yellow-700", bg: "bg-yellow-50",  border: "border-yellow-200",  dot: "bg-yellow-500" },
  Resources:      { color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",    dot: "bg-blue-500" },
  General:        { color: "text-gray-700",   bg: "bg-gray-50",    border: "border-gray-200",    dot: "bg-gray-400" },
};

interface AlertCardProps {
  alert: AlertData;
  compact?: boolean;
}

export function AlertCard({ alert, compact }: AlertCardProps) {
  const cfg = alertTypeCfg[alert.type];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 card-shadow flex flex-col gap-3 hover:shadow-md transition-shadow duration-200 active:scale-[0.99]">
      {/* Row 1: badge + time */}
      <div className="flex items-center justify-between">
        <span className={cn("flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border", cfg.color, cfg.bg, cfg.border)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
          {alert.type}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
          <Clock className="w-3 h-3" />
          {alert.time}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm font-medium text-foreground leading-snug">{alert.description}</p>

      {/* Row 3: user + distance */}
      {!compact && (
        <div className="flex items-center justify-between pt-1 border-t border-border/60">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">
              {alert.userName.charAt(0)}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-foreground leading-none">{alert.userName}</span>
              <div className="flex items-center gap-1">
                <RoleBadge role={alert.role} />
                {alert.badgeStatus === "verified" && <VerifiedBadge status="verified" />}
              </div>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {alert.distance}
          </span>
        </div>
      )}
    </div>
  );
}
