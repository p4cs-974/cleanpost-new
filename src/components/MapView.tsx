import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useWebHaptics } from "web-haptics/react";

interface MapViewProps {
  latitude: number;
  longitude: number;
}

export default function MapView({ latitude, longitude }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [isDark, setIsDark] = useState(false);
  const haptic = useWebHaptics();

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const style = isDark
      ? "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      : "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "carto-tiles": {
            type: "raster",
            tiles: [style],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "carto-layer",
            type: "raster",
            source: "carto-tiles",
          },
        ],
      },
      center: [longitude, latitude],
      zoom: 14,
    });

    marker.current = new maplibregl.Marker().setLngLat([longitude, latitude]).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [latitude, longitude, isDark]);

  useEffect(() => {
    if (map.current && marker.current) {
      map.current.flyTo({ center: [longitude, latitude], zoom: 14 });
      marker.current.setLngLat([longitude, latitude]);
    }
  }, [latitude, longitude]);

  const handlePointerDown = () => {
    void haptic.trigger("light");
  };

  const handlePointerUp = () => {
    void haptic.trigger("light");
  };

  return (
    <div
      ref={mapContainer}
      className="w-full h-48 rounded-lg overflow-hidden border border-border touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}
