import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { getBrowserPosition, reverseGeocode } from "@/lib/geo";
import { useAuth } from "@/lib/auth";

const PRIMARY = "#16a34a";

function tileUrl(dark: boolean) {
  return dark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
}

type LocState =
  | { status: "loading" }
  | { status: "ok"; address: string }
  | { status: "error"; message: string; hasFallback: boolean };

export default function MapClient() {
  const { user } = useAuth();
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const [loc, setLoc] = useState<LocState>({ status: "loading" });
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, { center: [0, 0], zoom: 2, zoomControl: false });
    const tile = L.tileLayer(tileUrl(isDark), {
      attribution:
        '© <a href="https://carto.com" target="_blank">CARTO</a> © <a href="https://openstreetmap.org" target="_blank">OSM</a>',
      subdomains: "abcd",
      maxZoom: 19,
    });
    tile.addTo(map);
    tileRef.current = tile;
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
    };
  }, []);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    tileRef.current?.setUrl(tileUrl(isDark));
  }, [isDark]);

  const clearLayers = useCallback(() => {
    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];
  }, []);

  const showMarker = useCallback(
    (lat: number, lng: number, accuracy?: number) => {
      const map = mapRef.current;
      if (!map) return;
      clearLayers();
      const dot = L.circleMarker([lat, lng], {
        radius: 11,
        fillColor: PRIMARY,
        color: "#fff",
        weight: 3,
        fillOpacity: 1,
      }).addTo(map);
      layersRef.current.push(dot);
      if (accuracy && accuracy < 3000) {
        const ring = L.circle([lat, lng], {
          radius: accuracy,
          color: PRIMARY,
          fillColor: PRIMARY,
          fillOpacity: 0.08,
          weight: 1,
        }).addTo(map);
        layersRef.current.push(ring);
      }
      map.flyTo([lat, lng], 15, { duration: 1.5 });
    },
    [clearLayers],
  );

  const locate = useCallback(async () => {
    setLoc({ status: "loading" });
    try {
      const pos = await getBrowserPosition();
      const { latitude, longitude, accuracy } = pos.coords;
      showMarker(latitude, longitude, accuracy ?? undefined);

      let address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      try {
        const rev = await reverseGeocode(latitude, longitude);
        address = rev.display_name;
      } catch { /* coords fallback */ }

      setLoc({ status: "ok", address });
    } catch {
      const ob = user?.location;
      const hasFallback = !!(ob?.latitude && ob?.longitude);
      if (hasFallback) {
        showMarker(ob!.latitude!, ob!.longitude!);
      } else if (mapRef.current) {
        mapRef.current.setView([0, 0], 2);
      }
      setLoc({
        status: "error",
        message: hasFallback
          ? "GPS negado — mostrando localização do cadastro."
          : "Permita o acesso à localização para ver onde você está.",
        hasFallback,
      });
    }
  }, [showMarker, user]);

  useEffect(() => {
    void locate();
  }, [locate]);

  const fallbackAddress = (() => {
    const ob = user?.location;
    if (!ob) return null;
    return [ob.city, ob.state, ob.country].filter(Boolean).join(", ");
  })();

  const displayAddress =
    loc.status === "ok"
      ? loc.address
      : loc.status === "error" && loc.hasFallback
        ? fallbackAddress
        : null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={divRef} className="h-full w-full" />

      {/* Bottom card — sits above the BottomNav pill */}
      <div className="absolute inset-x-0 bottom-16 z-[1000] px-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/95 p-4 shadow-[var(--shadow-elev-3)] backdrop-blur">
          {loc.status === "loading" && (
            <div className="flex items-center gap-2.5 text-sm text-[var(--color-muted-foreground)]">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
              Obtendo localização…
            </div>
          )}
          {loc.status === "error" && (
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-[var(--color-muted-foreground)]" />
              <p className="text-sm text-[var(--color-muted-foreground)]">{loc.message}</p>
            </div>
          )}
          {displayAddress && (
            <div className={`flex items-start gap-2 ${loc.status === "error" ? "mt-2" : ""}`}>
              <MapPin
                className="mt-0.5 h-4 w-4 flex-none text-[var(--color-primary)]"
                strokeWidth={1.75}
              />
              <p className="line-clamp-2 text-sm leading-snug text-[var(--color-foreground)]">
                {displayAddress}
              </p>
            </div>
          )}
          <button
            onClick={locate}
            disabled={loc.status === "loading"}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loc.status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar localização
          </button>
        </div>
      </div>
    </div>
  );
}
