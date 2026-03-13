"use client";

import { useState } from "react";
import { MapPin, Camera, ChevronDown, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertType } from "@/components/ui/AlertCard";

const alertTypes: AlertType[] = ["SOS", "Medical", "Blocked Route", "Resources", "General"];

const typeCfg: Record<AlertType, { color: string; bg: string; icon: string }> = {
  SOS:            { color: "text-red-700",    bg: "bg-red-50",    icon: "🆘" },
  Medical:        { color: "text-orange-700", bg: "bg-orange-50", icon: "🏥" },
  "Blocked Route":{ color: "text-yellow-700", bg: "bg-yellow-50", icon: "🚧" },
  Resources:      { color: "text-blue-700",   bg: "bg-blue-50",   icon: "📦" },
  General:        { color: "text-gray-700",   bg: "bg-gray-50",   icon: "📢" },
};

export default function PostAlertPage() {
  const [type, setType] = useState<AlertType>("General");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitted(true);
    // TODO: Post to Supabase + cache in Dexie
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 h-[60vh] px-8 text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-600" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">Alert Posted!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your <span className="font-bold">{type}</span> alert is now visible to nearby people.
          </p>
        </div>
        <button
          onClick={() => { setSubmitted(false); setDescription(""); setType("General"); }}
          className="px-8 py-3 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sos"
        >
          Post Another Alert
        </button>
      </div>
    );
  }

  const cfg = typeCfg[type];

  return (
    <div className="flex flex-col pb-[76px]">
      <div className="px-4 pt-5 pb-3 border-b border-border">
        <h1 className="text-xl font-extrabold tracking-tight">Post Alert</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Share an emergency alert with nearby people</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pt-5">

        {/* Category */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
            Alert Category
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-sm font-bold transition-all",
                cfg.color, cfg.bg, "border-transparent ring-1",
                open ? "ring-primary" : "ring-transparent"
              )}
            >
              <span>{cfg.icon} &nbsp;{type}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
            </button>

            {open && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-20 animate-fade-up">
                {alertTypes.map(t => {
                  const c = typeCfg[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setType(t); setOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left hover:opacity-80 transition-opacity",
                        c.color, c.bg,
                        type === t && "opacity-100" 
                      )}
                    >
                      <span>{c.icon}</span>
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
            Description <span className="text-primary">*</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the emergency clearly. Include location details, number of people affected, etc."
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/30 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/70 leading-relaxed"
          />
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{description.length}/300</p>
        </div>

        {/* Photo */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
            Photo (optional)
          </label>
          <button type="button" className="w-full h-24 rounded-2xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-all">
            <Camera className="w-6 h-6" strokeWidth={1.5} />
            <span className="text-xs font-semibold">Tap to add photo</span>
          </button>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-200">
          <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-blue-700">GPS Location</p>
            <p className="text-[10px] text-blue-600">12.9716° N, 77.5946° E — will be attached automatically</p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-sm font-extrabold shadow-sos hover:opacity-95 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!description.trim()}
        >
          🚨 Post Alert Now
        </button>
      </form>
    </div>
  );
}
