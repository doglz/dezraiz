import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  MessageCircle,
  CheckSquare,
  ArrowUpRight,
  Sparkles,
  FileText,
  Send,
  Users,
  Heart,
  Building2,
  Briefcase,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { loadChecklist } from "@/lib/checklist";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    ...seo({
      title: "DEZRAIZ — Seu guia para a vida fora do Brasil",
      description:
        "Para quem planeja, viaja ou já mora fora: checklist do que resolver, chat com IA e dicas práticas em um só lugar.",
      path: "/",
      rawTitle: true,
    }),
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <PageTransition>
          <Home />
        </PageTransition>
      </AppShell>
    </RequireAuth>
  ),
});

const TIPS = [
  "Mantenha seu CPF regularizado mesmo planejando sair do Brasil.",
  "Compare cotações de remessa antes de enviar dinheiro pro Brasil.",
  "Cadastre-se no consulado brasileiro mais próximo.",
  "Guarde cópias digitais do passaporte na nuvem.",
];

const COMING_SOON = [
  { label: "Documentos", icon: FileText },
  { label: "Trabalho",   icon: Briefcase },
  { label: "Remessas",   icon: Send },
  { label: "Moradia",    icon: Building2 },
  { label: "Saúde",      icon: Heart },
  { label: "Comunidade", icon: Users },
] as const;

function Home() {
  const { user } = useAuth();
  const tip = TIPS[new Date().getDate() % TIPS.length];
  const reduce = useReducedMotion() ?? false;

  const [checklist, setChecklist] = useState({ done: 0, total: 0 });
  useEffect(() => {
    const update = () => {
      loadChecklist().then((items) => {
        setChecklist({
          done: items.filter((i) => i.done).length,
          total: items.length,
        });
      });
    };
    update();
    window.addEventListener("dezraiz:checklist", update);
    return () => {
      window.removeEventListener("dezraiz:checklist", update);
    };
  }, []);

  const initial = user?.firstName?.[0]?.toUpperCase() || "U";
  const pct = checklist.total
    ? Math.round((checklist.done / checklist.total) * 100)
    : 0;

  return (
    <div>
      {/* Header — saudação + sino */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-foreground)] text-base font-bold text-[var(--color-background)]">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Olá
            </p>
            <h1 className="truncate text-[17px] font-bold leading-tight text-[var(--color-foreground)]">
              {user?.firstName || "viajante"}
            </h1>
          </div>
        </div>
        <button
          aria-label="Notificações"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] shadow-[var(--shadow-elev-1)] transition-transform active:scale-95"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--color-primary)] ring-2 ring-[var(--color-card)]" />
        </button>
      </header>

      {/* Hero — Chat IA */}
      <motion.section
        initial="initial"
        animate="animate"
        variants={staggerContainer(reduce)}
        className="mt-6"
      >
        <motion.div variants={staggerItem(reduce)}>
          <Link
            to="/chat"
            aria-label="Abrir chat com IA"
            className="group relative block overflow-hidden rounded-[2rem] bg-[var(--color-ink)] p-6 text-[var(--color-ink-foreground)] shadow-[var(--shadow-elev-2)] transition-transform active:scale-[0.99]"
          >
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90">
                <Sparkles className="h-3 w-3" />
                IA
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/90 transition-all group-hover:bg-white/20">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <h2 className="mt-10 text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em]">
              Capture suas dúvidas.
              <br />
              <span className="text-white/60">Antes, durante e depois da mudança.</span>
            </h2>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/65">
              Pergunte sobre vistos, impostos, remessas e o dia a dia. Em
              português, do jeito certo.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[var(--color-ink)]">
              <MessageCircle className="h-4 w-4" />
              Abrir chat
            </div>
          </Link>
        </motion.div>

        {/* Checklist + Tip */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <motion.div variants={staggerItem(reduce)}>
            <Link
              to="/checklist"
              aria-label="Ver tarefas"
              className="group relative flex h-full min-h-[148px] flex-col justify-between rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-elev-1)] transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                  <CheckSquare className="h-[18px] w-[18px]" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-[var(--color-zinc-400)] transition-all group-hover:text-[var(--color-foreground)]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  Tarefas
                </p>
                <p
                  data-numeric
                  className="mt-0.5 text-[22px] font-extrabold leading-none tracking-tight text-[var(--color-foreground)]"
                >
                  {checklist.done}
                  <span className="text-[var(--color-muted-foreground)]">
                    /{checklist.total || "—"}
                  </span>
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-zinc-100)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.article
            variants={staggerItem(reduce)}
            className="flex min-h-[148px] flex-col justify-between rounded-[1.5rem] bg-[var(--color-primary-soft)] p-5"
          >
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-green-700)]">
              Dica do dia
            </span>
            <p className="text-[13px] font-medium leading-snug text-[var(--color-green-700)]">
              {tip}
            </p>
          </motion.article>
        </div>
      </motion.section>

      {/* Em breve */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between px-1">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
            Em breve
          </h3>
          <span className="rounded-full bg-[var(--color-primary-soft)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Em desenvolvimento
          </span>
        </div>
        <ul className="grid grid-cols-3 gap-3">
          {COMING_SOON.map((q) => {
            const Icon = q.icon;
            return (
              <li key={q.label}>
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-4 text-center opacity-45">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-canvas)] text-[var(--color-muted-foreground)]">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                  <span className="text-[12px] font-semibold text-[var(--color-muted-foreground)]">
                    {q.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
