import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  Mail,
  Handshake,
  Menu,
  X,
} from "lucide-react";

export type AdminSection =
  | "overview"
  | "users"
  | "subscriptions"
  | "usage"
  | "newsletter"
  | "sponsors";

const NAV: Array<{ id: AdminSection; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "users", label: "Usuários", icon: Users },
  { id: "subscriptions", label: "Assinaturas", icon: CreditCard },
  { id: "usage", label: "Uso & Custo", icon: Activity },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "sponsors", label: "Patrocinadores", icon: Handshake },
];

export function AdminShell({
  active,
  onChange,
  children,
}: {
  active: AdminSection;
  onChange: (s: AdminSection) => void;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [active]);

  return (
    <div
      className="min-h-screen text-[#f0efe9]"
      style={{ background: "#0a0a0a", colorScheme: "dark" }}
    >
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#27c166] grid place-items-center text-xs font-extrabold text-black">
            D
          </div>
          <span className="text-sm font-semibold tracking-tight">Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        {/* Sidebar — desktop */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/5 bg-[#0a0a0a] px-4 py-6 md:block">
          <div className="mb-8 flex items-center gap-2 px-2">
            <div className="h-9 w-9 rounded-xl bg-[#27c166] grid place-items-center text-base font-extrabold text-black">
              D
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">DEZRAIZ</div>
              <div className="text-[11px] text-white/40">Admin Panel</div>
            </div>
          </div>
          <SidebarNav active={active} onChange={onChange} />
          <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[11px] uppercase tracking-wider text-white/40">Modo</p>
            <p className="mt-0.5 text-xs font-medium text-[#f5d547]">Dados mockados</p>
            <p className="mt-1 text-[11px] text-white/50 leading-snug">
              Integração com banco será adicionada depois.
            </p>
          </div>
        </aside>

        {/* Sidebar — mobile drawer */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#0a0a0a] px-4 py-6 md:hidden animate-in slide-in-from-left">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-[#27c166] grid place-items-center text-base font-extrabold text-black">
                    D
                  </div>
                  <div>
                    <div className="text-sm font-bold">DEZRAIZ</div>
                    <div className="text-[11px] text-white/40">Admin Panel</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarNav active={active} onChange={onChange} />
            </aside>
          </>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarNav({
  active,
  onChange,
}: {
  active: AdminSection;
  onChange: (s: AdminSection) => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={[
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left",
              isActive
                ? "bg-white/[0.06] text-white"
                : "text-white/60 hover:bg-white/[0.03] hover:text-white",
            ].join(" ")}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#27c166]" />
            )}
            <Icon
              className={[
                "h-4 w-4 shrink-0",
                isActive ? "text-[#27c166]" : "text-white/50 group-hover:text-white/80",
              ].join(" ")}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
