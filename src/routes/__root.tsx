import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider, THEME_BOOTSTRAP } from "@/lib/theme";
import { LazyCommandPalette } from "@/components/LazyCommandPalette";
import { EmptyState } from "@/components/EmptyState";
import { useEffect } from "react";
import { registerPWA } from "@/lib/pwa";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-10">
      <div className="w-full max-w-lg">
        <p className="mb-4 text-center text-7xl font-extrabold tracking-tight text-[var(--color-primary)] sm:text-8xl">
          404
        </p>
        <EmptyState
          eyebrow="Página não encontrada"
          title="Esse endereço não existe (ainda)"
          description="O link pode estar quebrado ou a página foi movida."
          primaryAction={
            <Link
              to="/"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-foreground)] px-6 text-sm font-semibold text-[var(--color-background)] transition-transform hover:-translate-y-0.5"
            >
              Voltar para o início
            </Link>
          }
        />
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
      },
      { title: "DEZRAIZ — Seu guia para a vida fora do Brasil" },
      {
        name: "description",
        content:
          "DEZRAIZ é o guia do brasileiro que está planejando, viajando ou já mora fora. Checklist do que resolver, chat com IA e dicas práticas.",
      },
      { name: "application-name", content: "DEZRAIZ" },
      { name: "format-detection", content: "telephone=no" },
      { name: "theme-color", content: "#f7f7f8" },
      { name: "color-scheme", content: "light" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "DEZRAIZ" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "icon", href: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { rel: "apple-touch-icon", href: "/icon-192.png", sizes: "192x192" },
      { rel: "mask-icon", href: "/favicon.svg", color: "#16a34a" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      style={{ colorScheme: "light", backgroundColor: "#f7f7f8" }}
      suppressHydrationWarning
    >
      <head>
        <style>{`html,body{background-color:#f7f7f8;color-scheme:light}`}</style>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <HeadContent />
      </head>
      <body style={{ backgroundColor: "#f7f7f8" }} suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    registerPWA();
  }, []);
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <LazyCommandPalette />
      </AuthProvider>
    </ThemeProvider>
  );
}
