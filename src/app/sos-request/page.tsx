"use client";

import { useState } from "react";
import { Heart, Utensils, ShieldAlert, Package, Truck, Droplets, AlertCircle, CheckCircle, Clock, MapPin, Send } from "lucide-react";

type RequestCategory = "Medical" | "Food & Water" | "Rescue" | "Shelter" | "Supplies" | "Transport";

interface SOSRequest {
  id: string;
  category: RequestCategory;
  urgency: "critical" | "high" | "medium";
  description: string;
  people: number;
  status: "pending" | "acknowledged" | "dispatched";
  time: string;
}

const mockRequests: SOSRequest[] = [
  { id: "1", category: "Medical",      urgency: "critical", description: "Diabetic patient needs insulin urgently",      people: 1, status: "dispatched",    time: "5m ago" },
  { id: "2", category: "Food & Water", urgency: "high",     description: "12 people stranded without food since morning", people: 12, status: "acknowledged", time: "20m ago" },
  { id: "3", category: "Rescue",       urgency: "critical", description: "Family trapped on 3rd floor, water rising",    people: 4, status: "pending",       time: "just now" },
];

const categoryCfg: Record<RequestCategory, { icon: typeof Heart; color: string; bg: string; border: string }> = {
  "Medical":      { icon: Heart,       color: "text-rose-700",   bg: "bg-rose-50",   border: "border-rose-200" },
  "Food & Water": { icon: Utensils,    color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" },
  "Rescue":       { icon: ShieldAlert, color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200" },
  "Shelter":      { icon: Package,     color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  "Supplies":     { icon: Droplets,    color: "text-cyan-700",   bg: "bg-cyan-50",   border: "border-cyan-200" },
  "Transport":    { icon: Truck,       color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
};

const urgencyCfg = {
  critical: { color: "text-red-700",    bg: "bg-red-100",    label: "🔴 Critical" },
  high:     { color: "text-orange-700", bg: "bg-orange-100", label: "🟠 High" },
  medium:   { color: "text-yellow-700", bg: "bg-yellow-100", label: "🟡 Medium" },
};

const statusCfg = {
  pending:      { color: "text-gray-600",    bg: "bg-gray-100",    icon: Clock,       label: "Pending" },
  acknowledged: { color: "text-blue-700",    bg: "bg-blue-100",    icon: CheckCircle, label: "Acknowledged" },
  dispatched:   { color: "text-emerald-700", bg: "bg-emerald-100", icon: Truck,       label: "Dispatched" },
};

const categories: RequestCategory[] = ["Medical", "Food & Water", "Rescue", "Shelter", "Supplies", "Transport"];

export default function SOSRequestPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCat, setSelectedCat] = useState<RequestCategory>("Rescue");
  const [urgency, setUrgency] = useState<"critical" | "high" | "medium">("critical");
  const [desc, setDesc] = useState("");
  const [people, setPeople] = useState("1");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowForm(false); setDesc(""); }, 3000);
  };

  return (
    <div className="flex flex-col pb-[76px]">

      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-200 bg-gradient-to-b from-red-50/80 to-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md">
            <AlertCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">SOS Requests</h1>
            <p className="text-xs text-gray-500 mt-0.5">Request food, medical aid, rescue & more</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-sm font-extrabold shadow-md hover:opacity-95 transition-opacity active:scale-[0.98]"
        >
          {showForm ? "✕ Cancel" : "🚨 New Emergency Request"}
        </button>
      </div>

      {/* New Request Form */}
      {showForm && !submitted && (
        <div className="px-4 pt-4 flex flex-col gap-4 animate-fade-up">
          {/* Category */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">What do you need?</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => {
                const cfg = categoryCfg[cat];
                const Icon = cfg.icon;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-bold transition-all ${
                      selectedCat === cat
                        ? `${cfg.bg} ${cfg.border} ${cfg.color} ring-2 ring-offset-1 ring-red-300`
                        : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Urgency Level</label>
            <div className="flex gap-2">
              {(["critical", "high", "medium"] as const).map(u => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    urgency === u
                      ? `${urgencyCfg[u].bg} ${urgencyCfg[u].color} border-current`
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  {urgencyCfg[u].label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder="Describe your emergency situation clearly..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 placeholder:text-gray-400"
            />
          </div>

          {/* People count */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">People Affected</label>
            <input type="number" value={people} onChange={e => setPeople(e.target.value)} min="1"
              className="w-24 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>

          {/* GPS */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-200">
            <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-700">GPS Auto-attached</p>
              <p className="text-[10px] text-blue-600">Your location is shared with responders</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!desc.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-sm font-extrabold shadow-lg hover:opacity-95 active:scale-[0.98] disabled:opacity-40"
          >
            <Send className="w-4 h-4 inline mr-2" />
            Send Emergency Request
          </button>
        </div>
      )}

      {/* Success */}
      {submitted && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-extrabold">Request Sent!</h3>
          <p className="text-xs text-gray-500 text-center">Your emergency request has been broadcast to nearby responders and will sync to authorities when connectivity is available.</p>
        </div>
      )}

      {/* Active Requests */}
      {!showForm && (
        <div className="flex flex-col gap-3 px-4 pt-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Active Requests</h3>
          {mockRequests.map(req => {
            const cat = categoryCfg[req.category];
            const urg = urgencyCfg[req.urgency];
            const stat = statusCfg[req.status];
            const CatIcon = cat.icon;
            const StatIcon = stat.icon;
            return (
              <div key={req.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${cat.bg}`}>
                      <CatIcon className={`w-4 h-4 ${cat.color}`} />
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>{req.category}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${urg.bg} ${urg.color}`}>{urg.label}</span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400">{req.time}</span>
                </div>
                <p className="text-sm font-medium text-gray-800">{req.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400">{req.people} {req.people > 1 ? "people" : "person"} affected</span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                    <StatIcon className="w-3 h-3" />
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
