import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  Bell,
  Settings,
  ShieldCheck,
  ChevronRight,
  Pencil,
  UserCog,
  CreditCard,
  UserPlus,
  Star,
  HelpCircle,
  Info,
  MapPin,
  ReceiptText,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileSkeleton } from "@/components/skeletons/RouteSkeletons";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/profile")({
  head: () => ({
    ...seo({
      title: "Perfil",
      description: "Sua conta DEZRAIZ — preferências, plano e configurações.",
      path: "/profile",
      noindex: true,
    }),
  }),
  component: () => (
    <RequireAuth>
      <AppShell>
        <PageTransition>
          <Profile />
        </PageTransition>
      </AppShell>
    </RequireAuth>
  ),
});

const APP_VERSION = "DEZRAIZ v2.0.0";

function Profile() {
  const { user, loading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [sobreOpen, setSobreOpen] = useState(false);
  const [ajudaOpen, setAjudaOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  const handleManageSubscription = async () => {
    if (!user) return;
    setPortalError("");
    setPortalLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/billing-portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Erro ao abrir portal.");
      window.location.href = data.url;
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : "Tente novamente.");
      setPortalLoading(false);
    }
  };

  const handleShare = () => {
    const url = "https://dezraiz.com";
    if (navigator.share) {
      navigator.share({ title: "DEZRAIZ", text: "Seu guia para a vida fora do Brasil", url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleRate = () => {
    window.open("https://dezraiz.com", "_blank");
  };

  if (loading || !user) return <ProfileSkeleton />;

  const fullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Você";
  const locationLine = [
    user?.location?.neighbourhood,
    user?.location?.city,
    user?.location?.state,
    user?.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-[-0.025em] text-[var(--color-foreground)]">
          Perfil
        </h1>
      </header>

      {/* Identity card */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[var(--color-ink)] p-6 text-[var(--color-ink-foreground)] shadow-[var(--shadow-elev-2)]">
        <button
          type="button"
          aria-label="Editar perfil"
          onClick={() => setEditOpen(true)}
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl font-extrabold text-white">
            {user?.firstName?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1 pr-12">
            <p className="truncate text-[18px] font-bold leading-tight">
              {fullName}
            </p>
            <p className="truncate text-[12px] text-white/60">{user?.email}</p>
          </div>
        </div>
        {locationLine && (
          <div className="mt-5 flex items-center gap-1.5 border-t border-white/10 pt-4 text-[13px] text-white/80">
            <MapPin className="size-4 flex-none text-white/50" strokeWidth={1.75} />
            <span className="truncate">{locationLine}</span>
          </div>
        )}
      </section>

      {/* Conta */}
      <SectionList title="Conta" className="mt-6">
        <ListItem icon={<UserCog className="h-5 w-5" />} label="Editar perfil" onClick={() => setEditOpen(true)} />
        <ListItem icon={<Bell className="h-5 w-5" />} label="Notificações" />
        <ListItem icon={<Settings className="h-5 w-5" />} label="Preferências" />
        <ListItem
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Privacidade e segurança"
        />
      </SectionList>

      {/* DEZRAIZ */}
      <SectionList title="DEZRAIZ" className="mt-6">
        <ListItem
          icon={<CreditCard className="h-5 w-5" />}
          label="Plano atual"
          to="/planos"
          trailing={
            <span
              className={
                "rounded-full px-2.5 py-0.5 text-[11px] font-bold " +
                (user?.isPremium
                  ? "bg-[var(--color-primary-soft)] text-[var(--color-green-700)]"
                  : "bg-[var(--color-zinc-100)] text-[var(--color-zinc-700)]")
              }
            >
              {user?.isPremium ? "Premium" : "Gratuito"}
            </span>
          }
        />
        {user?.isPremium && (
          <ListItem
            icon={portalLoading
              ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-foreground)]" />
              : <ReceiptText className="h-5 w-5" />}
            label="Gerenciar assinatura"
            onClick={handleManageSubscription}
          />
        )}
        <ListItem icon={<UserPlus className="h-5 w-5" />} label="Convidar amigos" onClick={handleShare} />
        <ListItem icon={<Star className="h-5 w-5" />} label="Avaliar o app" onClick={handleRate} />
        <ListItem icon={<HelpCircle className="h-5 w-5" />} label="Ajuda e suporte" onClick={() => setAjudaOpen(true)} />
        <ListItem icon={<Info className="h-5 w-5" />} label="Sobre o DEZRAIZ" onClick={() => setSobreOpen(true)} />
      </SectionList>
      {portalError && (
        <p className="mt-2 px-2 text-center text-[12px] text-[var(--color-state-error)]">{portalError}</p>
      )}

      {/* Logout */}
      <button
        type="button"
        onClick={() => setConfirmLogout(true)}
        className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--color-state-error)]/20 bg-[var(--color-state-error)]/5 text-sm font-semibold text-[var(--color-state-error)] transition-transform active:scale-[0.99]"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>

      <p className="mt-4 text-center text-[11px] text-[var(--color-zinc-400)]">
        {APP_VERSION}
      </p>

      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent className="gap-0 p-0 sm:max-w-sm overflow-hidden">
          <div className="px-6 pb-2 pt-6 text-center">
            <DialogTitle className="text-[17px] font-bold">Sair da conta?</DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px] text-[var(--color-muted-foreground)]">
              Você precisará entrar novamente para acessar suas informações.
            </DialogDescription>
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-[var(--color-border)] px-6 pb-6 pt-4">
            <button
              type="button"
              onClick={() => { logout(); navigate({ to: "/login" }); }}
              className="h-12 w-full rounded-xl bg-[var(--color-state-error)] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Sair
            </button>
            <button
              type="button"
              onClick={() => setConfirmLogout(false)}
              className="h-12 w-full rounded-xl bg-[var(--color-secondary)] text-[15px] font-semibold text-[var(--color-foreground)] transition-opacity hover:opacity-80 active:scale-[0.98]"
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialFirstName={user.firstName}
        initialLastName={user.lastName}
        onSave={updateProfile}
      />

      {/* Sobre o DEZRAIZ */}
      <Dialog open={sobreOpen} onOpenChange={setSobreOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-sm overflow-hidden">
          <div className="px-6 pb-2 pt-6">
            <DialogTitle className="text-[17px] font-bold">Sobre o DEZRAIZ</DialogTitle>
            <DialogDescription className="mt-1 text-[13px] text-[var(--color-muted-foreground)]">
              Seu guia para a vida fora do Brasil.
            </DialogDescription>
          </div>
          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-6 pb-6 pt-4 text-[13px] text-[var(--color-foreground)]">
            <p>O DEZRAIZ nasceu para ajudar brasileiros em todas as etapas da vida fora do Brasil — desde o planejamento da mudança até a adaptação no novo país.</p>
            <p className="text-[var(--color-muted-foreground)]">
              {APP_VERSION} · Feito com ♥ para a diáspora brasileira.
            </p>
          </div>
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={() => setSobreOpen(false)}
              className="h-12 w-full rounded-xl bg-[var(--color-secondary)] text-[15px] font-semibold text-[var(--color-foreground)] transition-opacity hover:opacity-80 active:scale-[0.98]"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ajuda e suporte */}
      <Dialog open={ajudaOpen} onOpenChange={setAjudaOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-sm overflow-hidden">
          <div className="px-6 pb-2 pt-6">
            <DialogTitle className="text-[17px] font-bold">Ajuda e suporte</DialogTitle>
            <DialogDescription className="mt-1 text-[13px] text-[var(--color-muted-foreground)]">
              Estamos aqui para te ajudar.
            </DialogDescription>
          </div>
          <div className="flex flex-col gap-2 border-t border-[var(--color-border)] px-6 pb-6 pt-4">
            <a
              href="mailto:suporte@dezraiz.com"
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Enviar email
            </a>
            <button
              type="button"
              onClick={() => setAjudaOpen(false)}
              className="h-12 w-full rounded-xl bg-[var(--color-secondary)] text-[15px] font-semibold text-[var(--color-foreground)] transition-opacity hover:opacity-80 active:scale-[0.98]"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditProfileDialog({
  open,
  onClose,
  initialFirstName,
  initialLastName,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialFirstName: string;
  initialLastName: string;
  onSave: (data: { firstName?: string; lastName?: string }) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setFirstName(initialFirstName);
      setLastName(initialLastName);
      setError("");
    }
  }, [open, initialFirstName, initialLastName]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    setError("");
    setSaving(true);
    try {
      await onSave({ firstName: firstName.trim(), lastName: lastName.trim() });
      onClose();
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && !o && onClose()}>
      <DialogContent className="gap-0 p-0 sm:max-w-sm overflow-hidden">
        <div className="px-6 pb-2 pt-6">
          <DialogTitle className="text-[17px] font-bold">Editar perfil</DialogTitle>
          <DialogDescription className="mt-1 text-[13px] text-[var(--color-muted-foreground)]">
            Atualize seu nome de exibição.
          </DialogDescription>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-6 pb-2 pt-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-[var(--color-foreground)]">
                Nome
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={saving}
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-60"
                placeholder="Seu nome"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-[var(--color-foreground)]">
                Sobrenome
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={saving}
                className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-60"
                placeholder="Seu sobrenome"
              />
            </div>
            {error && (
              <p className="text-[13px] text-[var(--color-state-error)]">{error}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 px-6 pb-6 pt-3">
            <button
              type="submit"
              disabled={saving}
              className="h-12 w-full rounded-xl bg-[var(--color-primary)] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-12 w-full rounded-xl bg-[var(--color-secondary)] text-[15px] font-semibold text-[var(--color-foreground)] transition-opacity hover:opacity-80 active:scale-[0.98] disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SectionList({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {title}
      </h2>
      <ul className="divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-elev-1)]">
        {children}
      </ul>
    </section>
  );
}

function ListItem({
  icon,
  label,
  trailing,
  onClick,
  to,
}: {
  icon: ReactNode;
  label: string;
  trailing?: ReactNode;
  onClick?: () => void;
  to?: string;
}) {
  const inner = (
    <>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[var(--color-canvas)] text-[var(--color-foreground)]">
        {icon}
      </span>
      <span className="flex-1 truncate text-[14px] font-medium text-[var(--color-foreground)]">
        {label}
      </span>
      {trailing}
      <ChevronRight className="h-[18px] w-[18px] flex-none text-[var(--color-zinc-400)]" />
    </>
  );

  const className =
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-[var(--color-canvas)]";

  if (to) {
    return (
      <li>
        <Link to={to} className={className}>
          {inner}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    </li>
  );
}
