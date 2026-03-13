"use client";

import { useState } from "react";
import { Radio, Bell, AlertTriangle, MapPin, Truck, CheckCircle, Clock, Heart, Package, Info, Zap } from "lucide-react";

type UpdateType = "sos" | "rescue" | "resource" | "info" | "medical" | "resolved";

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

const mockUpdates: Update[] = [
  { id: "1",  type: "sos",      title: "New SOS Alert",               body: "Family of 4 trapped in building at Riverside Sector. Water level rising.", source: "Auto-detected via Bluetooth mesh", time: "Just now",  location: "Sector A", isNew: true },
  { id: "2",  type: "rescue",   title: "Rescue Team Dispatched",      body: "Team Alpha with 6 members deployed to Riverside. ETA: 12 minutes.",       source: "District Authority",               time: "2m ago",    location: "Sector A", isNew: true },
  { id: "3",  type: "medical",  title: "Medical Camp Open",           body: "Emergency medical camp set up at Community Hall. Treating 23 patients.",   source: "Red Cross",                        time: "8m ago",    location: "Sector B", isNew: false },
  { id: "4",  type: "resource", title: "Water Distribution",          body: "Clean water tanker arrived at Metro Station. Capacity: 5000L.",            source: "Municipal Authority",              time: "15m ago",   location: "Sector C", isNew: false },
  { id: "5",  type: "info",     title: "Route Update",                body: "MG Road bridge cleared and opened for emergency vehicles only.",           source: "Traffic Police",                   time: "22m ago",   location: "Sector B", isNew: false },
  { id: "6",  type: "resolved", title: "SOS Resolved",                body: "3 people rescued from University campus. All safe, minor injuries.",       source: "Rescue Unit #7",                   time: "30m ago",   location: "Sector C", isNew: false },
  { id: "7",  type: "sos",      title: "Elderly Person Needs Help",   body: "82-year-old woman alone, unable to move. Needs evacuation.",               source: "Bluetooth Relay — John D.",        time: "35m ago",   location: "Sector D", isNew: false },
  { id: "8",  type: "resource", title: "Shelter Capacity Update",     body: "Community Hall shelter at 78% capacity. 45 more spots available.",         source: "Shelter Coordinator",              time: "42m ago",   location: "Sector B", isNew: false },
];

const typeCfg: Record<UpdateType, { icon: typeof Bell; color: string; bg: string; border: string; label: string }> = {
  sos:      { icon: AlertTriangle, color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",    label: "SOS" },
  rescue:   { icon: Truck,         color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",   label: "Rescue" },
  medical:  { icon: Heart,         color: "text-rose-700",   bg: "bg-rose-50",    border: "border-rose-200",   label: "Medical" },
  resource: { icon: Package,       color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200",  label: "Resource" },
  info:     { icon: Info,          color: "text-gray-700",   bg: "bg-gray-50",    border: "border-gray-200",   label: "Info" },
  resolved: { icon: CheckCircle,   color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200",label: "Resolved" },
};

const filters = ["All", "SOS", "Rescue", "Medical", "Resource", "Info", "Resolved"] as const;

export default function UpdatesPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered = activeFilter === "All"
    ? mockUpdates
    : mockUpdates.filter(u => u.type === activeFilter.toLowerCase());

  const newCount = mockUpdates.filter(u => u.isNew).length;

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
        {filtered.map((update, i) => {
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
        })}
      </div>
    </div>
  );
}
