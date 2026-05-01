import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/EmptyState";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    ...seo({
      title: "Comunidade",
      description: "Conecte-se com brasileiros morando perto de você.",
      path: "/comunidade",
    }),
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <EmptyState
          eyebrow="Em breve"
          title="Comunidade"
          description="Encontre brasileiros perto de você, participe de grupos e eventos locais."
        />
      </AppShell>
    </RequireAuth>
  ),
});
