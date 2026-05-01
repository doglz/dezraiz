import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Users as UsersIcon,
  UserPlus,
  TrendingUp,
  CircleDollarSign,
  Activity as ActivityIcon,
  Percent,
  CheckCircle2,
  Clock3,
  XCircle,
  MapPinned,
  Sparkles,
  AlertTriangle,
  Mail,
  Plus,
} from "lucide-react";

import { AdminShell, type AdminSection } from "@/components/admin/AdminShell";
import { StatCard, StatSkeleton } from "@/components/admin/StatCard";
import { UserTable, TableSkeleton } from "@/components/admin/UserTable";
import { UserDrawer } from "@/components/admin/UserDrawer";
import { PlanBadge, StatusBadge, TierBadge } from "@/components/admin/PlanBadge";
import { Pagination, usePagination } from "@/components/admin/Pagination";
import {
  overviewStats,
  sponsors,
  subscriptionStats,
  subscriptions,
  usageRows,
  usageStats,
  users as mockUsers,
} from "@/mocks/admin-data";
import type { AdminUser, SubscriptionStatus } from "@/types/admin";

// Recharts é pesado (~100KB). Carrega só quando "Visão Geral" abre.
const OverviewCharts = lazy(() => import("@/components/admin/OverviewCharts"));


export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — DEZRAIZ" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: n % 1 === 0 ? 0 : 2 });

const fmtNum = (n: number) => n.toLocaleString("pt-BR");

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

function AdminPage() {
  const [section, setSection] = useState<AdminSection>("overview");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Skeleton bem curto só pra suavizar o primeiro paint — dados são síncronos.
    const t = window.setTimeout(() => setLoading(false), 150);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AdminShell active={section} onChange={setSection}>
      <SectionHeader section={section} />
      <div className="mt-6">
        {section === "overview" && <OverviewView loading={loading} />}
        {section === "users" && (
          <UsersView loading={loading} onSelect={setSelectedUser} />
        )}
        {section === "subscriptions" && <SubscriptionsView loading={loading} />}
        {section === "usage" && <UsageView loading={loading} />}
        {section === "newsletter" && <NewsletterView />}
        {section === "sponsors" && <SponsorsView loading={loading} />}
      </div>
      <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
    </AdminShell>
  );
}

const TITLES: Record<AdminSection, { title: string; subtitle: string }> = {
  overview: { title: "Visão Geral", subtitle: "Métricas principais e crescimento da plataforma" },
  users: { title: "Usuários", subtitle: "Lista completa com filtros e detalhes" },
  subscriptions: { title: "Assinaturas", subtitle: "Status de cobrança e ciclo dos planos pagos" },
  usage: { title: "Uso & Custo", subtitle: "Consumo de APIs externas e margem operacional" },
  newsletter: { title: "Newsletter", subtitle: "Métricas da lista de e-mails" },
  sponsors: { title: "Patrocinadores", subtitle: "Parcerias ativas e renovações" },
};

function SectionHeader({ section }: { section: AdminSection }) {
  const { title, subtitle } = TITLES[section];
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-white/50">{subtitle}</p>
    </div>
  );
}

// ===================== OVERVIEW =====================

function OverviewView({ loading }: { loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
          : (
            <>
              <StatCard
                label="Total de usuários"
                value={fmtNum(overviewStats.totalUsers)}
                icon={UsersIcon}
              />
              <StatCard
                label="Novos hoje"
                value={`+${overviewStats.newToday}`}
                delta={{ value: `${overviewStats.newTodayDelta}% vs ontem`, positive: true }}
                icon={UserPlus}
                accent="green"
              />
              <StatCard
                label="MRR atual"
                value={fmtBRL(overviewStats.mrr)}
                icon={CircleDollarSign}
                accent="green"
              />
              <StatCard
                label="Variação semanal"
                value={`+${fmtBRL(overviewStats.mrrWeeklyDelta)}`}
                delta={{ value: "últimos 7 dias", positive: true }}
                icon={TrendingUp}
                accent="green"
              />
              <StatCard
                label="Usuários ativos (7d)"
                value={fmtNum(overviewStats.activeUsers7d)}
                icon={ActivityIcon}
              />
              <StatCard
                label="Conversão Free → Pago"
                value={`${overviewStats.conversionRate}%`}
                icon={Percent}
                accent="yellow"
              />
            </>
          )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-80 rounded-2xl border border-white/5 bg-white/[0.02] lg:col-span-2 animate-pulse" />
          <div className="h-80 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="h-80 rounded-2xl border border-white/5 bg-white/[0.02] lg:col-span-2 animate-pulse" />
              <div className="h-80 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
            </div>
          }
        >
          <OverviewCharts />
        </Suspense>
      )}
    </div>
  );
}

// ===================== USERS =====================

function UsersView({ loading, onSelect }: { loading: boolean; onSelect: (u: AdminUser) => void }) {
  if (loading) return <TableSkeleton />;
  return <UserTable users={mockUsers} onSelect={onSelect} />;
}

// ===================== SUBSCRIPTIONS =====================

