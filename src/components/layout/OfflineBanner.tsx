"use client";

import { WifiOff, RefreshCw, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type BannerStatus = "online" | "syncing" | "offline" | "synced";

export default function OfflineBanner() {
  const [status, setStatus] = useState<BannerStatus>("online");

  useEffect(() => {
    const handleOnline = () => {
      setStatus("syncing");
      setTimeout(() => {
        setStatus("synced");
        setTimeout(() => setStatus("online"), 2500);
      }, 2000);
    };
    const handleOffline = () => setStatus("offline");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (!window.navigator.onLine) setStatus("offline");
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (status === "online") return null;

  const configs = {
    offline: {
      bg: "bg-red-600/90",
      icon: <WifiOff className="w-3.5 h-3.5 shrink-0" />,
      text: "You are offline — data is saved locally and will sync when back online.",
    },
    syncing: {
      bg: "bg-orange-500/90",
      icon: <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin" />,
      text: "Syncing local changes...",
    },
    synced: {
      bg: "bg-emerald-600/90",
      icon: <CheckCircle className="w-3.5 h-3.5 shrink-0" />,
      text: "All data is up to date.",
    },
  };

  const cfg = configs[status as keyof typeof configs];

  return (
    <div className={cn(
      "fixed bottom-[68px] left-0 right-0 z-40 py-2 px-4 text-white text-xs font-semibold animate-slide-up",
      cfg.bg
    )}>
      <div className="flex items-center justify-center gap-2 max-w-lg mx-auto">
        {cfg.icon}
        <span>{cfg.text}</span>
      </div>
    </div>
  );
}
