import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/EmptyState";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/saude")({
  head: () => ({
    ...seo({
      title: "Saúde",
      description: "Sistema de saúde, seguro e médicos brasileiros no exterior.",
      path: "/saude",
    }),
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <EmptyState
          eyebrow="Em breve"
          title="Saúde"
          description="Como funciona o sistema de saúde local, seguros, vacinas e médicos que falam português."
        />
      </AppShell>
    </RequireAuth>
  ),
});
