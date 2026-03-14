/**
 * Hook for managing browser Notification API permission.
 *
 * Returns the current permission state and a function to request permission.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

export type NotificationPermissionState = "granted" | "denied" | "default";

interface UseNotificationPermissionReturn {
  permission: NotificationPermissionState;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermissionState>;
}

export function useNotificationPermission(): UseNotificationPermissionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermissionState>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission as NotificationPermissionState);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    if (!isSupported) return "denied";

    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermissionState);
    return result as NotificationPermissionState;
  }, [isSupported]);

  return { permission, isSupported, requestPermission };
}

/**
 * Show a browser notification via the active service worker.
 * Falls back to the Notification constructor if SW is not available.
 */
export async function showBrowserNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  // Don't notify if the page is focused
  if (document.visibilityState === "visible" && document.hasFocus()) return;

  try {
    // Prefer service worker notification (works in background)
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(title, {
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        vibrate: [200, 100, 200],
        tag: "unity-sos-alert",
        renotify: true,
        ...options,
      });
    } else {
      // Fallback: direct Notification
      new Notification(title, {
        icon: "/icon-192x192.png",
        ...options,
      });
    }
  } catch (err) {
    console.error("[Notification] Failed to show notification:", err);
  }
}
