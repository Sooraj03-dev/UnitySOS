"use client";

import { useState, useRef, useEffect } from "react";
import {
  Radio,
  Wifi,
  WifiOff,
  Send,
  Users,
  AlertCircle,
  MessageSquare,
  Signal,
  FileText,
  ArrowUpDown,
  Smartphone,
  Plug,
  PlugZap,
  Search,
  Cpu,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { useWebRTC } from "@/context/WebRTCContext";
import { useBluetoothDevice } from "@/hooks/useBluetoothDevice";
import type { PeerMessage } from "@/lib/webrtc";

/* ──────────────────────────────────────────────
   Message type config
   ────────────────────────────────────────────── */

const msgTypeCfg: Record<
  PeerMessage["type"],
  { color: string; bg: string; icon: typeof MessageSquare; label: string }
> = {
  text:      { color: "text-blue-700",   bg: "bg-blue-50",   icon: MessageSquare, label: "Message" },
  sos:       { color: "text-red-700",    bg: "bg-red-50",    icon: AlertCircle,   label: "SOS" },
  "file-meta":  { color: "text-purple-700", bg: "bg-purple-50", icon: FileText,   label: "File" },
  "file-chunk": { color: "text-purple-700", bg: "bg-purple-50", icon: FileText,   label: "File" },
  location:  { color: "text-green-700",  bg: "bg-green-50",  icon: Signal,        label: "Location" },
  ping:      { color: "text-gray-700",   bg: "bg-gray-50",   icon: Zap,           label: "Ping" },
};

/* ──────────────────────────────────────────────
   Page Component
   ────────────────────────────────────────────── */

export default function BluetoothPage() {
  const [activeTab, setActiveTab] = useState<"p2p" | "ble">("p2p");

  return (
    <div className="flex flex-col pb-[76px]">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-200 bg-gradient-to-b from-indigo-50/80 to-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <Radio className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">P2P / BLE</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              WebRTC for browsers · Web Bluetooth for hardware
            </p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mx-4 mt-4 p-1 bg-gray-100 rounded-xl">
        {([
          { key: "p2p" as const, label: "📡 P2P Network" },
          { key: "ble" as const, label: "🔌 BLE Devices" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "p2p" ? <P2PTab /> : <BLETab />}
    </div>
  );
}

/* ══════════════════════════════════════════════
   P2P Tab — WebRTC browser-to-browser
   ══════════════════════════════════════════════ */

function P2PTab() {
  const {
    localPeerId,
    peers,
    messages,
    inRoom,
    joinRoom,
    leaveRoom,
    broadcastMessage,
    broadcastSOS,
    error,
  } = useWebRTC();

  const [roomInput, setRoomInput] = useState("sos-mesh-1");
  const [msgInput, setMsgInput] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = async () => {
    if (roomInput.trim()) await joinRoom(roomInput.trim());
  };

  const handleSend = () => {
    if (msgInput.trim()) {
      broadcastMessage(msgInput.trim());
      setMsgInput("");
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(localPeerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const connectedPeers = peers.filter((p) => p.state === "connected");

  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      {/* Peer ID badge */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Your Peer ID
          </span>
          <p className="text-sm font-bold text-gray-900 font-mono truncate">
            {localPeerId}
          </p>
        </div>
        <button
          onClick={handleCopyId}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Copy peer ID"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Room join / leave */}
      {!inRoom ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Room ID"
            className="flex-1 px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          <button
            onClick={handleJoin}
            className="px-5 py-3 rounded-2xl bg-indigo-500 text-white text-sm font-bold shadow-sm hover:bg-indigo-600 transition-colors"
          >
            Join
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">
              Room: {roomInput}
            </span>
            <span className="ml-auto text-xs font-semibold text-emerald-600">
              <Users className="w-3.5 h-3.5 inline mr-1" />
              {peers.length} peer{peers.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={leaveRoom}
            className="px-4 py-3 rounded-2xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
          >
            Leave
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-red-700">{error}</span>
        </div>
      )}

      {/* Connected peers list */}
      {inRoom && peers.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Peers
            </span>
          </div>
          {peers.map((peer) => {
            const isConnected = peer.state === "connected";
            return (
              <div
                key={peer.peerId}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-2xl shadow-sm"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isConnected ? "bg-indigo-100" : "bg-gray-100"
                  }`}
                >
                  <Smartphone
                    className={`w-4 h-4 ${
                      isConnected ? "text-indigo-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-gray-900 font-mono truncate block">
                    {peer.peerId}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isConnected
                      ? "bg-emerald-100 text-emerald-700"
                      : peer.state === "connecting"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isConnected
                    ? "Connected"
                    : peer.state === "connecting"
                    ? "Connecting…"
                    : peer.state === "new"
                    ? "Discovered"
                    : peer.state}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Messages */}
      {inRoom && (
        <>
          <div className="flex items-center gap-2 mt-1">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Messages
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto rounded-2xl">
            {messages.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400 font-medium">
                  No messages yet. Send one!
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const cfg = msgTypeCfg[msg.type];
                const Icon = cfg.icon;
                const isLocal = msg.from === localPeerId;
                return (
                  <div
                    key={`${msg.timestamp}-${i}`}
                    className={`rounded-2xl p-3.5 border shadow-sm ${
                      isLocal
                        ? "bg-indigo-50 border-indigo-200 ml-8"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cfg.color} ${cfg.bg}`}
                      >
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      {isLocal ? (
                        <span className="text-[10px] font-bold text-indigo-600">
                          → You
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-500">
                          ← {msg.from.slice(0, 8)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-800 leading-snug">
                      {msg.payload}
                    </p>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Send controls */}
          <div className="flex gap-2">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={connectedPeers.length === 0}
            />
            <button
              onClick={handleSend}
              disabled={connectedPeers.length === 0 || !msgInput.trim()}
              className="px-4 py-3 rounded-2xl bg-indigo-500 text-white text-sm font-bold shadow-sm hover:bg-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* SOS broadcast */}
          <button
            onClick={() => broadcastSOS("Emergency SOS — need immediate help!")}
            disabled={connectedPeers.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-sm font-bold shadow-md hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <AlertCircle className="w-4 h-4" />
            Broadcast SOS
          </button>
        </>
      )}

      {/* Info box */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 mt-2">
        <div className="flex items-center gap-2 mb-2">
          <Wifi className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-800">
            WebRTC Peer-to-Peer
          </span>
        </div>
        <p className="text-[11px] text-indigo-600 leading-relaxed">
          Connect directly browser-to-browser. Messages are encrypted and travel
          via WebRTC data channels. Join the same room on two devices to start
          communicating.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   BLE Tab — Web Bluetooth for real hardware
   ══════════════════════════════════════════════ */

function BLETab() {
  const {
    isSupported,
    device,
    connected,
    loading,
    error,
    scan,
    connect,
    disconnect,
  } = useBluetoothDevice();

  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      {/* Browser compatibility */}
      {!isSupported && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200">
          <WifiOff className="w-4 h-4 text-amber-600" />
          <div>
            <p className="text-xs font-bold text-amber-800">
              Web Bluetooth Unavailable
            </p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              Use Chrome, Edge, or Opera over HTTPS. Not supported in Firefox or
              Safari.
            </p>
          </div>
        </div>
      )}

      {/* Scan button */}
      <button
        onClick={() => scan({ acceptAllDevices: true })}
        disabled={!isSupported || loading}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all ${
          loading
            ? "bg-purple-500 text-white shadow-md"
            : isSupported
            ? "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        <Search
          className={`w-5 h-5 ${loading ? "animate-pulse" : ""}`}
        />
        {loading ? "Scanning…" : "Scan for BLE Devices"}
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-red-700">{error}</span>
        </div>
      )}

      {/* Selected device */}
      {device && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                connected ? "bg-emerald-100" : "bg-purple-100"
              }`}
            >
              {connected ? (
                <PlugZap className="w-5 h-5 text-emerald-600" />
              ) : (
                <Plug className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {device.name || "Unnamed Device"}
              </p>
              <p className="text-[10px] font-mono text-gray-400 truncate">
                ID: {device.id}
              </p>
            </div>
            {connected ? (
              <button
                onClick={disconnect}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connect}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-40"
              >
                Connect
              </button>
            )}
          </div>

          {connected && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                  GATT Connected
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Use the device&apos;s services and characteristics to read sensor
                data, send commands, or subscribe to notifications.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!device && !loading && isSupported && (
        <div className="text-center py-8">
          <Cpu className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-400">No device selected</p>
          <p className="text-xs text-gray-400 mt-1">
            Tap &ldquo;Scan for BLE Devices&rdquo; to pick nearby hardware
          </p>
        </div>
      )}

      {/* Info box */}
      <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 mt-2">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-purple-800">
            Web Bluetooth — BLE Hardware Only
          </span>
        </div>
        <p className="text-[11px] text-purple-600 leading-relaxed">
          Connect to real Bluetooth Low Energy devices like sensors, beacons, and
          emergency radios. For browser-to-browser communication, switch to the
          P2P Network tab instead.
        </p>
      </div>
    </div>
  );
}
