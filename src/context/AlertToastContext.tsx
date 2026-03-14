/**
 * Alert Toast Context — manages the toast notification queue.
 *
 * Wrap the app with <AlertToastProvider> to enable toast notifications
 * from any component via useAlertToast().
 *
 * Listens to Supabase Realtime INSERT events on the alerts table
 * and automatically shows toasts + plays sound.
 */

"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { AlertToast, type ToastData } from "@/components/ui/AlertToast";
import { supabase } from "@/lib/supabase";
import { playNotificationSound } from "@/lib/alertSounds";
import { showBrowserNotification } from "@/hooks/useNotificationPermission";
import type { AlertType } from "@/components/ui/AlertCard";

const MAX_VISIBLE = 3;

interface AlertToastContextType {
  showToast: (toast: Omit<ToastData, "id" | "createdAt">) => void;
}

const AlertToastContext = createContext<AlertToastContextType | undefined>(undefined);

export function AlertToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const hasInteracted = useRef(false);

  // Track user interaction for autoplay policy
  useEffect(() => {
    const markInteracted = () => { hasInteracted.current = true; };
    window.addEventListener("click", markInteracted, { once: true });
    window.addEventListener("touchstart", markInteracted, { once: true });
    return () => {
      window.removeEventListener("click", markInteracted);
      window.removeEventListener("touchstart", markInteracted);
    };
  }, []);

  const showToast = useCallback((data: Omit<ToastData, "id" | "createdAt">) => {
    const newToast: ToastData = {
      ...data,
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      // Keep only MAX_VISIBLE
      return updated.slice(0, MAX_VISIBLE);
    });

    // Play sound
    if (hasInteracted.current) {
      playNotificationSound();
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Supabase Realtime: listen for new alerts and auto-show toasts ──
  useEffect(() => {
    const channel = supabase
      .channel("alert-toast-listener")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          const row = payload.new as Record<string, string>;
          const alertType = row.type as AlertType;
          const description = row.description?.slice(0, 120) || "New alert received";
          const userName = row.user_name || "Unknown";

          // In-app toast
          showToast({ alertType, description, userName });

          // Browser push notification (fires only when page is not focused)
          showBrowserNotification(`🚨 ${alertType} Alert`, {
            body: `${description}\n— ${userName}`,
            tag: `alert-${row.id}`,
            renotify: true,
          } as NotificationOptions & { renotify: boolean });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showToast]);

  return (
    <AlertToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast stack — fixed top-right */}
      {toasts.length > 0 && (
        <div className="fixed top-16 right-4 z-[100] flex flex-col items-end pointer-events-none">
          {toasts.map((toast, i) => (
            <AlertToast
              key={toast.id}
              toast={toast}
              onDismiss={dismissToast}
              index={i}
            />
          ))}
        </div>
      )}
    </AlertToastContext.Provider>
  );
}

export function useAlertToast() {
  const context = useContext(AlertToastContext);
  if (!context) {
    throw new Error("useAlertToast must be used within an AlertToastProvider");
  }
  return context;
}
