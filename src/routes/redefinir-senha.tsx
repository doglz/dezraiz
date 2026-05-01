import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    ...seo({
      title: "Redefinir senha",
      description: "Crie uma nova senha para sua conta DEZRAIZ.",
      path: "/redefinir-senha",
      noindex: true,
    }),
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Supabase processes the URL hash and emits PASSWORD_RECOVERY when valid.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // If no event fires within 4 seconds, the link is invalid/expired.
    const timeout = window.setTimeout(() => {
      setExpired(true);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  // Once ready, cancel the expired timeout by tracking ready state
  useEffect(() => {
    if (ready) setExpired(false);
  }, [ready]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setError("");
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) {
      setError("Não foi possível redefinir. O link pode ter expirado.");
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/" }), 2500);
  };

  if (!ready && !expired) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-zinc-50)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-zinc-50)] px-5 py-10">
        <div className="w-full max-w-sm rounded-3xl border border-[var(--color-zinc-200)] bg-card p-7 text-center shadow-sm sm:p-8">
          <Logo size={26} />
          <h1 className="mt-8 text-[22px] font-extrabold tracking-tight text-[var(--color-zinc-900)]">
            Link inválido ou expirado
          </h1>
          <p className="mt-2 text-[14px] text-[var(--color-zinc-500)]">
            Solicite um novo link de redefinição de senha.
          </p>
          <Link
            to="/esqueci-senha"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-green-500)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-green-600)]"
          >
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-zinc-50)] px-5 py-10">
        <div className="w-full max-w-sm rounded-3xl border border-[var(--color-zinc-200)] bg-card p-7 text-center shadow-sm sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-green-50)] text-[var(--color-green-600)]">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-[var(--color-zinc-900)]">
            Senha redefinida!
          </h1>
          <p className="mt-2 text-sm text-[var(--color-zinc-500)]">
            Redirecionando para o app…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-zinc-50)] px-5 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-[var(--color-zinc-200)] bg-card p-7 shadow-sm sm:p-8">
        <Logo size={26} />

        <h1 className="mt-8 text-[26px] font-extrabold leading-tight tracking-tight text-[var(--color-zinc-900)]">
          Nova senha
        </h1>
        <p className="mt-2 text-[15px] leading-snug text-[var(--color-zinc-500)]">
          Escolha uma senha com pelo menos 8 caracteres.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-zinc-900)]">
              Nova senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="Mínimo 8 caracteres"
                className="h-[52px] w-full rounded-full border border-[var(--color-zinc-200)] bg-card px-5 pr-12 text-base text-[var(--color-zinc-900)] placeholder:text-[var(--color-zinc-400)] transition-all focus:border-[var(--color-green-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)]/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-zinc-400)]"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-zinc-900)]">
              Confirmar senha
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Repita a senha"
              className="h-[52px] w-full rounded-full border border-[var(--color-zinc-200)] bg-card px-5 text-base text-[var(--color-zinc-900)] placeholder:text-[var(--color-zinc-400)] transition-all focus:border-[var(--color-green-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)]/40"
            />
          </div>

          {error && (
            <p className="text-center text-[13px] text-[var(--color-state-error)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-[52px] w-full items-center justify-center rounded-full bg-[var(--color-green-500)] text-base font-semibold text-white transition-all hover:bg-[var(--color-green-600)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              "Salvar nova senha"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
