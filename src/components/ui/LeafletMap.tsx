"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
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
  liveLocation?: boolean;
  onLocationUpdate?: (lat: number, lng: number) => void;
  mapRef?: React.MutableRefObject<HTMLDivElement | null>;
}

/** Inner component that tracks and displays live GPS position */
function LiveLocationMarker({ onLocationUpdate }: { onLocationUpdate?: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const hasCentered = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        onLocationUpdate?.(coords[0], coords[1]);

        // Center on first fix only
        if (!hasCentered.current) {
          map.setView(coords, map.getZoom(), { animate: true });
          hasCentered.current = true;
        }
      },
      () => { /* GPS denied — silently fallback */ },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, onLocationUpdate]);

  if (!position) return null;

  return (
    <>
      {/* Accuracy ring */}
      <CircleMarker
        center={position}
        radius={28}
        pathOptions={{ fillColor: "#3b82f6", color: "transparent", fillOpacity: 0.12 }}
      />
      {/* Pulsing ring */}
      <CircleMarker
        center={position}
        radius={18}
        pathOptions={{ fillColor: "#3b82f6", color: "transparent", fillOpacity: 0.08 }}
      />
      {/* Blue dot */}
      <CircleMarker
        center={position}
        radius={8}
        pathOptions={{ fillColor: "#3b82f6", color: "#fff", weight: 2.5, fillOpacity: 0.95 }}
      >
        <Popup>📍 Your live location</Popup>
      </CircleMarker>
    </>
  );
}

/** Helper component to expose the map's recenter function */
function RecenterControl({ recenterRef }: { recenterRef: React.MutableRefObject<(() => void) | null> }) {
  const map = useMap();

  useEffect(() => {
    recenterRef.current = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], map.getZoom(), { animate: true });
          },
          () => { /* denied */ },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    };
  }, [map, recenterRef]);

  return null;
}

export { RecenterControl };

export default function LeafletMap({
  center,
  zoom,
  markers,
  scrollWheelZoom = false,
  zoomControl = false,
  dragging = false,
  liveLocation = false,
  onLocationUpdate,
  mapRef,
}: LeafletMapProps) {
  return (
    <div ref={mapRef} style={{ width: "100%", height: "100%" }}>
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

        {/* Live location marker */}
        {liveLocation && <LiveLocationMarker onLocationUpdate={onLocationUpdate} />}

        {/* Static user marker (only if not using live location) */}
        {!liveLocation && (
          <>
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
          </>
        )}

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
    </div>
  );
}
