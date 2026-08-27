import { useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

function MapEmbed({ latitude, longitude, height = 320 }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
  });

  const center = { lat: latitude, lng: longitude };

  if (!apiKey) {
    return (
      <div
        className="liquid-glass rounded-2xl flex items-center justify-center text-sm"
        style={{ height, color: "var(--text-muted)" }}
      >
        Map unavailable — API key not configured
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="liquid-glass rounded-2xl flex items-center justify-center text-sm text-center px-4"
        style={{ height, color: "var(--text-muted)" }}
      >
        Failed to load Google Maps
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="liquid-glass rounded-2xl flex items-center justify-center text-sm"
        style={{ height, color: "var(--text-muted)" }}
      >
        Loading map...
      </div>
    );
  }

  return (
    <div className="liquid-glass rounded-2xl overflow-hidden" style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={16}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}

export default MapEmbed;