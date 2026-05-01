import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/EmptyState";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/moradia")({
  head: () => ({
    ...seo({
      title: "Moradia",
      description: "Aluguel, contratos e dicas para encontrar onde morar.",
      path: "/moradia",
    }),
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <EmptyState
          eyebrow="Em breve"
          title="Moradia"
          description="Como alugar, entender contratos e encontrar bairros para morar no exterior."
        />
      </AppShell>
    </RequireAuth>
  ),
});
