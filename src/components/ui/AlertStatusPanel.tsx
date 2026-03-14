"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck, X, Siren } from "lucide-react";
import { cn } from "@/lib/utils";
import { playCriticalSound, playWarningSound, playSafeSound, stopAllSounds } from "@/lib/alertSounds";

type AlertLevel = "safe" | "warning" | "critical" | null;

const alertConfig = {
  critical: {
    icon: Siren,
    label: "🔴 CRITICAL ALERT",
    description: "Emergency detected! All nearby responders have been notified. Stay alert and follow evacuation routes.",
    bg: "bg-red-600",
    bgGlow: "bg-red-500",
    border: "border-red-400",
    text: "text-white",
    btnBg: "bg-red-600 hover:bg-red-700 ring-red-300",
    btnText: "text-white",
    ring: "ring-red-500/40",
    gradient: "from-red-600 via-red-500 to-rose-600",
    banner: "from-red-600 to-red-800",
    pulse: true,
  },
  warning: {
    icon: AlertTriangle,
    label: "🟡 WARNING",
    description: "Potential hazard detected in your area. Stay cautious and monitor for updates.",
    bg: "bg-amber-500",
    bgGlow: "bg-amber-400",
    border: "border-amber-400",
    text: "text-white",
    btnBg: "bg-amber-500 hover:bg-amber-600 ring-amber-300",
    btnText: "text-white",
    ring: "ring-amber-500/40",
    gradient: "from-amber-500 via-yellow-500 to-amber-600",
    banner: "from-amber-500 to-amber-700",
    pulse: false,
  },
  safe: {
    icon: ShieldCheck,
    label: "🟢 ALL CLEAR",
    description: "No threats detected. Your area is safe. Continue normal activities.",
    bg: "bg-emerald-500",
    bgGlow: "bg-emerald-400",
    border: "border-emerald-400",
    text: "text-white",
    btnBg: "bg-emerald-500 hover:bg-emerald-600 ring-emerald-300",
    btnText: "text-white",
    ring: "ring-emerald-500/40",
    gradient: "from-emerald-500 via-green-500 to-emerald-600",
    banner: "from-emerald-500 to-emerald-700",
    pulse: false,
  },
};

export default function AlertStatusPanel() {
  const [activeLevel, setActiveLevel] = useState<AlertLevel>(null);

  const handleTrigger = (level: AlertLevel) => {
    stopAllSounds(); // Stop any previous sound
    if (level === activeLevel) {
      setActiveLevel(null);
      return;
    }
    setActiveLevel(level);
    // Play the corresponding sound
    if (level === "critical") playCriticalSound();
    else if (level === "warning") playWarningSound();
    else if (level === "safe") playSafeSound();
  };

  const dismiss = () => {
    stopAllSounds();
    setActiveLevel(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Active alert banner */}
      {activeLevel && (
        <div className={cn(
          "relative rounded-2xl overflow-hidden border shadow-lg",
          alertConfig[activeLevel].border,
          activeLevel === "critical" && "animate-pulse-border"
        )}>
          {/* Animated gradient background */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r opacity-100",
            alertConfig[activeLevel].gradient
          )} />

          {/* Flashing overlay for critical */}
          {activeLevel === "critical" && (
            <div className="absolute inset-0 bg-red-400/30 animate-flash" />
          )}

          <div className="relative flex items-start gap-3 px-4 py-4">
            {/* Icon */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md",
              activeLevel === "critical" ? "bg-white/20" : "bg-white/20"
            )}>
              {(() => {
                const Icon = alertConfig[activeLevel].icon;
                return <Icon className={cn("w-5 h-5", alertConfig[activeLevel].text)} strokeWidth={2.5} />;
              })()}
            </div>

            <div className="flex-1">
              <p className={cn("text-sm font-extrabold tracking-wide", alertConfig[activeLevel].text)}>
                {alertConfig[activeLevel].label}
              </p>
              <p className={cn("text-xs mt-0.5 leading-relaxed opacity-90", alertConfig[activeLevel].text)}>
                {alertConfig[activeLevel].description}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Siren stripes for critical */}
          {activeLevel === "critical" && (
            <div className="h-1.5 bg-gradient-to-r from-red-500 via-white via-red-500 via-white to-red-500 animate-siren-stripe" />
          )}
        </div>
      )}

      {/* 3 trigger buttons */}
      <div className="grid grid-cols-3 gap-2">
        {/* Critical (Red) */}
        <button
          onClick={() => handleTrigger("critical")}
          className={cn(
            "flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all active:scale-95 shadow-sm",
            activeLevel === "critical"
              ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/30 scale-[1.02]"
              : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            activeLevel === "critical" ? "bg-white/20" : "bg-red-100"
          )}>
            <ShieldAlert className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Critical</span>
        </button>

        {/* Warning (Yellow) */}
        <button
          onClick={() => handleTrigger("warning")}
          className={cn(
            "flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all active:scale-95 shadow-sm",
            activeLevel === "warning"
              ? "bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/30 scale-[1.02]"
              : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            activeLevel === "warning" ? "bg-white/20" : "bg-amber-100"
          )}>
            <AlertTriangle className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Warning</span>
        </button>

        {/* Safe (Green) */}
        <button
          onClick={() => handleTrigger("safe")}
          className={cn(
            "flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all active:scale-95 shadow-sm",
            activeLevel === "safe"
              ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]"
              : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            activeLevel === "safe" ? "bg-white/20" : "bg-emerald-100"
          )}>
            <ShieldCheck className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Safe</span>
        </button>
      </div>
    </div>
  );
}
