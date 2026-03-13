import { MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export type ResourceType = "Medical" | "Shelter" | "Water" | "Supplies" | "Emergency";

export interface ResourceData {
  id: string;
  name: string;
  type: ResourceType;
  address: string;
  contact: string;
  distance: string;
  open: boolean;
}

const typeCfg: Record<ResourceType, { color: string; bg: string; border: string; icon: string }> = {
  Medical:   { color: "text-rose-700",   bg: "bg-rose-50",   border: "border-rose-200",   icon: "🏥" },
  Shelter:   { color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", icon: "🏠" },
  Water:     { color: "text-cyan-700",   bg: "bg-cyan-50",   border: "border-cyan-200",   icon: "💧" },
  Supplies:  { color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200",  icon: "📦" },
  Emergency: { color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    icon: "🚨" },
};

interface ResourceCardProps {
  resource: ResourceData;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const cfg = typeCfg[resource.type];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 card-shadow flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-lg border", cfg.bg, cfg.border)}>
            {cfg.icon}
          </span>
          <div>
            <h4 className="font-bold text-sm text-foreground leading-tight">{resource.name}</h4>
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", cfg.color, cfg.bg)}>
              {resource.type}
            </span>
          </div>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5",
          resource.open ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
        )}>
          {resource.open ? "Open" : "Closed"}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{resource.address}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <a href={`tel:${resource.contact}`} className="hover:text-accent">{resource.contact}</a>
        </div>
      </div>

      {/* Distance */}
      <div className="flex items-center justify-between border-t border-border/60 pt-2">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {resource.distance}
        </span>
        <button className="text-xs font-bold text-accent hover:underline">
          Get Directions →
        </button>
      </div>
    </div>
  );
}
