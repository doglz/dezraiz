import { useEffect, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { DesktopGate } from "@/components/DesktopGate";

/**
 * AppShell v2 — mobile-first.
 *
 * - Sem sidebar desktop. Em desktop o app exibe o DesktopGate (QR + CTA).
 * - BottomNav sempre presente em mobile.
 * - O conteúdo das telas é responsável pelo header próprio.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void router.preloadRoute({ to: "/chat" });
      void router.preloadRoute({ to: "/checklist" });
      void router.preloadRoute({ to: "/profile" });
      void router.preloadRoute({ to: "/planos" });
      void router.preloadRoute({ to: "/documentos" });
      void router.preloadRoute({ to: "/remessas" });
      void router.preloadRoute({ to: "/comunidade" });
      void router.preloadRoute({ to: "/moradia" });
      void router.preloadRoute({ to: "/saude" });
      void router.preloadRoute({ to: "/trabalho" });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <DesktopGate>
      <div className="app-shell">
        <main className="app-shell-content mx-auto w-full max-w-screen-sm px-5 pt-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </DesktopGate>
  );
}
