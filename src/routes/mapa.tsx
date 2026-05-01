import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { DesktopGate } from "@/components/DesktopGate";
import { BottomNav } from "@/components/BottomNav";
import { seo } from "@/lib/seo";

// Lazy-loaded so Leaflet (which requires DOM) never runs during SSR
const MapClient = lazy(() => import("@/components/MapClient"));

export const Route = createFileRoute("/mapa")({
  head: () => ({
    ...seo({
      title: "Mapa — DEZRAIZ",
      description: "Veja sua localização atual no mapa.",
      path: "/mapa",
      noindex: true,
    }),
  }),
  component: () => (
    <RequireAuth>
      <MapPage />
    </RequireAuth>
  ),
});

function MapPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <DesktopGate>
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden">
        <div className="relative flex-1 overflow-hidden">
          {mounted ? (
            <Suspense fallback={<MapSkeleton />}>
              <MapClient />
            </Suspense>
          ) : (
            <MapSkeleton />
          )}
        </div>
        <BottomNav />
      </div>
    </DesktopGate>
  );
}

function MapSkeleton() {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--color-secondary)]">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
    </div>
  );
}
