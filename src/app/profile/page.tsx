"use client";

import { useState } from "react";
import { Camera, Shield, Upload, LogOut, ChevronRight, Edit3 } from "lucide-react";
import { BadgeStatusDisplay, RoleBadge, VerifiedBadge } from "@/components/ui/Badges";
import type { UserRole, BadgeStatus } from "@/components/ui/Badges";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const roles: UserRole[] = ["Civilian", "Volunteer", "Doctor", "Paramedic", "Firefighter", "Rescue"];

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const [role, setRole] = useState<UserRole>("Volunteer");
  const [badgeStatus, setBadgeStatus] = useState<BadgeStatus>("pending");
  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState("+91 98765 43210");
  const [skills, setSkills] = useState("First Aid, CPR, Search & Rescue");
  const [langs, setLangs] = useState("English, Hindi, Kannada");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col pb-[76px]">

      {/* Hero */}
      <div className="flex flex-col items-center gap-3 px-4 pt-8 pb-6 bg-gradient-to-b from-slate-50 to-background border-b border-border">
        {/* Avatar */}
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

        {/* Stats row */}
        <div className="flex gap-6 mt-1">
          {[
            { label: "Alerts Posted", value: "12" },
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
          { label: "Full Name",       value: name,   setter: setName,   type: "text" },
          { label: "Phone Number",    value: phone,  setter: setPhone,  type: "tel"  },
          { label: "Skills",          value: skills, setter: setSkills, type: "text" },
          { label: "Languages",       value: langs,  setter: setLangs,  type: "text" },
        ].map(({ label, value, setter, type }) => (
          <div key={label}>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              {label}
            </label>
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

        {/* Role selector */}
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

      {/* Verification */}
      <div className="flex flex-col gap-3 px-4 pt-6">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verification Status</h3>
        </div>

        <BadgeStatusDisplay status={badgeStatus} />

        {badgeStatus !== "verified" && (
          <button className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl border border-dashed border-blue-300 bg-blue-50/50 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors">
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Verification Documents
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Demo toggle */}
        <div className="flex flex-wrap gap-2 mt-1">
          {(["unverified", "pending", "verified"] as BadgeStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setBadgeStatus(s)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold border transition-all",
                badgeStatus === s ? "bg-slate-800 text-white border-transparent" : "bg-muted text-muted-foreground border-transparent"
              )}
            >
              Preview: {s}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground">↑ Toggle badge status demo</p>
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
