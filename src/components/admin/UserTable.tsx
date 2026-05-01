import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AdminUser, Plan } from "@/types/admin";
import { PlanBadge } from "./PlanBadge";
import { Pagination, usePagination } from "./Pagination";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

const fmtRel = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "agora";
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
};

export function UserTable({
  users,
  onSelect,
}: {
  users: AdminUser[];
  onSelect: (u: AdminUser) => void;
}) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | Plan>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  const countries = useMemo(
    () => Array.from(new Set(users.map((u) => u.country))).sort(),
    [users],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (planFilter !== "all" && u.plan !== planFilter) return false;
      if (countryFilter !== "all" && u.country !== countryFilter) return false;
      if (q && !u.email.toLowerCase().includes(q) && !u.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, planFilter, countryFilter]);

  const { page, setPage, totalPages, pageItems, from, to, total } = usePagination(filtered);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02]">
      {/* Filters */}
      <div className="flex flex-col gap-3 border-b border-white/5 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#27c166]/60 focus:bg-white/[0.05]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-[#27c166]/60"
          >
            <option value="all">Todos os planos</option>
            <option value="Livre">Livre</option>
            <option value="Raízes">Raízes</option>
            <option value="Terra">Terra</option>
          </select>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-[#27c166]/60"
          >
            <option value="all">Todos os países</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-white/40">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">País</th>
              <th className="px-4 py-3 font-medium">Plano</th>
              <th className="px-4 py-3 font-medium">Cadastro</th>
              <th className="px-4 py-3 font-medium">Atividade</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-white/40">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
            {pageItems.map((u) => (
              <tr
                key={u.id}
                onClick={() => onSelect(u)}
                className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-xs font-bold text-white/80">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-medium text-white">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/60">{u.email}</td>
                <td className="px-4 py-3 text-white/80">
                  <span className="mr-1.5">{u.countryFlag}</span>
                  {u.country}
                </td>
                <td className="px-4 py-3">
                  <PlanBadge plan={u.plan} />
                </td>
                <td className="px-4 py-3 text-white/60 tabular-nums">{fmtDate(u.signupDate)}</td>
                <td className="px-4 py-3 text-white/60 tabular-nums">{fmtRel(u.lastActivity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        from={from}
        to={to}
        total={total}
        onChange={setPage}
        unit="usuários"
      />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="mb-4 flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-xl bg-white/[0.04]" />
        <div className="h-10 w-32 animate-pulse rounded-xl bg-white/[0.04]" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-white/[0.04] py-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.05]" />
          <div className="h-3 flex-1 animate-pulse rounded bg-white/[0.05]" />
          <div className="h-3 w-20 animate-pulse rounded bg-white/[0.05]" />
        </div>
      ))}
    </div>
  );
}
