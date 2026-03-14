"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";

export default function NotificationPermission() {
  const { permission, isSupported, requestPermission } = useNotificationPermission();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not supported, already granted/denied, or dismissed
  if (!isSupported || permission !== "default" || dismissed) return null;

  const handleEnable = async () => {
    await requestPermission();
  };

  return (
    <div className="fixed top-16 left-4 right-4 z-50 animate-slide-up sm:left-auto sm:right-4 sm:w-96">
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <Bell className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              Enable Notifications
            </h3>
            <p className="mt-0.5 text-xs text-gray-600">
              Get instant alerts when emergencies are posted nearby
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleEnable}
            className="flex-1 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-amber-600 active:scale-[0.98]"
          >
            Enable
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-xl border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100 active:scale-[0.98]"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
