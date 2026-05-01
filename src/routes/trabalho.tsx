import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/EmptyState";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/trabalho")({
  head: () => ({
    ...seo({
      title: "Trabalho",
      description: "Vagas, validação de diploma e direitos trabalhistas no exterior.",
      path: "/trabalho",
    }),
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <EmptyState
          eyebrow="Em breve"
          title="Trabalho"
          description="Vagas, validação de diploma, currículo internacional e direitos trabalhistas."
        />
      </AppShell>
    </RequireAuth>
  ),
});
