import { Navigation, MessageCircle } from "lucide-react";
import { RoleBadge, VerifiedBadge } from "@/components/ui/Badges";
import type { UserRole, BadgeStatus } from "@/components/ui/Badges";
import { cn } from "@/lib/utils";

export interface ResponderData {
  id: string;
  name: string;
  role: UserRole;
  distance: string;
  badgeStatus: BadgeStatus;
  avatar: string;
  online: boolean;
}

interface ResponderCardProps {
  responder: ResponderData;
  showContact?: boolean;
}

const avatarColors: Record<string, string> = {
  A: "from-violet-400 to-purple-500",
  B: "from-blue-400 to-cyan-500",
  C: "from-green-400 to-emerald-500",
  D: "from-orange-400 to-amber-500",
  E: "from-pink-400 to-rose-500",
  J: "from-indigo-400 to-blue-500",
  M: "from-teal-400 to-cyan-500",
  R: "from-rose-400 to-red-500",
  S: "from-sky-400 to-blue-500",
  T: "from-amber-400 to-orange-500",
};

export function ResponderCard({ responder, showContact }: ResponderCardProps) {
  const grad = avatarColors[responder.avatar] || "from-slate-300 to-slate-400";

  return (
    <div className="min-w-[180px] snap-center bg-card border border-border rounded-2xl p-4 card-shadow flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Avatar */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-lg font-bold text-white", grad)}>
            {responder.avatar}
          </div>
          {/* Online dot */}
          <span className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
            responder.online ? "bg-emerald-500" : "bg-gray-300"
          )} />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-bold text-foreground leading-tight truncate">{responder.name}</span>
          <RoleBadge role={responder.role} />
        </div>
      </div>

      {/* Distance + Verified */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          <Navigation className="w-3.5 h-3.5" />
          {responder.distance}
        </span>
        <VerifiedBadge status={responder.badgeStatus} />
      </div>

      {/* Contact Button */}
      {showContact && (
        <button className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
          Contact
        </button>
      )}
    </div>
  );
}
