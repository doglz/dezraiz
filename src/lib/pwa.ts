/**
 * PWA registration with safety guards.
 *
 * NÃO registramos service worker quando:
 *  - app está dentro de iframe (preview do Lovable)
 *  - host é de preview (id-preview--*, lovableproject.com)
 *  - estamos em dev
 *
 * Em qualquer um desses casos, desregistramos SWs antigos pra limpar cache.
 */
export function registerPWA() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host === "localhost" ||
    host === "127.0.0.1";

  if (isInIframe || isPreviewHost || import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    return;
  }

  // Dynamic import — só carrega o módulo do plugin em produção fora de preview.
  import("virtual:pwa-register")
    .then(({ registerSW }) => {
      registerSW({ immediate: true });
    })
    .catch(() => {
      /* virtual module ausente em SSR — ignore */
    });
}
