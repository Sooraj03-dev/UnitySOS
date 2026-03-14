"use client";

import { useState } from "react";
import { Radio, Bell, AlertTriangle, MapPin, Truck, CheckCircle, Clock, Heart, Package, Info, Zap, Megaphone } from "lucide-react";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";
import type { AlertData } from "@/components/ui/AlertCard";

type UpdateType = "sos" | "rescue" | "resource" | "info" | "medical" | "resolved" | "general" | "blocked";

interface Update {
  id: string;
  type: UpdateType;
  title: string;
  body: string;
  source: string;
  time: string;
  location?: string;
  isNew: boolean;
}

const typeCfg: Record<UpdateType, { icon: typeof Bell; color: string; bg: string; border: string; label: string }> = {
  sos:      { icon: AlertTriangle, color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",    label: "SOS" },
  rescue:   { icon: Truck,         color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",   label: "Rescue" },
  medical:  { icon: Heart,         color: "text-rose-700",   bg: "bg-rose-50",    border: "border-rose-200",   label: "Medical" },
  resource: { icon: Package,       color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200",  label: "Resource" },
  info:     { icon: Info,          color: "text-gray-700",   bg: "bg-gray-50",    border: "border-gray-200",   label: "Info" },
  resolved: { icon: CheckCircle,   color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200",label: "Resolved" },
  general:  { icon: Megaphone,     color: "text-slate-700",  bg: "bg-slate-50",   border: "border-slate-200",  label: "General" },
  blocked:  { icon: AlertTriangle, color: "text-yellow-700", bg: "bg-yellow-50",  border: "border-yellow-200", label: "Blocked Route" },
};

/** Map Supabase AlertType → local UpdateType */
function mapAlertType(alertType: string): UpdateType {
  const mapping: Record<string, UpdateType> = {
    SOS: "sos",
    Medical: "medical",
    "Blocked Route": "blocked",
    Resources: "resource",
    General: "general",
  };
  return mapping[alertType] ?? "info";
}

/** Map a Supabase alert to an Update */
function alertToUpdate(alert: AlertData, index: number): Update {
  return {
    id: alert.id,
    type: mapAlertType(alert.type),
    title: `${alert.type} Alert`,
    body: alert.description,
    source: `Posted by ${alert.userName}`,
    time: alert.time,
    isNew: index < 2, // mark first 2 as "new"
  };
}

const filters = ["All", "SOS", "Medical", "Resource", "Blocked Route", "General"] as const;

export default function UpdatesPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Live-updating alerts from Supabase Realtime
  const { alerts: liveAlerts, loading } = useRealtimeAlerts({ limit: 30 });
  const updates = liveAlerts.map(alertToUpdate);

  const filtered = activeFilter === "All"
    ? updates
    : updates.filter(u => {
        const filterMap: Record<string, UpdateType> = {
          SOS: "sos", Medical: "medical", Resource: "resource",
          "Blocked Route": "blocked", General: "general",
        };
        return u.type === (filterMap[activeFilter] ?? activeFilter.toLowerCase());
      });

  const newCount = updates.filter(u => u.isNew).length;

  return (
    <div className="flex flex-col pb-[76px]">

      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-200 bg-gradient-to-b from-amber-50/60 to-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold tracking-tight">Live Updates</h1>
            <p className="text-xs text-gray-500 mt-0.5">Real-time emergency information</p>
          </div>
          {newCount > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold animate-pulse">
              <Radio className="w-3 h-3" /> {newCount} new
            </span>
          )}
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-700">Live Feed Active</span>
          <span className="text-[10px] text-gray-400 ml-auto">Auto-refreshing</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto hide-scrollbar">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === f
                ? "bg-red-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Updates Feed */}
      <div className="flex flex-col gap-3 px-4 pt-3">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gray-200" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="h-3 w-full bg-gray-200 rounded mb-2" />
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm font-bold text-gray-400">No updates found</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeFilter === "All"
                ? "No alerts have been posted yet"
                : `No ${activeFilter} alerts have been posted`}
            </p>
          </div>
        ) : (
          filtered.map((update, i) => {
            const cfg = typeCfg[update.type];
            const Icon = cfg.icon;
            return (
              <div
                key={update.id}
                className={`rounded-2xl border p-4 shadow-sm transition-all ${
                  update.isNew
                    ? `${cfg.bg} ${cfg.border} ring-1 ring-offset-1 ring-red-200`
                    : "bg-white border-gray-200"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                        {update.isNew && <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-red-500 text-white">NEW</span>}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mt-0.5 leading-tight">{update.title}</h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 shrink-0 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {update.time}
                  </span>
                </div>

                {/* Body */}
                <p className="text-xs font-medium text-gray-700 leading-relaxed mb-2">{update.body}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400">via {update.source}</span>
                  {update.location && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-gray-500">
                      <MapPin className="w-3 h-3" /> {update.location}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
