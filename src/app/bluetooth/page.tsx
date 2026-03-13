"use client";

import { useState } from "react";
import { Bluetooth, BluetoothSearching, Radio, Smartphone, Send, FileText, MessageSquare, Signal, Users, ArrowUpDown, AlertCircle } from "lucide-react";

interface NearbyDevice {
  id: string;
  name: string;
  distance: string;
  signal: "strong" | "medium" | "weak";
  connected: boolean;
  lastSeen: string;
}

const mockDevices: NearbyDevice[] = [
  { id: "1", name: "Sarah's Phone",   distance: "~5m",  signal: "strong", connected: true,  lastSeen: "Now" },
  { id: "2", name: "Rescue Unit #3",  distance: "~12m", signal: "strong", connected: true,  lastSeen: "Now" },
  { id: "3", name: "John D.",         distance: "~25m", signal: "medium", connected: false, lastSeen: "30s ago" },
  { id: "4", name: "Device-7A2F",     distance: "~40m", signal: "weak",   connected: false, lastSeen: "1m ago" },
  { id: "5", name: "Maria's Phone",   distance: "~18m", signal: "medium", connected: false, lastSeen: "45s ago" },
];

interface P2PMessage {
  id: string;
  from: string;
  type: "message" | "sos" | "file" | "location";
  content: string;
  time: string;
  incoming: boolean;
}

const mockMessages: P2PMessage[] = [
  { id: "1", from: "Sarah's Phone",  type: "sos",      content: "Need medical help — injured leg", time: "2m ago",  incoming: true },
  { id: "2", from: "You",            type: "location",  content: "Location shared: 12.97°N, 77.59°E", time: "3m ago",  incoming: false },
  { id: "3", from: "Rescue Unit #3", type: "message",   content: "Help arriving in 10 minutes. Stay safe.", time: "5m ago",  incoming: true },
  { id: "4", from: "You",            type: "file",      content: "area_photo.jpg (2.4 MB)", time: "8m ago",  incoming: false },
  { id: "5", from: "John D.",        type: "message",   content: "Found clean water source at the school building", time: "12m ago", incoming: true },
];

const signalCfg = {
  strong: { color: "text-emerald-600", bg: "bg-emerald-100", bars: 3 },
  medium: { color: "text-yellow-600",  bg: "bg-yellow-100",  bars: 2 },
  weak:   { color: "text-red-500",     bg: "bg-red-100",     bars: 1 },
};

const msgTypeCfg = {
  message:  { color: "text-blue-700",   bg: "bg-blue-50",   icon: MessageSquare, label: "Message" },
  sos:      { color: "text-red-700",    bg: "bg-red-50",    icon: AlertCircle,   label: "SOS" },
  file:     { color: "text-purple-700", bg: "bg-purple-50", icon: FileText,      label: "File" },
  location: { color: "text-green-700",  bg: "bg-green-50",  icon: Signal,        label: "Location" },
};

export default function BluetoothPage() {
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<"devices" | "p2p">("devices");

  const connectedCount = mockDevices.filter(d => d.connected).length;

  return (
    <div className="flex flex-col pb-[76px]">

      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-200 bg-gradient-to-b from-blue-50/80 to-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Bluetooth className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Bluetooth Mesh</h1>
            <p className="text-xs text-gray-500 mt-0.5">Communicate without internet</p>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 flex-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">Bluetooth Active</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
            <Users className="w-3.5 h-3.5" />
            {connectedCount} connected
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
            <Radio className="w-3.5 h-3.5" />
            {mockDevices.length} found
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mx-4 mt-4 p-1 bg-gray-100 rounded-xl">
        {(["devices", "p2p"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "devices" ? "📡 Nearby Devices" : "🔄 P2P Transfer"}
          </button>
        ))}
      </div>

      {/* Devices Tab */}
      {activeTab === "devices" && (
        <div className="flex flex-col gap-3 px-4 pt-4">
          {/* Scan Button */}
          <button
            onClick={() => { setScanning(true); setTimeout(() => setScanning(false), 3000); }}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all ${
              scanning
                ? "bg-blue-500 text-white shadow-md"
                : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
            }`}
          >
            <BluetoothSearching className={`w-5 h-5 ${scanning ? "animate-pulse" : ""}`} />
            {scanning ? "Scanning for devices..." : "Scan for Nearby Devices"}
          </button>

          {/* Device list */}
          {mockDevices.map(device => {
            const sig = signalCfg[device.signal];
            return (
              <div key={device.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.connected ? "bg-blue-100" : "bg-gray-100"}`}>
                  <Smartphone className={`w-5 h-5 ${device.connected ? "text-blue-600" : "text-gray-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 truncate">{device.name}</span>
                    {device.connected && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Connected</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-semibold text-gray-400">{device.distance}</span>
                    <span className="text-[10px] font-semibold text-gray-400">{device.lastSeen}</span>
                    <span className={`flex items-center gap-0.5 text-[10px] font-bold ${sig.color}`}>
                      {/* Signal bars */}
                      <span className="flex items-end gap-[1px] h-3">
                        {[1, 2, 3].map(bar => (
                          <span key={bar} className={`w-[3px] rounded-sm ${bar <= sig.bars ? sig.color.replace("text-", "bg-") : "bg-gray-200"}`} style={{ height: `${bar * 4}px` }} />
                        ))}
                      </span>
                      {device.signal}
                    </span>
                  </div>
                </div>
                <button className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  device.connected
                    ? "bg-gray-100 text-gray-500"
                    : "bg-blue-500 text-white shadow-sm hover:bg-blue-600"
                }`}>
                  {device.connected ? "Paired" : "Connect"}
                </button>
              </div>
            );
          })}

          {/* Mesh info */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-800">Mesh Network Active</span>
            </div>
            <p className="text-[11px] text-indigo-600 leading-relaxed">
              Connected devices form a mesh network. Messages and SOS signals hop between devices to reach people beyond direct Bluetooth range.
            </p>
          </div>
        </div>
      )}

      {/* P2P Transfer Tab */}
      {activeTab === "p2p" && (
        <div className="flex flex-col gap-3 px-4 pt-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Peer-to-Peer Activity</span>
          </div>

          {mockMessages.map(msg => {
            const cfg = msgTypeCfg[msg.type];
            const Icon = cfg.icon;
            return (
              <div key={msg.id} className={`rounded-2xl p-3.5 border shadow-sm ${msg.incoming ? "bg-white border-gray-200" : "bg-blue-50 border-blue-200 ml-8"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cfg.color} ${cfg.bg}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400">{msg.time}</span>
                  </div>
                  {msg.incoming ? (
                    <span className="text-[10px] font-bold text-gray-500">← {msg.from}</span>
                  ) : (
                    <span className="text-[10px] font-bold text-blue-600">→ Sent</span>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-800 leading-snug">{msg.content}</p>
              </div>
            );
          })}

          {/* Send controls */}
          <div className="flex gap-2 mt-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-blue-500 text-white text-xs font-bold shadow-sm hover:bg-blue-600 transition-colors">
              <Send className="w-3.5 h-3.5" /> Send Message
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors">
              <FileText className="w-3.5 h-3.5" /> Share File
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-green-50 border border-green-200 mt-1">
            <p className="text-[11px] text-green-700 leading-relaxed font-medium">
              <strong>🔒 Peer-to-Peer:</strong> Data transfers directly between devices via Bluetooth — no internet required. All emergency messages are prioritized.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
