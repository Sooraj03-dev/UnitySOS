/**
 * Slide-in toast notification for new alerts.
 *
 * Shows alert type, description preview, poster name.
 * Auto-dismisses after 6 seconds. Click to dismiss.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { X, AlertTriangle, Heart, Package, Megaphone, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertType } from "@/components/ui/AlertCard";

export interface ToastData {
  id: string;
  alertType: AlertType;
  description: string;
  userName: string;
  createdAt: number;
}

const toastCfg: Record<AlertType, { icon: typeof AlertTriangle; color: string; bg: string; border: string; accent: string }> = {
  SOS:            { icon: AlertCircle,   color: "text-red-700",    bg: "bg-red-50",     border: "border-red-300",    accent: "bg-red-500" },
  Medical:        { icon: Heart,         color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-300", accent: "bg-orange-500" },
  "Blocked Route":{ icon: AlertTriangle, color: "text-yellow-700", bg: "bg-yellow-50",  border: "border-yellow-300", accent: "bg-yellow-500" },
  Resources:      { icon: Package,       color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-300",   accent: "bg-blue-500" },
  General:        { icon: Megaphone,     color: "text-gray-700",   bg: "bg-gray-50",    border: "border-gray-300",   accent: "bg-gray-500" },
};

interface AlertToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
  index: number;
}

export function AlertToast({ toast, onDismiss, index }: AlertToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const cfg = toastCfg[toast.alertType] ?? toastCfg.General;
  const Icon = cfg.icon;

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  // Slide in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Auto dismiss
  useEffect(() => {
    const t = setTimeout(() => handleDismiss(), 6000);
    return () => clearTimeout(t);
  }, [handleDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto w-[340px] max-w-[90vw] rounded-2xl border shadow-xl backdrop-blur-sm transition-all duration-300 overflow-hidden",
        cfg.bg, cfg.border,
        visible && !exiting
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
      style={{ marginTop: index > 0 ? "8px" : "0" }}
      onClick={handleDismiss}
      role="alert"
    >
      {/* Accent stripe */}
      <div className={cn("h-1 w-full", cfg.accent)} />

      <div className="flex items-start gap-3 px-4 py-3">
        {/* Icon */}
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
          <Icon className={cn("w-4 h-4", cfg.color)} strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("text-[10px] font-extrabold uppercase tracking-wider", cfg.color)}>
              🚨 {toast.alertType} Alert
            </span>
          </div>
          <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-2">
            {toast.description}
          </p>
          <p className="text-[10px] font-semibold text-gray-400 mt-1">
            by {toast.userName} · just now
          </p>
        </div>

        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
