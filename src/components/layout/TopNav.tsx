"use client";

import Link from "next/link";
import { Bell, AlertTriangle, Check, CheckCheck, Volume2, VolumeX, MapPin } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { fetchAlerts } from "@/lib/alerts";
import { supabase } from "@/lib/supabase";
import { playNotificationSound, isMuted, toggleMute } from "@/lib/alertSounds";

type ConnStatus = "online" | "syncing" | "offline";

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  userName?: string;
  lat?: number;
  lng?: number;
}

export default function TopNav() {
  const { user } = useAuth();
  const [status, setStatus] = useState<ConnStatus>("online");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasInteracted = useRef(false);

  const userInitial = user?.user_metadata?.full_name?.charAt(0)?.toUpperCase()
    || user?.email?.charAt(0)?.toUpperCase()
    || "?";

  // Load notifications from alerts
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const alerts = await fetchAlerts(15);
      setNotifications(alerts.map((a, i) => ({
        id: a.id,
        title: `${a.type} Alert`,
        body: a.description.length > 80 ? a.description.slice(0, 80) + "…" : a.description,
        time: a.time,
        read: i >= 3,
        userName: a.userName,
      })));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Online/offline detection
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

  // Supabase Realtime: listen for new alerts from OTHER users
  useEffect(() => {
    const channel = supabase
      .channel("public:alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;

          const newNotif: Notification = {
            id: row.id as string,
            title: `🚨 ${row.type} Alert`,
            body: (row.description as string)?.slice(0, 80) || "New alert received",
            time: "Just now",
            read: false,
            userName: row.user_name as string,
            lat: row.latitude as number | undefined,
            lng: row.longitude as number | undefined,
          };

          setNotifications(prev => [newNotif, ...prev]);

          // Play notification sound (only if user has interacted)
          if (hasInteracted.current) {
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleBellClick = () => {
    const opening = !dropdownOpen;
    setDropdownOpen(opening);
    if (opening && notifications.length === 0) {
      loadNotifications();
    }
  };

  const handleMuteToggle = () => {
    const newState = toggleMute();
    setMutedState(newState);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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

        {/* Mute toggle */}
        <button
          onClick={handleMuteToggle}
          className={cn(
            "p-2 rounded-xl transition-colors",
            muted
              ? "bg-gray-100 text-gray-400 hover:bg-gray-200"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
          title={muted ? "Unmute sounds" : "Mute sounds"}
        >
          {muted ? (
            <VolumeX className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <Volume2 className="h-4 w-4" strokeWidth={1.8} />
          )}
        </button>

        {/* Bell + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleBellClick}
            className={cn(
              "relative p-2 rounded-xl transition-colors",
              dropdownOpen
                ? "bg-red-50 text-red-600"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Bell className="h-5 w-5" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-up">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                <h3 className="text-sm font-extrabold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col gap-2 p-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 rounded-xl animate-pulse">
                        <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                        <div className="h-2.5 w-full bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map(n => (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-none",
                          n.read
                            ? "bg-white hover:bg-gray-50 opacity-60"
                            : "bg-red-50/40 hover:bg-red-50/70"
                        )}
                      >
                        {/* Unread dot */}
                        <div className="pt-1.5 shrink-0">
                          <span className={cn(
                            "block w-2 h-2 rounded-full",
                            n.read ? "bg-gray-300" : "bg-red-500"
                          )} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("text-xs font-bold truncate", n.read ? "text-gray-500" : "text-gray-900")}>
                              {n.title}
                            </span>
                            <span className="text-[9px] font-medium text-gray-400 shrink-0">{n.time}</span>
                          </div>
                          <p className={cn("text-[11px] mt-0.5 leading-snug", n.read ? "text-gray-400" : "text-gray-600")}>
                            {n.body}
                          </p>
                          {/* User and location info */}
                          <div className="flex items-center gap-2 mt-1">
                            {n.userName && (
                              <span className="text-[9px] font-semibold text-gray-500">
                                by {n.userName}
                              </span>
                            )}
                            {n.lat && n.lng && (
                              <a
                                href={`https://www.google.com/maps?q=${n.lat},${n.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-0.5 text-[9px] font-bold text-blue-600 hover:text-blue-800"
                              >
                                <MapPin className="w-2.5 h-2.5" />
                                View Location
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Read indicator */}
                        {n.read && (
                          <Check className="w-3 h-3 text-gray-400 shrink-0 mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/60">
                <Link
                  href="/updates"
                  onClick={() => setDropdownOpen(false)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View all updates →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center text-white hover:scale-105 transition-transform shrink-0 font-bold text-sm">
          {userInitial}
        </Link>
      </div>
    </header>
  );
}
