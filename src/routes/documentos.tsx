import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/EmptyState";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    ...seo({
      title: "Documentos",
      description: "Guias para CPF, passaporte, vistos e demais documentos.",
      path: "/documentos",
    }),
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <EmptyState
          eyebrow="Em breve"
          title="Documentos"
          description="Tudo que você precisa saber sobre passaporte, vistos, CPF e outros documentos — antes da viagem e morando fora."
        />
      </AppShell>
    </RequireAuth>
  ),
});
