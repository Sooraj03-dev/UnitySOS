"use client";

import Link from "next/link";
import { Bell, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type ConnStatus = "online" | "syncing" | "offline";

export default function TopNav() {
  const { user } = useAuth();
  const [status, setStatus] = useState<ConnStatus>("online");
  const [notifCount] = useState(3);

  const userInitial = user?.user_metadata?.full_name?.charAt(0)?.toUpperCase()
    || user?.email?.charAt(0)?.toUpperCase()
    || "?";

  useEffect(() => {
    const handleOnline = () => { setStatus("syncing"); setTimeout(() => setStatus("online"), 2500); };
    const handleOffline = () => setStatus("offline");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (!window.navigator.onLine) setStatus("offline");
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const statusConfig = {
    online: { dot: "bg-emerald-500", label: "Online", ring: "ring-emerald-100" },
    syncing: { dot: "bg-orange-500", label: "Syncing", ring: "ring-orange-100" },
    offline: { dot: "bg-red-500", label: "Offline", ring: "ring-red-100" },
  };

  const cfg = statusConfig[status];

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="flex items-center h-14 px-4 gap-3 max-w-lg mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-auto shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-sm">
            <AlertTriangle className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-foreground">
            Unity<span className="text-primary">SOS</span>
          </span>
        </Link>

        {/* Connectivity */}
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border ring-2 text-xs font-semibold transition-all", cfg.ring, {
          "border-emerald-200 text-emerald-700 bg-emerald-50": status === "online",
          "border-orange-200 text-orange-700 bg-orange-50": status === "syncing",
          "border-red-200 text-red-700 bg-red-50": status === "offline",
        })}>
          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot, status === "syncing" && "animate-pulse")} />
          <span className="hidden sm:inline">{cfg.label}</span>
        </div>

        {/* Bell */}
        <button className="relative p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" strokeWidth={1.8} />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
              {notifCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center text-white hover:scale-105 transition-transform shrink-0 font-bold text-sm">
          {userInitial}
        </Link>
      </div>
    </header>
  );
}
