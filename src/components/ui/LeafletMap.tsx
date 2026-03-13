"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  lat: number;
  lng: number;
  color: string;
  label: string;
}

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
  scrollWheelZoom?: boolean;
  zoomControl?: boolean;
  dragging?: boolean;
}

export default function LeafletMap({
  center,
  zoom,
  markers,
  scrollWheelZoom = false,
  zoomControl = false,
  dragging = false,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      zoomControl={zoomControl}
      dragging={dragging}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

      {/* User Location */}
      <CircleMarker
        center={center}
        radius={10}
        pathOptions={{ fillColor: "#3b82f6", color: "#fff", weight: 2.5, fillOpacity: 0.95 }}
      >
        <Popup>📍 You are here</Popup>
      </CircleMarker>
      <CircleMarker
        center={center}
        radius={24}
        pathOptions={{ fillColor: "#3b82f6", color: "transparent", fillOpacity: 0.18 }}
      />

      {/* Alert / Responder markers */}
      {markers.map((m, i) => (
        <CircleMarker
          key={i}
          center={[m.lat, m.lng]}
          radius={7}
          pathOptions={{ fillColor: m.color, color: "#fff", weight: 1.5, fillOpacity: 1 }}
        >
          <Popup><span style={{ fontSize: "13px", fontWeight: 500 }}>{m.label}</span></Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
