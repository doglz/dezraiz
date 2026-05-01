// @lovable.dev/vite-tanstack-config inclui: tanstackStart, viteReact, tailwindcss,
// tsConfigPaths, cloudflare (build), componentTagger (dev), VITE_*, alias @, dedupe.
// Adicionamos vite-plugin-pwa por cima, com guards pra não quebrar o preview.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        // SW só ativa em produção — preview do Lovable roda em iframe e
        // service worker em iframe causa cache fantasma e roteamento quebrado.
        devOptions: { enabled: false },
        injectRegister: false, // registro manual em src/lib/pwa.ts (com guards)
        manifest: false,        // já temos public/manifest.webmanifest
        workbox: {
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/api\//, /^\/~/],
          globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff2}"],
          cleanupOutdatedCaches: true,
        },
      }),
    ],
  },
});
