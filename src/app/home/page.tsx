"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapIcon, Users, Megaphone, Package, Bluetooth, ShieldAlert, ShieldCheck, Zap, ChevronRight, Signal } from "lucide-react";
import SOSButton from "@/components/ui/SOSButton";
import { AlertCard } from "@/components/ui/AlertCard";
import type { AlertData } from "@/components/ui/AlertCard";
import { ResponderCard } from "@/components/ui/ResponderCard";
import MapPreview from "@/components/ui/MapPreview";
import { mockResponders } from "@/lib/mockData";
import { fetchAlerts } from "@/lib/alerts";

const quickActions = [
  { label: "Open Map",      icon: MapIcon,      color: "bg-blue-100 text-blue-600",     href: "/map" },
  { label: "Nearby",        icon: Users,        color: "bg-green-100 text-green-600",   href: "/nearby" },
  { label: "Post Alert",    icon: Megaphone,    color: "bg-rose-100 text-rose-600",     href: "/post-alert" },
  { label: "Resources",     icon: Package,      color: "bg-purple-100 text-purple-600", href: "/resources" },
  { label: "Bluetooth",     icon: Bluetooth,    color: "bg-indigo-100 text-indigo-600", href: "/bluetooth" },
  { label: "SOS Request",   icon: ShieldAlert,  color: "bg-red-100 text-red-600",       href: "/sos-request" },
  { label: "Live Updates",  icon: Zap,          color: "bg-amber-100 text-amber-600",   href: "/updates" },
  { label: "Admin",         icon: ShieldCheck,  color: "bg-slate-100 text-slate-600",   href: "/admin" },
];

export default function HomePage() {
  const router = useRouter();
  const [sosFired, setSosFired] = useState(false);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  // Fetch live alerts from Supabase
  useEffect(() => {
    fetchAlerts(10)
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setAlertsLoading(false));
  }, []);

  const handleSOS = () => {
    setSosFired(true);
    setTimeout(() => setSosFired(false), 3000);
  };

  return (
    <div className="flex flex-col pb-[76px]">

      {/* ── Emergency Control ── */}
      <section className="flex flex-col items-center gap-2 py-10 px-4 bg-gradient-to-b from-red-50/80 to-white border-b border-gray-200">
        <SOSButton onClick={handleSOS} />
        <div className="flex flex-col items-center mt-1 gap-1">
          {sosFired ? (
            <p className="text-sm font-bold text-emerald-600 animate-fade-up">✓ SOS broadcast sent! Responders notified.</p>
          ) : (
            <h2 className="text-base font-bold text-gray-900">Send Emergency SOS</h2>
          )}
          <p className="text-xs text-gray-500 text-center max-w-[260px]">
            Your GPS location will be shared with nearby responders instantly.
          </p>
        </div>
      </section>

      {/* ── Location Sharing Indicator ── */}
      <div className="mx-4 mt-4 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-blue-50 border border-blue-200">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Signal className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-bold text-blue-700">Location Sharing Active</p>
          <p className="text-[10px] text-blue-600">Auto-sharing at 12.97°N, 77.59°E · Updated 10s ago</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
      </div>

      {/* ── Quick Actions ── */}
      <section className="px-4 pt-5 pb-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Quick Actions</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {quickActions.map(({ label, icon: Icon, color, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="flex flex-col items-center gap-2 min-w-[70px] hover:scale-105 transition-transform active:scale-95"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${color}`}>
                <Icon className="w-6 h-6" strokeWidth={1.8} />
              </div>
              <span className="text-[10px] font-semibold text-foreground text-center leading-tight w-16">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-border mx-0 mt-3" />

      {/* ── Nearby Responders ── */}
      <section className="px-4 pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nearby Responders</h3>
          <button onClick={() => router.push("/nearby")} className="flex items-center text-xs font-bold text-accent">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 hide-scrollbar snap-x">
          {mockResponders.map(r => <ResponderCard key={r.id} responder={r} />)}
        </div>
      </section>

      <div className="h-px w-full bg-border mt-1" />

      {/* ── Map Preview ── */}
      <section className="px-4 pt-5 pb-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Area Map</h3>
        <MapPreview height="220px" onOpenFull={() => router.push("/map")} />
      </section>

      <div className="h-px w-full bg-border mt-4" />

      {/* ── Live Alert Feed ── */}
      <section className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Alert Feed</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-red-600">Live</span>
          </div>
        </div>

        {alertsLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                <div className="h-4 w-20 bg-gray-200 rounded-full mb-3" />
                <div className="h-3 w-full bg-gray-200 rounded mb-2" />
                <div className="h-3 w-3/4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm font-bold text-gray-400">No alerts yet</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to post an emergency alert</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
          </div>
        )}

        <button
          onClick={() => router.push("/post-alert")}
          className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-sm font-bold text-white hover:opacity-95 transition-opacity shadow-sos"
        >
          🚨 Post an Alert
        </button>
      </section>

    </div>
  );
}