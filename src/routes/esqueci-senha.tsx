import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { seo } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/esqueci-senha")({
  head: () => ({
    ...seo({
      title: "Recuperar senha",
      description: "Receba um link para redefinir a senha da sua conta DEZRAIZ.",
      path: "/esqueci-senha",
      noindex: true,
    }),
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/redefinir-senha` },
    );
    setSubmitting(false);
    if (resetError) {
      setError("Não foi possível enviar o link. Tente novamente.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-zinc-50)] px-5 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-[var(--color-zinc-200)] bg-card p-7 shadow-sm sm:p-8">
        {/* Header inline: voltar + wordmark */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-zinc-600)] transition-colors hover:text-[var(--color-zinc-900)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <Logo size={26} />
        </div>

        {!sent ? (
          <>
            <h1 className="mt-8 text-[26px] font-extrabold leading-tight tracking-tight text-[var(--color-zinc-900)]">
              Esqueceu a senha?
            </h1>
            <p className="mt-2 text-[15px] leading-snug text-[var(--color-zinc-500)]">
              Digite seu e-mail e enviaremos um link para você criar uma nova.
            </p>

            <form onSubmit={submit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[var(--color-zinc-900)]"
                >
                  E-mail
                </label>
                <input
                  ref={inputRef}
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="h-[52px] w-full rounded-full border border-[var(--color-zinc-200)] bg-card px-5 text-base text-[var(--color-zinc-900)] placeholder:text-[var(--color-zinc-400)] transition-all focus:border-[var(--color-green-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)]/40"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex h-[52px] w-full items-center justify-center rounded-full bg-[var(--color-green-500)] text-base font-semibold text-white transition-all hover:bg-[var(--color-green-600)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  "Enviar link de redefinição"
                )}
              </button>
              {error && (
                <p className="text-center text-[13px] text-[var(--color-state-error)]">
                  {error}
                </p>
              )}
            </form>
          </>
        ) : (
          <div className="mt-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-green-50)] text-[var(--color-green-600)]">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-[var(--color-zinc-900)]">
              E-mail enviado
            </h1>
            <p className="mt-2 text-sm text-[var(--color-zinc-500)]">
              Se houver uma conta com{" "}
              <span className="font-medium text-[var(--color-zinc-900)]">{email}</span>, você
              receberá um link em alguns minutos.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-green-500)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-green-600)]"
            >
              Voltar para o login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
