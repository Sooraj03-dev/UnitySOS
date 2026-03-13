"use client";

import { useState } from "react";
import { ShieldCheck, Users, AlertTriangle, MapPin, Clock, Upload, CheckCircle, Database, BarChart3, Download, RefreshCw } from "lucide-react";

interface SyncPacket {
  id: string;
  type: "alerts" | "users" | "resources" | "requests";
  count: number;
  status: "synced" | "pending" | "syncing";
  lastSync: string;
}

const syncData: SyncPacket[] = [
  { id: "1", type: "alerts",    count: 47,  status: "synced",  lastSync: "2m ago" },
  { id: "2", type: "users",     count: 156, status: "synced",  lastSync: "2m ago" },
  { id: "3", type: "resources", count: 23,  status: "syncing", lastSync: "syncing..." },
  { id: "4", type: "requests",  count: 31,  status: "pending", lastSync: "awaiting connection" },
];

interface HeatmapZone {
  zone: string;
  alerts: number;
  people: number;
  severity: "critical" | "high" | "moderate" | "low";
}

const zones: HeatmapZone[] = [
  { zone: "Sector A — Riverside",  alerts: 18, people: 45, severity: "critical" },
  { zone: "Sector B — Downtown",   alerts: 12, people: 89, severity: "high" },
  { zone: "Sector C — University", alerts: 5,  people: 34, severity: "moderate" },
  { zone: "Sector D — Suburbs",    alerts: 2,  people: 12, severity: "low" },
];

const severityCfg = {
  critical: { color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    bar: "bg-red-500" },
  high:     { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", bar: "bg-orange-500" },
  moderate: { color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", bar: "bg-yellow-500" },
  low:      { color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200",  bar: "bg-green-500" },
};

const syncStatus = {
  synced:  { color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle },
  pending: { color: "text-gray-500",    bg: "bg-gray-100",    icon: Clock },
  syncing: { color: "text-blue-700",    bg: "bg-blue-100",    icon: RefreshCw },
};

export default function AdminPage() {
  const [syncing, setSyncing] = useState(false);

  const totalAlerts = zones.reduce((a, z) => a + z.alerts, 0);
  const totalPeople = zones.reduce((a, z) => a + z.people, 0);
  const syncedCount = syncData.filter(s => s.status === "synced").length;

  return (
    <div className="flex flex-col pb-[76px]">

      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Admin Monitor</h1>
            <p className="text-xs text-gray-500 mt-0.5">Data sync & coordination dashboard</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Alerts",     value: totalAlerts, icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50" },
            { label: "People",     value: totalPeople, icon: Users,         color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Synced",     value: `${syncedCount}/${syncData.length}`, icon: Upload, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Zones",      value: zones.length, icon: MapPin,       color: "text-purple-600", bg: "bg-purple-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`flex flex-col items-center gap-1 py-3 rounded-2xl ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-lg font-extrabold text-gray-900">{value}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sync Section */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" /> Data Sync Status
          </h3>
          <button
            onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 2000); }}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
              syncing ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {syncData.map(item => {
            const st = syncStatus[item.status];
            const StIcon = st.icon;
            return (
              <div key={item.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-3.5 shadow-sm">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${st.bg}`}>
                  <StIcon className={`w-4 h-4 ${st.color} ${item.status === "syncing" ? "animate-spin" : ""}`} />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-gray-900 capitalize">{item.type}</span>
                  <p className="text-[10px] text-gray-400 font-medium">{item.count} records · {item.lastSync}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${st.bg} ${st.color}`}>
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone Report */}
      <div className="px-4 pt-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
          <BarChart3 className="w-3.5 h-3.5" /> Affected Zones
        </h3>
        <div className="flex flex-col gap-2">
          {zones.map(zone => {
            const sev = severityCfg[zone.severity];
            return (
              <div key={zone.zone} className={`rounded-2xl border p-4 ${sev.bg} ${sev.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${sev.color}`}>{zone.zone}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${sev.bg} ${sev.color} border ${sev.border}`}>
                    {zone.severity}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-semibold text-gray-600">
                  <span>🚨 {zone.alerts} alerts</span>
                  <span>👥 {zone.people} people</span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${sev.bar}`} style={{ width: `${(zone.alerts / totalAlerts) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export */}
      <div className="px-4 pt-5">
        <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 transition-colors shadow-md">
          <Download className="w-4 h-4" /> Export Report to Authorities
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          All data will be packaged and transmitted when connectivity is restored.
        </p>
      </div>
    </div>
  );
}
