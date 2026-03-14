"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Camera, Shield, LogOut, ChevronRight, Edit3, Trash2, AlertTriangle, Upload, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { BadgeStatusDisplay, RoleBadge, VerifiedBadge } from "@/components/ui/Badges";
import type { UserRole, BadgeStatus } from "@/components/ui/Badges";
import { AlertCard } from "@/components/ui/AlertCard";
import type { AlertData } from "@/components/ui/AlertCard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { fetchUserAlerts, deleteAlert, countUserAlerts } from "@/lib/alerts";
import {
  uploadVerificationDoc,
  submitVerification,
  fetchMyVerifications,
  deleteVerificationDoc,
  type VerificationDoc,
} from "@/lib/verification";

const roles: UserRole[] = ["Civilian", "Volunteer", "Doctor", "Paramedic", "Firefighter", "Rescue"];

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const [role, setRole] = useState<UserRole>("Volunteer");
  const [badgeStatus, setBadgeStatus] = useState<BadgeStatus>("unverified");
  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState("+91 98765 43210");
  const [skills, setSkills] = useState("First Aid, CPR, Search & Rescue");
  const [langs, setLangs] = useState("English, Hindi, Kannada");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // My Alerts state
  const [myAlerts, setMyAlerts] = useState<AlertData[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Verification state
  const [verDocs, setVerDocs] = useState<VerificationDoc[]>([]);
  const [verLoading, setVerLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [verError, setVerError] = useState("");
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const verFileRef = useRef<HTMLInputElement>(null);

  const loadMyAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const [alerts, count] = await Promise.all([
        fetchUserAlerts(user.id),
        countUserAlerts(user.id),
      ]);
      setMyAlerts(alerts);
      setAlertCount(count);
    } catch {
      setMyAlerts([]);
      setAlertCount(0);
    } finally {
      setAlertsLoading(false);
    }
  }, [user]);

  const loadVerDocs = useCallback(async () => {
    if (!user) return;
    try {
      const docs = await fetchMyVerifications(user.id);
      setVerDocs(docs);

      // Auto-determine badge status from docs
      if (docs.some(d => d.status === "approved")) {
        setBadgeStatus("verified");
      } else if (docs.some(d => d.status === "pending")) {
        setBadgeStatus("pending");
      } else {
        setBadgeStatus("unverified");
      }
    } catch {
      setVerDocs([]);
    } finally {
      setVerLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMyAlerts();
    loadVerDocs();
  }, [loadMyAlerts, loadVerDocs]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAlert(id);
      setMyAlerts(prev => prev.filter(a => a.id !== id));
      setAlertCount(prev => Math.max(0, prev - 1));
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  const handleVerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setVerError("Only JPG, PNG, WebP, or PDF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setVerError("File must be under 10MB.");
      return;
    }

    setVerError("");
    setUploading(true);
    try {
      const fileUrl = await uploadVerificationDoc(file);
      await submitVerification(fileUrl, file.name);
      await loadVerDocs();
    } catch (err: unknown) {
      setVerError((err as Error).message || "Upload failed.");
    } finally {
      setUploading(false);
      if (verFileRef.current) verFileRef.current.value = "";
    }
  };

  const handleDeleteDoc = async (id: string) => {
    setDeletingDocId(id);
    try {
      await deleteVerificationDoc(id);
      setVerDocs(prev => prev.filter(d => d.id !== id));
    } catch {
      // silently fail
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case "rejected": return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      default: return <Clock className="w-3.5 h-3.5 text-yellow-600" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "rejected": return "text-red-700 bg-red-50 border-red-200";
      default: return "text-yellow-700 bg-yellow-50 border-yellow-200";
    }
  };

  return (
    <div className="flex flex-col pb-[76px]">

      {/* Hero */}
      <div className="flex flex-col items-center gap-3 px-4 pt-8 pb-6 bg-gradient-to-b from-slate-50 to-background border-b border-border">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-red-600 flex items-center justify-center text-4xl font-black text-white shadow-lg">
            {name.charAt(0)}
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <h2 className="text-xl font-extrabold">{name}</h2>
          <div className="flex items-center gap-2">
            <RoleBadge role={role} size="md" />
            <VerifiedBadge status={badgeStatus} size="md" />
          </div>
        </div>

        <div className="flex gap-6 mt-1">
          {[
            { label: "Alerts Posted", value: String(alertCount) },
            { label: "People Helped", value: "47" },
            { label: "Rating",        value: "4.9★" },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-lg font-extrabold text-foreground">{value}</span>
              <span className="text-[10px] font-medium text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Save button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={editing ? handleSave : () => setEditing(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all",
            editing
              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md"
              : "bg-muted text-foreground hover:bg-muted/80"
          )}
        >
          {editing ? (
            saved ? "✓ Saved!" : "Save Profile"
          ) : (
            <><Edit3 className="w-4 h-4" /> Edit Profile</>
          )}
        </button>
      </div>

      {/* Profile Fields */}
      <div className="flex flex-col gap-4 px-4 pt-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Personal Info</h3>
        {[
          { label: "Full Name",    value: name,   setter: setName,   type: "text" },
          { label: "Phone Number", value: phone,  setter: setPhone,  type: "tel"  },
          { label: "Skills",       value: skills, setter: setSkills, type: "text" },
          { label: "Languages",    value: langs,  setter: setLangs,  type: "text" },
        ].map(({ label, value, setter, type }) => (
          <div key={label}>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
            <input
              type={type}
              value={value}
              onChange={e => setter(e.target.value)}
              disabled={!editing}
              className={cn(
                "w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                editing
                  ? "border-primary/40 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  : "border-border bg-muted/30 text-foreground cursor-default"
              )}
            />
          </div>
        ))}

        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Role</label>
          <div className="flex flex-wrap gap-2">
            {roles.map(r => (
              <button
                key={r}
                disabled={!editing}
                onClick={() => setRole(r)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                  role === r
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-muted text-muted-foreground border-transparent",
                  !editing && "cursor-default"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── My Alerts ── */}
      <div className="flex flex-col gap-3 px-4 pt-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">My Alerts</h3>
        </div>

        {alertsLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                <div className="h-4 w-20 bg-gray-200 rounded-full mb-3" />
                <div className="h-3 w-full bg-gray-200 rounded mb-2" />
                <div className="h-3 w-3/4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : myAlerts.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-dashed border-border bg-muted/20">
            <p className="text-sm font-bold text-gray-400">No alerts posted yet</p>
            <p className="text-xs text-gray-400 mt-1">Your posted alerts will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {myAlerts.map(alert => (
              <div key={alert.id} className="relative">
                <AlertCard alert={alert} compact />
                <button
                  onClick={() => handleDelete(alert.id)}
                  disabled={deletingId === alert.id}
                  className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-100 hover:text-red-700 transition-all disabled:opacity-50"
                  title="Delete alert"
                >
                  {deletingId === alert.id ? (
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Document Verification ── */}
      <div className="flex flex-col gap-3 px-4 pt-6">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verification Status</h3>
        </div>

        <BadgeStatusDisplay status={badgeStatus} />

        {/* Error */}
        {verError && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-600 font-medium animate-fade-up">
            <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {verError}
          </div>
        )}

        {/* Upload button */}
        <input
          ref={verFileRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleVerUpload}
          className="hidden"
        />
        <button
          onClick={() => verFileRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl border border-dashed border-blue-300 bg-blue-50/50 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading…" : "Upload Verification Document"}
          </span>
          {uploading ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <p className="text-[9px] text-muted-foreground -mt-1">Accepted: JPG, PNG, WebP, PDF · Max 10MB</p>

        {/* Submitted documents list */}
        {verLoading ? (
          <div className="flex flex-col gap-2">
            {[1].map(i => (
              <div key={i} className="rounded-xl border border-border p-3 animate-pulse">
                <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-2.5 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : verDocs.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Submitted Documents</p>
            {verDocs.map(doc => (
              <div key={doc.id} className={cn("flex items-center gap-3 rounded-xl border p-3", statusColor(doc.status))}>
                <FileText className="w-5 h-5 shrink-0 opacity-60" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{doc.file_name}</p>
                  <p className="text-[10px] opacity-70">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {statusIcon(doc.status)}
                  <span className="text-[10px] font-bold capitalize">{doc.status}</span>
                </div>
                {doc.status === "pending" && (
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    disabled={deletingDocId === doc.id}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/60 text-current opacity-50 hover:opacity-100 transition-all shrink-0 disabled:opacity-30"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="px-4 pt-6">
        <button
          onClick={logout}
          disabled={authLoading}
          className="flex items-center gap-2 w-full py-3.5 rounded-2xl border border-border text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors justify-center disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {authLoading ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </div>
  );
}
