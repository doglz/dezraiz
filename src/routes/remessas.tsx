import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/EmptyState";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/remessas")({
  head: () => ({
    ...seo({
      title: "Remessas",
      description: "Envie dinheiro para o Brasil com as melhores cotações.",
      path: "/remessas",
    }),
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <EmptyState
          eyebrow="Em breve"
          title="Remessas"
          description="Compare cotações e envie dinheiro para o Brasil direto pelo DEZRAIZ."
        />
      </AppShell>
    </RequireAuth>
  ),
});
