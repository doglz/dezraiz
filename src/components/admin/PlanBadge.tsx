import type { Plan, SubscriptionStatus, SponsorTier } from "@/types/admin";

const PLAN_STYLES: Record<Plan, { bg: string; fg: string; dot: string }> = {
  Livre: { bg: "rgba(255,255,255,0.06)", fg: "#a1a1aa", dot: "#71717a" },
  Raízes: { bg: "rgba(39,193,102,0.12)", fg: "#27c166", dot: "#27c166" },
  Terra: { bg: "rgba(245,213,71,0.12)", fg: "#f5d547", dot: "#f5d547" },
};

export function PlanBadge({ plan }: { plan: Plan }) {
  const s = PLAN_STYLES[plan];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {plan}
    </span>
  );
}

const STATUS_STYLES: Record<SubscriptionStatus, { bg: string; fg: string; label: string }> = {
  ativa: { bg: "rgba(39,193,102,0.12)", fg: "#27c166", label: "Ativa" },
  trial: { bg: "rgba(245,213,71,0.12)", fg: "#f5d547", label: "Trial" },
  cancelada: { bg: "rgba(255,255,255,0.06)", fg: "#a1a1aa", label: "Cancelada" },
};

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

const TIER_STYLES: Record<SponsorTier, { bg: string; fg: string; label: string }> = {
  ouro: { bg: "rgba(245,213,71,0.14)", fg: "#f5d547", label: "Ouro" },
  prata: { bg: "rgba(203,213,225,0.14)", fg: "#cbd5e1", label: "Prata" },
  bronze: { bg: "rgba(180,120,60,0.18)", fg: "#d4a373", label: "Bronze" },
};

export function TierBadge({ tier }: { tier: SponsorTier }) {
  const s = TIER_STYLES[tier];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}
