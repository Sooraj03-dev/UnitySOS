"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { mockResponders } from "@/lib/mockData";
import type { UserRole } from "@/components/ui/Badges";

const roleFilters: (UserRole | "All")[] = ["All", "Doctor", "Paramedic", "Rescue", "Firefighter", "Volunteer", "Civilian"];

export default function NearbyPage() {
  const [activeRole, setActiveRole] = useState<UserRole | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = mockResponders.filter(r => {
    const matchRole = activeRole === "All" || r.role === activeRole;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="flex flex-col pb-[76px]">

      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-border">
        <h1 className="text-xl font-extrabold tracking-tight">Nearby People</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Showing {filtered.length} people within 5 km</p>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
        </div>

        {/* Role filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar pb-1">
          {roleFilters.map(role => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeRole === role
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 px-4 pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <span className="text-3xl">👥</span>
            <p className="text-sm font-semibold mt-2">No people found</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="animate-fade-up">
              <div className="bg-card border border-border rounded-2xl p-4 card-shadow flex items-center gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-300 to-indigo-500 flex items-center justify-center text-xl font-bold text-white">
                    {r.avatar}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card ${r.online ? "bg-emerald-500" : "bg-gray-300"}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${r.role === 'Doctor' ? 'bg-teal-50 text-teal-700' : r.role === 'Rescue' ? 'bg-rose-50 text-rose-700' : r.role === 'Firefighter' ? 'bg-orange-50 text-orange-700' : r.role === 'Paramedic' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'}`}>
                      {r.role}
                    </span>
                    {r.badgeStatus === "verified" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                        ✓ Verified
                      </span>
                    )}
                    {r.badgeStatus === "pending" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200">
                        ◑ Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">📍 {r.distance} away</p>
                </div>

                {/* Contact */}
                <button className="shrink-0 px-3 py-2 rounded-xl bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition-colors">
                  Contact
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
