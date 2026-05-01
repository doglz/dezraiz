import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Check, Crown, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";

import { seo } from "@/lib/seo";

export const Route = createFileRoute("/planos")({
  head: () => ({
    ...seo({
      title: "Planos",
      description:
        "Compare DEZRAIZ Livre, Raízes e Terra: chat IA, busca em todas as categorias, remessas e consultas com especialistas.",
      path: "/planos",
    }),
  }),
  validateSearch: (search: Record<string, unknown>): {
    success?: boolean;
    canceled?: boolean;
    plan?: string;
  } => ({
    success: search.success === "true" || search.success === true || undefined,
    canceled: search.canceled === "true" || search.canceled === true || undefined,
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <PageTransition>
          <Planos />
        </PageTransition>
      </AppShell>
    </RequireAuth>
  ),
});

type PlanKey = "livre" | "raizes" | "terra";

type Plan = {
  key: PlanKey;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
};

const PLANS: readonly Plan[] = [
  {
    key: "livre",
    name: "Livre",
    price: "R$0",
    period: "",
    tagline: "Para começar",
    features: [
      "IA com geolocalização (10 perguntas/mês)",
      "Search Cards com Maps (5 buscas/mês)",
      "Clarification Menu ativo",
      "Checklist básico do país",
      "Comparador de remessas (visualização)",
      "Newsletter semanal",
    ],
  },
  {
    key: "raizes",
    name: "Raízes",
    price: "R$49",
    period: "/mês",
    tagline: "Para quem usa todo dia",
    features: [
      "IA ilimitada com geolocalização",
      "Search Cards com Maps (70 buscas/mês)",
      "Foto real + rota + horário nos cards",
      "Checklist completo e interativo",
      "Comparador de remessas em tempo real",
      "Módulo gestante completo",
      "Newsletter localizada por país",
      "Guia de crédito local por país",
      "Acesso a parceiros com desconto",
    ],
    highlight: true,
  },
  {
    key: "terra",
    name: "Terra",
    price: "R$99",
    period: "/mês",
    tagline: "Sem limites",
    features: [
      "Tudo do plano Raízes",
      "170 buscas Maps/mês (vs 70 do Raízes)",
      "IA com histórico completo de conversas",
      "Alertas de câmbio personalizados",
      "Badge \"Membro Terra\" na comunidade",
      "Acesso antecipado a funcionalidades beta",
      "Suporte prioritário via chat",
    ],
  },
];

function Planos() {
  const { user, upgrade } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion() ?? false;
  const [selected, setSelected] = useState<PlanKey>("raizes");
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const search = useSearch({ from: "/planos" });

  // Handle Stripe redirect back
  useEffect(() => {
    if (search.success && search.plan && !user?.isPremium) {
      // Stripe webhook updates the plan in DB; we reload user data by refreshing
      upgrade().catch(() => {});
    }
  }, [search.success, search.plan]);

  const plan = PLANS.find((p) => p.key === selected)!;
  const isCurrent =
    (plan.key === "livre" && !user?.isPremium) ||
    (plan.key !== "livre" && user?.isPremium);

  const handleCheckout = async () => {
    if (!user) return;
    setCheckoutError("");
    setCheckingOut(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? supabaseKey;
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          planKey: plan.key,
          userId: authUser?.id ?? "",
          email: user.email,
        }),
      });
      let data: { url?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error(`Resposta inválida do servidor (${res.status})`);
      }
      if (!res.ok || !data.url) throw new Error(data.error ?? `Erro ${res.status} ao iniciar pagamento.`);
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Tente novamente.");
      setCheckingOut(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-84px)] flex-col">
      {/* Header */}
      <header className="flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/" })}
          aria-label="Voltar"
          className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[22px] font-extrabold tracking-[-0.025em] text-[var(--color-foreground)]">
          Planos
        </h1>
      </header>

      {/* Plan switcher */}
      <div
        role="tablist"
        aria-label="Escolha um plano"
        className="mt-5 grid grid-cols-3 gap-1 rounded-full bg-[var(--color-secondary)] p-1"
      >
        {PLANS.map((p) => {
          const active = p.key === selected;
          return (
            <button
              key={p.key}
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(p.key)}
              className="relative flex h-10 items-center justify-center rounded-full text-[13px] font-semibold transition-colors focus-visible:outline-none"
            >
              {active && (
                <motion.span
                  layoutId="plan-tab-pill"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 32 }
                  }
                  className="absolute inset-0 rounded-full bg-[var(--color-card)] shadow-[var(--shadow-elev-1)]"
                  aria-hidden
                />
              )}
              <span
                className={
                  "relative " +
                  (active
                    ? "text-[var(--color-foreground)]"
                    : "text-[var(--color-muted-foreground)]")
                }
              >
                {p.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Plan card */}
      <div className="mt-5 flex-1">
        <AnimatePresence mode="wait">
          <motion.section
            key={plan.key}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            className={
              "relative flex h-full flex-col overflow-hidden rounded-[2rem] p-6 " +
              (plan.highlight
                ? "bg-[var(--color-ink)] text-[var(--color-ink-foreground)] shadow-[var(--shadow-elev-3)]"
                : "border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-elev-1)]")
            }
          >
            {plan.highlight && (
              <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                <Crown className="h-3 w-3" strokeWidth={2.4} />
                Popular
              </span>
            )}

            <p
              className={
                "text-[11px] font-bold uppercase tracking-wider " +
                (plan.highlight
                  ? "text-white/60"
                  : "text-[var(--color-muted-foreground)]")
              }
            >
              {plan.tagline}
            </p>
            <h2
              className={
                "mt-1 text-[32px] font-extrabold tracking-[-0.03em] " +
                (plan.highlight
                  ? "text-white"
                  : "text-[var(--color-foreground)]")
              }
            >
              {plan.name}
            </h2>

            <div className="mt-4 flex items-baseline gap-1">
              <span
                data-numeric
                className={
                  "text-[44px] font-extrabold tracking-[-0.03em] " +
                  (plan.highlight
                    ? "text-white"
                    : "text-[var(--color-foreground)]")
                }
              >
                {plan.price}
              </span>
              {plan.period && (
                <span
                  className={
                    "text-sm " +
                    (plan.highlight
                      ? "text-white/60"
                      : "text-[var(--color-muted-foreground)]")
                  }
                >
                  {plan.period}
                </span>
              )}
            </div>

            <ul className="mt-5 space-y-3">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className={
                    "flex items-start gap-3 text-[14px] " +
                    (plan.highlight
                      ? "text-white/90"
                      : "text-[var(--color-foreground)]")
                  }
                >
                  <span
                    className={
                      "mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full " +
                      (plan.highlight
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-primary-soft)] text-[var(--color-green-700)]")
                    }
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA pinned to bottom */}
            <div className="mt-auto pt-6">
              {search.success && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[var(--color-primary-soft)] px-4 py-3 text-[13px] font-medium text-[var(--color-green-700)]">
                  <CheckCircle2 className="h-4 w-4 flex-none" />
                  Pagamento confirmado! Seu plano foi atualizado.
                </div>
              )}
              {search.canceled && (
                <div className="mb-4 rounded-2xl bg-[var(--color-zinc-100)] px-4 py-3 text-center text-[13px] text-[var(--color-muted-foreground)]">
                  Pagamento cancelado.
                </div>
              )}
              {plan.key === "livre" ? (
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => navigate({ to: "/" })}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-sm font-bold text-[var(--color-foreground)] transition-transform active:scale-[0.99] disabled:opacity-60"
                >
                  {isCurrent ? "Seu plano atual" : "Continuar grátis"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={user?.isPremium || checkingOut}
                  onClick={handleCheckout}
                  className={
                    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition-transform active:scale-[0.99] disabled:opacity-60 " +
                    (plan.highlight
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-foreground)] text-[var(--color-background)]")
                  }
                >
                  {user?.isPremium ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                      Você já é Premium
                    </>
                  ) : checkingOut ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    `Assinar ${plan.name}`
                  )}
                </button>
              )}
              {checkoutError && (
                <p className="mt-2 text-center text-[12px] text-[var(--color-state-error)]">
                  {checkoutError}
                </p>
              )}
              <p
                className={
                  "mt-3 text-center text-[11px] " +
                  (plan.highlight
                    ? "text-white/50"
                    : "text-[var(--color-muted-foreground)]")
                }
              >
                Cancele quando quiser. Cobrança mensal.
              </p>
            </div>
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}
