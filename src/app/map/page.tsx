"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useCallback } from "react";
import { Crosshair, Download, Loader2 } from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/ui/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 gap-2 text-gray-400 flex-col">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span className="text-sm font-medium">Loading map...</span>
    </div>
  ),
});

const CENTER: [number, number] = [12.9716, 77.5946];

const allPins = [
  { lat: 12.9816, lng: 77.6046, color: "#ef4444", label: "🆘 SOS: Person trapped",         type: "SOS"      },
  { lat: 12.9616, lng: 77.5846, color: "#f97316", label: "🏥 Medical: Asthma patient",      type: "Medical"  },
  { lat: 12.9716, lng: 77.6146, color: "#eab308", label: "🚧 Blocked Route: Bridge collapse", type: "Blocked" },
  { lat: 12.9516, lng: 77.5946, color: "#3b82f6", label: "📦 Resources: Water + blankets",  type: "Resources"},
  { lat: 12.9656, lng: 77.5786, color: "#22c55e", label: "🧑‍⚕️ Responder: Dr. Sarah Kim",    type: "Responder"},
  { lat: 12.9776, lng: 77.6006, color: "#22c55e", label: "🧑‍🚒 Responder: John Davis",        type: "Responder"},
];

const filterTypes = ["All", "SOS", "Medical", "Blocked", "Resources", "Responder"] as const;
type FilterType = typeof filterTypes[number];

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [downloading, setDownloading] = useState(false);
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const visiblePins = activeFilter === "All" ? allPins : allPins.filter(p => p.type === activeFilter);

  const handleLocationUpdate = useCallback((lat: number, lng: number) => {
    setLiveCoords({ lat, lng });
  }, []);

  const handleRecenter = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Dispatch a custom event the map can listen to
          window.dispatchEvent(new CustomEvent("recenter-map", {
            detail: { lat: pos.coords.latitude, lng: pos.coords.longitude }
          }));
        },
        () => { /* denied */ },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const handleDownload = async () => {
    if (!mapContainerRef.current || downloading) return;
    setDownloading(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `unitysos-map-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // fallback: toast or alert
      console.error("Failed to capture map");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px - 68px)" }}>

      {/* Filter bar */}
      <div className="flex gap-2 px-3 py-2.5 overflow-x-auto hide-scrollbar border-b border-gray-200 bg-white z-10 shrink-0">
        {filterTypes.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === f
                ? "bg-red-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Live location indicator */}
      {liveCoords && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border-b border-blue-200 text-[10px] font-bold text-blue-700 shrink-0">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Live: {liveCoords.lat.toFixed(4)}° N, {liveCoords.lng.toFixed(4)}° E
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <LeafletMap
          center={CENTER}
          zoom={14}
          markers={visiblePins}
          scrollWheelZoom={true}
          zoomControl={true}
          dragging={true}
          liveLocation={true}
          onLocationUpdate={handleLocationUpdate}
          mapRef={mapContainerRef}
        />

        {/* Map Controls */}
        <div className="absolute right-3 bottom-6 z-[400] flex flex-col gap-2">
          <button
            onClick={handleRecenter}
            className="w-10 h-10 bg-white border border-gray-200 rounded-xl shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors active:scale-95"
            title="Center on my location"
          >
            <Crosshair className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-10 h-10 bg-white border border-gray-200 rounded-xl shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 active:scale-95"
            title="Download map as image"
          >
            {downloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Legend */}
        <div className="absolute left-3 bottom-6 z-[400] flex flex-col gap-1.5 bg-white/90 backdrop-blur-md px-3 py-2.5 rounded-xl border border-gray-200 shadow-md text-[9px] font-semibold">
          {[
            { c: "#3b82f6", l: "You" },
            { c: "#ef4444", l: "SOS" },
            { c: "#f97316", l: "Medical" },
            { c: "#eab308", l: "Route" },
            { c: "#3b82f6", l: "Resources" },
            { c: "#22c55e", l: "Responders" },
          ].map(({ c, l }) => (
            <span key={l} className="flex items-center gap-1.5 text-gray-800">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c }} />
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
