import { createRouter, useRouter, Link } from "@tanstack/react-router";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { routeTree } from "./routeTree.gen";
import { EmptyState } from "@/components/EmptyState";

function DefaultErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-10">
      <div className="w-full max-w-lg">
        <EmptyState
          variant="error"
          icon={<AlertTriangle className="h-6 w-6" strokeWidth={2.2} />}
          eyebrow="Algo deu errado"
          title="Não foi possível carregar essa tela"
          description="Tivemos um problema inesperado. Tente novamente — geralmente resolve."
          primaryAction={
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-green-500)] px-6 text-sm font-medium text-white transition-colors hover:bg-[var(--color-green-600)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-green-500)]/40 focus-visible:ring-offset-2"
            >
              <RotateCcw className="h-4 w-4" />
              Tentar novamente
            </button>
          }
          secondaryAction={
            <Link
              to="/"
              className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium text-[var(--color-zinc-700)] transition-colors hover:bg-[var(--color-zinc-100)]"
            >
              Ir para o início
            </Link>
          }
        />
        {import.meta.env.DEV && error.message && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-[var(--color-zinc-900)] p-3 text-left font-mono text-xs text-[var(--color-zinc-100)]">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    // Preload route chunks on hover/touchstart so in-app navigation feels
    // instant after the first page. Small delay avoids preloading on mere
    // cursor transits.
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return router;
};