function SubscriptionsView({ loading }: { loading: boolean }) {
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriptionStatus>("all");
  const filtered = useMemo(
    () => subscriptions.filter((s) => statusFilter === "all" || s.status === statusFilter),
    [statusFilter],
  );
  const { page, setPage, totalPages, pageItems, from, to, total } = usePagination(filtered);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Assinaturas ativas" value={fmtNum(subscriptionStats.active)} icon={CheckCircle2} accent="green" />
            <StatCard label="Em trial" value={fmtNum(subscriptionStats.trial)} icon={Clock3} accent="yellow" />
            <StatCard label="Canceladas no mês" value={fmtNum(subscriptionStats.canceledThisMonth)} icon={XCircle} />
          </>
        )}
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 p-4">
          <h3 className="text-sm font-semibold text-white">Lista de assinaturas</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[#27c166]/60"
          >
            <option value="all">Todos os status</option>
            <option value="ativa">Ativas</option>
            <option value="trial">Trial</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-white/[0.04]" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 font-medium">Usuário</th>
                  <th className="px-4 py-3 font-medium">Plano</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Início</th>
                  <th className="px-4 py-3 font-medium">Próxima cobrança</th>
                  <th className="px-4 py-3 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-white/40">
                      Nenhuma assinatura encontrada.
                    </td>
                  </tr>
                )}
                {pageItems.map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{s.userName}</div>
                      <div className="text-xs text-white/50">{s.userEmail}</div>
                    </td>
                    <td className="px-4 py-3"><PlanBadge plan={s.plan} /></td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 text-white/60 tabular-nums">{fmtDate(s.startDate)}</td>
                    <td className="px-4 py-3 text-white/60 tabular-nums">{fmtDate(s.nextBilling)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-white">
                      {s.amount === 0 ? "—" : fmtBRL(s.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            from={from}
            to={to}
            total={total}
            onChange={setPage}
            unit="assinaturas"
          />
        )}
      </div>
    </div>
  );
}

// ===================== USAGE =====================

function UsageView({ loading }: { loading: boolean }) {
  const { page, setPage, totalPages, pageItems, from, to, total } = usePagination(usageRows);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Buscas Maps (mês)"
              value={fmtNum(usageStats.mapsSearches)}
              hint={`~${fmtBRL(usageStats.mapsCost)}`}
              icon={MapPinned}
            />
            <StatCard
              label="Queries IA (mês)"
              value={fmtNum(usageStats.aiQueries)}
              hint={`~${fmtBRL(usageStats.aiCost)}`}
              icon={Sparkles}
            />
            <StatCard
              label="Custo total estimado"
              value={fmtBRL(usageStats.totalCost)}
              icon={CircleDollarSign}
              accent="yellow"
            />
            <StatCard
              label="Receita mensal"
              value={fmtBRL(usageStats.monthlyRevenue)}
              delta={{ value: `margem ~${usageStats.margin}%`, positive: true }}
              icon={TrendingUp}
              accent="green"
            />
          </>
        )}
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="border-b border-white/5 p-4">
          <h3 className="text-sm font-semibold text-white">Top 10 usuários por consumo</h3>
          <p className="text-xs text-white/40">Ordenado pelo custo estimado neste mês</p>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-white/[0.04]" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Plano</th>
                  <th className="px-4 py-3 font-medium text-right">Buscas Maps</th>
                  <th className="px-4 py-3 font-medium text-right">Queries IA</th>
                  <th className="px-4 py-3 font-medium text-right">Custo (R$)</th>
                  <th className="px-4 py-3 font-medium">Limite</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((r) => (
                  <tr key={r.userId} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{r.userName}</td>
                    <td className="px-4 py-3"><PlanBadge plan={r.plan} /></td>
                    <td className="px-4 py-3 text-right tabular-nums text-white/80">{fmtNum(r.mapsSearches)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-white/80">{fmtNum(r.aiQueries)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-white">{fmtBRL(r.estimatedCost)}</td>
                    <td className="px-4 py-3">
                      {r.nearLimit ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5d547]/10 px-2.5 py-1 text-[11px] font-semibold text-[#f5d547]">
                          <AlertTriangle className="h-3 w-3" />
                          85% atingido
                        </span>
                      ) : (
                        <span className="text-xs text-white/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            from={from}
            to={to}
            total={total}
            onChange={setPage}
            unit="usuários"
          />
        )}
      </div>
    </div>
  );
}

// ===================== NEWSLETTER =====================

function NewsletterView() {
  return (
    <div className="grid place-items-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5">
          <Mail className="h-6 w-6 text-[#f5d547]" />
        </div>
        <h3 className="mt-5 text-lg font-bold tracking-tight text-white">
          Em breve — integração com Beehiiv
        </h3>
        <p className="mt-2 text-sm text-white/50">
          As métricas da newsletter aparecerão aqui assim que conectarmos a fonte de dados.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-left">
          {[
            { label: "Inscritos", value: "—" },
            { label: "Abertura", value: "—" },
            { label: "Último envio", value: "—" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/40">{m.label}</p>
              <p className="mt-1 text-base font-bold text-white/80">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===================== SPONSORS =====================

function SponsorsView({ loading }: { loading: boolean }) {
  const { page, setPage, totalPages, pageItems, from, to, total } = usePagination(sponsors, 6);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/50 opacity-60 cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Adicionar patrocinador
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02]">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-white/[0.04]" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 font-medium">Patrocinador</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium text-right">Valor mensal</th>
                  <th className="px-4 py-3 font-medium">Início</th>
                  <th className="px-4 py-3 font-medium">Renovação</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-semibold text-white">{s.name}</td>
                    <td className="px-4 py-3"><TierBadge tier={s.tier} /></td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-white">{fmtBRL(s.monthlyValue)}</td>
                    <td className="px-4 py-3 text-white/60 tabular-nums">{fmtDate(s.startDate)}</td>
                    <td className="px-4 py-3 text-white/60 tabular-nums">{fmtDate(s.renewalDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            from={from}
            to={to}
            total={total}
            onChange={setPage}
            unit="patrocinadores"
          />
        )}
      </div>
    </div>
  );
}
