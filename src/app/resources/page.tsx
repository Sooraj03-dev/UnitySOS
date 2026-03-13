"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { mockResources } from "@/lib/mockData";
import type { ResourceType } from "@/components/ui/ResourceCard";

const typeFilters: (ResourceType | "All")[] = ["All", "Medical", "Shelter", "Water", "Supplies", "Emergency"];

export default function ResourcesPage() {
  const [activeType, setActiveType] = useState<ResourceType | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = mockResources.filter(r => {
    const matchType = activeType === "All" || r.type === activeType;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="flex flex-col pb-[76px]">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-border">
        <h1 className="text-xl font-extrabold tracking-tight">Resources</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Emergency resources near you</p>

        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar pb-1">
          {typeFilters.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeType === type
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 px-4 pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <span className="text-3xl">📦</span>
            <p className="text-sm font-semibold mt-2">No resources found</p>
          </div>
        ) : (
          filtered.map(r => <ResourceCard key={r.id} resource={r} />)
        )}
      </div>
    </div>
  );
}
