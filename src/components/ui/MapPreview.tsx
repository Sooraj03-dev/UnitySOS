"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/ui/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-2 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-xs font-medium">Loading map...</span>
    </div>
  ),
});

interface MapMarker {
  lat: number;
  lng: number;
  color: string;
  label: string;
}

interface MapPreviewProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  markers?: MapMarker[];
  showOpenButton?: boolean;
  onOpenFull?: () => void;
}

const defaultMarkers: MapMarker[] = [
  { lat: 12.9816, lng: 77.6046, color: "#ef4444", label: "SOS: Person trapped" },
  { lat: 12.9616, lng: 77.5846, color: "#f97316", label: "Medical: Asthma patient" },
  { lat: 12.9716, lng: 77.6146, color: "#eab308", label: "Blocked Route" },
  { lat: 12.9516, lng: 77.5946, color: "#3b82f6", label: "Resources: Water + food" },
];

export default function MapPreview({
  center = [12.9716, 77.5946],
  zoom = 13,
  height = "250px",
  markers = defaultMarkers,
  showOpenButton = true,
  onOpenFull,
}: MapPreviewProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
      <LeafletMap
        center={center}
        zoom={zoom}
        markers={markers}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
      />

      {/* Legend + Open Button */}
      {showOpenButton && (
        <div className="absolute bottom-0 left-0 right-0 z-[400] px-3 pb-3 pt-12 bg-gradient-to-t from-white/95 via-white/60 to-transparent pointer-events-none flex items-end justify-between">
          <div className="flex flex-wrap gap-2 text-[9px] font-semibold pointer-events-none">
            {[
              { c: "#3b82f6", l: "You" },
              { c: "#ef4444", l: "SOS" },
              { c: "#f97316", l: "Medical" },
              { c: "#eab308", l: "Route" },
              { c: "#3b82f6", l: "Resources" },
            ].map(({ c, l }) => (
              <span key={l} className="flex items-center gap-1 bg-white/90 px-1.5 py-0.5 rounded-md border border-gray-200 shadow-sm">
                <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                {l}
              </span>
            ))}
          </div>
          <button
            onClick={onOpenFull}
            className="pointer-events-auto flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-md text-xs font-bold text-blue-600 hover:bg-gray-50 transition-colors active:scale-95 shrink-0 ml-2"
          >
            Open Full Map
          </button>
        </div>
      )}
    </div>
  );
}
