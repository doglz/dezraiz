import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ListChecks, PartyPopper, RotateCcw, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { EmptyState } from "@/components/EmptyState";
import {
  loadChecklist,
  saveChecklist,
  toggleChecklistItem,
  DEFAULT_CHECKLIST,
  type ChecklistItem,
} from "@/lib/checklist";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/checklist")({
  head: () => ({
    ...seo({
      title: "Tarefas",
      description:
        "Tudo que você precisa resolver para planejar, viajar ou se estabelecer fora — documentos, contas, declarações — em uma checklist guiada.",
      path: "/checklist",
    }),
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <PageTransition>
          <ChecklistPage />
        </PageTransition>
      </AppShell>
    </RequireAuth>
  ),
});

function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadChecklist().then((data) => {
      setItems(data);
      setLoaded(true);
    });
  }, []);

  const dispatchUpdate = () => window.dispatchEvent(new Event("dezraiz:checklist"));

  const toggle = (id: string) => {
    const next = items.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
    setItems(next);
    dispatchUpdate();
    const item = next.find((i) => i.id === id);
    if (item) toggleChecklistItem(id, item.done);
  };

  const restoreDefaults = async () => {
    setItems(DEFAULT_CHECKLIST);
    dispatchUpdate();
    await saveChecklist(DEFAULT_CHECKLIST);
  };

  const resetProgress = async () => {
    const next = items.map((i) => ({ ...i, done: false }));
    setItems(next);
    dispatchUpdate();
    await saveChecklist(next);
  };

  if (!loaded) {
    return (
      <div>
        <PageHeader title="Tarefas" />
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
        </div>
      </div>
    );
  }

  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const allDone = items.length > 0 && done === items.length;

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Tarefas" subtitle="Sua checklist está vazia" />
        <EmptyState
          icon={<ListChecks className="h-6 w-6" strokeWidth={2.2} />}
          eyebrow="Nada por aqui"
          title="Vamos montar sua checklist"
          description="Carregue a lista padrão da DEZRAIZ com tudo que normalmente precisa ser resolvido em cada etapa: planejamento, viagem e vida fora."
          primaryAction={
            <button
              onClick={restoreDefaults}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-foreground)] px-6 text-sm font-semibold text-[var(--color-background)] transition-transform active:scale-95"
            >
              Carregar checklist padrão
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Tarefas" subtitle={`${done} de ${items.length} concluídas`} />

      {/* Progresso */}
      <div className="mb-6 rounded-3xl bg-[var(--color-ink)] p-6 text-[var(--color-ink-foreground)] shadow-[var(--shadow-elev-2)]">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">
              Seu progresso
            </p>
            <p
              data-numeric
              className="mt-1 text-[44px] font-extrabold leading-none tracking-[-0.03em]"
            >
              {pct}
              <span className="text-[20px] text-white/50">%</span>
            </p>
          </div>
          <p className="text-[12px] text-white/60">
            {items.length - done} restante{items.length - done === 1 ? "" : "s"}
          </p>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {allDone && (
        <div className="mb-6">
          <EmptyState
            variant="success"
            icon={<PartyPopper className="h-6 w-6" strokeWidth={2.2} />}
            eyebrow="Tudo em dia"
            title="Sua jornada está em dia"
            description="Você completou tudo. Quer recomeçar?"
            primaryAction={
              <button
                onClick={resetProgress}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-foreground)] px-6 text-sm font-semibold text-[var(--color-background)] transition-transform active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                Recomeçar
              </button>
            }
          />
        </div>
      )}

      {/* Lista */}
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              className="flex w-full items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-left shadow-[var(--shadow-elev-1)] transition-all active:scale-[0.99]"
            >
              <span
                className={
                  "mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 transition-colors " +
                  (item.done
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-canvas)]")
                }
              >
                {item.done && <Check className="h-3.5 w-3.5" strokeWidth={3.5} />}
              </span>
              <span className="flex-1">
                <span
                  className={
                    "block text-[14px] font-semibold " +
                    (item.done
                      ? "text-[var(--color-muted-foreground)] line-through"
                      : "text-[var(--color-foreground)]")
                  }
                >
                  {item.title}
                </span>
                {item.description && (
                  <span className="mt-0.5 block text-[12px] text-[var(--color-muted-foreground)]">
                    {item.description}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6 flex items-center gap-3">
      <Link
        to="/"
        aria-label="Voltar"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] shadow-[var(--shadow-elev-1)] transition-transform active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[24px] font-extrabold leading-tight tracking-[-0.025em] text-[var(--color-foreground)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12px] text-[var(--color-muted-foreground)]">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
