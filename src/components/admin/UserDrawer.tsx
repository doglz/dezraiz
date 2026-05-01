import { useEffect } from "react";
import { X, Mail, MapPin, Calendar, Activity, Tag } from "lucide-react";
import type { AdminUser } from "@/types/admin";
import { PlanBadge } from "./PlanBadge";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

const fmtRel = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "agora há pouco";
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
};

const STAGE_LABEL: Record<NonNullable<AdminUser["journeyStage"]>, string> = {
  planning: "Planejando sair",
  traveling: "Viajando / prestes a embarcar",
  living: "Já mora fora",
};

export function UserDrawer({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  useEffect(() => {
    if (!user) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [user, onClose]);

  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0a0a0a] shadow-2xl animate-in slide-in-from-right">
        <div className="sticky top-0 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/95 px-6 py-4 backdrop-blur">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Detalhes do usuário
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#27c166] to-[#1a8c47] text-xl font-extrabold text-black">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold tracking-tight text-white">{user.name}</h3>
              <p className="mt-0.5 truncate text-sm text-white/60">{user.email}</p>
              <div className="mt-2">
                <PlanBadge plan={user.plan} />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2">
            <DetailRow icon={Mail} label="E-mail" value={user.email} />
            <DetailRow
              icon={MapPin}
              label="Localização"
              value={`${user.countryFlag} ${user.city ?? "—"}, ${user.country}`}
            />
            {user.journeyStage && (
              <DetailRow icon={Tag} label="Etapa" value={STAGE_LABEL[user.journeyStage]} />
            )}
            <DetailRow icon={Calendar} label="Cadastro" value={fmtDate(user.signupDate)} />
            <DetailRow icon={Activity} label="Última atividade" value={fmtRel(user.lastActivity)} />
          </div>

          <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">ID interno</p>
            <p className="mt-1 font-mono text-xs text-white/70">{user.id}</p>
          </div>

          <p className="mt-6 text-[11px] text-white/40 leading-relaxed">
            Visualização somente leitura. Ações administrativas serão habilitadas após integração com o banco.
          </p>
        </div>
      </aside>
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">{label}</p>
        <p className="mt-0.5 truncate text-sm text-white/90">{value}</p>
      </div>
    </div>
  );
}
