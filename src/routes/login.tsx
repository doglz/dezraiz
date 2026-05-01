import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  WifiOff,
} from "lucide-react";
import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { seo } from "@/lib/seo";
import authHero from "@/assets/auth-hero.webp";

// Tiny inline placeholder (LQIP) — renders instantly while the hero loads.
const AUTH_HERO_LQIP =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAYABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDEiA4Hc1Wlt5CSzEZJ4GamjuIomLGEs38I38CpftyEkmDaxB+62ccUnJvoCgl1KUCEbs9AOaKSRgMbGJyOaKpMlpXGqwByQCRzj1pHkBJ2jaD29KKKQ+g0miiigD//2Q==";

export const Route = createFileRoute("/login")({
  head: () => ({
    ...seo({
      title: "Entrar",
      description: "Acesse sua conta DEZRAIZ.",
      path: "/login",
      noindex: true,
    }),
  }),
  component: LoginPage,
});

type Mode = "login" | "register";

const TAB_SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 35,
} as const;

function LoginPage() {
  const { login, loginWithGoogle, register, user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const reduceMotion = useReducedMotion() ?? false;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<{
    kind: "credentials" | "network";
    message: string;
  } | null>(null);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  if (loading) return null;
  if (user) {
    return <Navigate to={user.onboarding ? "/" : "/onboarding"} />;
  }

  const isRegister = mode === "register";
  const emailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!emailValid) {
      setGlobalError({
        kind: "credentials",
        message: "Informe um endereço de e-mail válido.",
      });
      requestAnimationFrame(() => emailRef.current?.focus());
      return;
    }

    if (isRegister && !acceptTerms) {
      setGlobalError({
        kind: "credentials",
        message: "Você precisa aceitar os Termos de Uso para continuar.",
      });
      return;
    }

    if (isRegister && password.length < 8) {
      setGlobalError({
        kind: "credentials",
        message: "A senha deve ter pelo menos 8 caracteres.",
      });
      requestAnimationFrame(() => passwordRef.current?.focus());
      return;
    }

    setSubmitting(true);
    let succeeded = false;
    try {
      if (isRegister) {
        await register("", "", email, password);
      } else {
        await login(email, password);
      }
      succeeded = true;
      // Keep submitting=true so the button stays in loading state
      // until onAuthStateChange fires and the component unmounts (redirect).
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";

      // E-mail confirmation required — not a real error, just inform the user
      if (msg === "EMAIL_CONFIRMATION_REQUIRED") {
        setGlobalError({
          kind: "credentials",
          message: "Conta criada! Verifique seu e-mail para confirmar antes de entrar.",
        });
        // falls through to finally → setSubmitting(false) since succeeded=false
        return;
      }

      const isRateLimit = msg.includes("rate limit") || msg.includes("Too Many") || msg.includes("too_many");
      const isNetwork = msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch");

      let errorMessage: string;

      if (isRateLimit) {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
      } else if (isNetwork) {
        errorMessage = "Sem conexão. Verifique sua internet e tente novamente.";
      } else if (isRegister) {
        if (msg.includes("already registered") || msg.includes("already been registered")) {
          errorMessage = "Este e-mail já está cadastrado. Tente entrar.";
        } else if (msg.includes("password")) {
          errorMessage = "A senha deve ter pelo menos 8 caracteres.";
        } else {
          errorMessage = "Não foi possível criar sua conta. Tente novamente.";
        }
      } else {
        if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
          errorMessage = "E-mail ou senha incorretos.";
        } else if (msg.includes("Email not confirmed")) {
          errorMessage = "Confirme seu e-mail antes de entrar.";
        } else {
          errorMessage = "Não foi possível entrar. Tente novamente.";
        }
      }

      setGlobalError({
        kind: isNetwork || isRateLimit ? "network" : "credentials",
        message: errorMessage,
      });
      requestAnimationFrame(() => {
        (isRegister ? emailRef : passwordRef).current?.focus();
      });
    } finally {
      if (!succeeded) setSubmitting(false);
    }
  };

  const onSwitch = (nextMode: Mode) => {
    if (submitting || nextMode === mode) return;
    setMode(nextMode);
    setGlobalError(null);
  };

  const onGoogle = async () => {
    setGlobalError(null);
    try {
      await loginWithGoogle();
    } catch {
      setGlobalError({
        kind: "network",
        message: "Sem conexão. Tente novamente.",
      });
    }
  };

  return (
    <div className="relative grid h-[100dvh] w-full grid-cols-1 overflow-hidden bg-[#0B0B0F] text-white lg:grid-cols-2">
      {/* LEFT — hero image panel (desktop) */}
      <HeroPanel />

      {/* RIGHT — form panel */}
      <section className="relative flex h-[100dvh] flex-col overflow-y-auto lg:overflow-hidden">
        {/* Mobile: soft hero image as backdrop at the top */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[45%] overflow-hidden lg:hidden"
        >
          <img
            src={AUTH_HERO_LQIP}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl"
          />
          <img
            src={authHero}
            alt=""
            aria-hidden
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B0B0F]/40 via-[#0B0B0F]/90 to-[#0B0B0F] lg:hidden"
        />

        {/* Top bar: logo (mobile) + spacer */}
        <header className="relative z-10 flex items-center justify-between px-6 pt-6 sm:px-8 lg:hidden">
          <Logo />
        </header>

        {/* Form body */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-[420px]">
            <h1 className="text-center text-[1.7rem] font-bold leading-[1.15] tracking-tight sm:text-3xl lg:text-[2rem]">
              {isRegister ? "Crie sua conta na DEZRAIZ" : "Bem-vindo de volta"}
            </h1>
            <p className="mt-2 text-center text-sm text-white/60">
              {isRegister
                ? "Leva menos de um minuto para começar."
                : "Retome seu guia personalizado."}
            </p>

            <div className="mt-5">
              <PillTabs mode={mode} onSwitch={onSwitch} disabled={submitting} />
            </div>

            <div className="mt-4">
              <SharedAuthForm
                isRegister={isRegister}
                email={email}
                password={password}
                acceptTerms={acceptTerms}
                submitting={submitting}
                globalError={globalError}
                setEmail={setEmail}
                setPassword={setPassword}
                setAcceptTerms={setAcceptTerms}
                submit={submit}
                onGoogle={onGoogle}
                emailRef={emailRef}
                passwordRef={passwordRef}
                reduceMotion={reduceMotion}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-green-500)] text-base font-bold text-white">
        D
      </span>
      <span className="text-lg font-semibold tracking-tight">DEZRAIZ</span>
    </div>
  );
}

function HeroPanel() {
  return (
    <aside className="relative hidden h-[100dvh] overflow-hidden bg-[#0B0B0F] lg:block">
      <img
        src={AUTH_HERO_LQIP}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
      />
      <img
        src={authHero}
        alt=""
        aria-hidden
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Overlays: dim + color wash + right edge fade to blend into form panel */}
      <div aria-hidden className="absolute inset-0 bg-black/30" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(11,11,15,0.05) 45%, rgba(11,11,15,0.85) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-24"
        style={{
          background:
            "linear-gradient(90deg, rgba(11,11,15,0) 0%, rgba(11,11,15,0.85) 100%)",
        }}
      />

      {/* Top-left: logo */}
      <div className="absolute left-10 top-10 z-10">
        <Logo />
      </div>

      {/* Bottom-left: floating testimonial / highlight card */}
      <div className="absolute inset-x-10 bottom-10 z-10">
        <div className="max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[var(--color-green-500)]/20 text-[var(--color-green-400)]">
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Seu guia em toda a jornada
              </p>
              <p className="mt-1 text-[13px] leading-snug text-white/70">
                Checklist, documentos, impostos e decisões do dia a dia para
                quem planeja, viaja ou já mora fora.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PillTabs({
  mode,
  onSwitch,
  disabled = false,
}: {
  mode: Mode;
  onSwitch: (m: Mode) => void;
  disabled?: boolean;
}) {
  const isRegister = mode === "register";

  return (
    <div className="relative grid grid-cols-2 rounded-full bg-white/5 p-1 ring-1 ring-white/10">
      {(["register", "login"] as const).map((m) => {
        const active = (m === "register") === isRegister;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onSwitch(m)}
            disabled={disabled}
            aria-pressed={active}
            className="relative h-10 rounded-full text-[13px] font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-green-500)]/50 disabled:cursor-default disabled:opacity-70"
          >
            {active && (
              <motion.span
                layoutId="auth-tab-pill"
                transition={TAB_SPRING}
                className="absolute inset-0 rounded-full bg-white/15 ring-1 ring-white/20"
              />
            )}
            <span
              className={`relative z-10 ${
                active ? "text-white" : "text-white/55"
              }`}
            >
              {m === "register" ? "Criar conta" : "Entrar"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface SharedFormProps {
  isRegister: boolean;
  email: string;
  password: string;
  acceptTerms: boolean;
  submitting: boolean;
  globalError: { kind: "credentials" | "network"; message: string } | null;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setAcceptTerms: (v: boolean) => void;
  submit: (e: FormEvent) => void;
  onGoogle: () => void;
  emailRef: React.MutableRefObject<HTMLInputElement | null>;
  passwordRef: React.MutableRefObject<HTMLInputElement | null>;
  reduceMotion: boolean;
}

function SharedAuthForm(props: SharedFormProps) {
  const {
    isRegister,
    email,
    password,
    acceptTerms,
    submitting,
    globalError,
    setEmail,
    setPassword,
    setAcceptTerms,
    submit,
    onGoogle,
    emailRef,
    passwordRef,
    reduceMotion,
  } = props;

  const [showPassword, setShowPassword] = useState(false);
  const emailValid =
    email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <>
      {globalError && (
        <div className="mb-3">
          <GlobalErrorBanner error={globalError} />
        </div>
      )}

      <form onSubmit={submit} className="grid gap-3" noValidate>
        <DarkInput
          label="E-mail"
          ref={emailRef}
          type="email"
          required
          value={email}
          onChange={setEmail}
          placeholder="voce@email.com"
          autoComplete="email"
          rightAdornment={
            emailValid ? (
              <Check
                className="h-4 w-4 text-[var(--color-green-400)]"
                strokeWidth={2.5}
              />
            ) : undefined
          }
        />

        <DarkInput
          label={isRegister ? "Senha (mín. 8 caracteres)" : "Senha"}
          ref={passwordRef}
          type={showPassword ? "text" : "password"}
          required
          minLength={isRegister ? 8 : undefined}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete={isRegister ? "new-password" : "current-password"}
          rightAdornment={
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowPassword((s) => !s)}
              className="rounded-md p-1 text-white/50 transition-colors hover:text-white"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        {/* Bottom extras: compact, no layout reserves — we're on a fixed-height screen */}
        <div className="pt-0.5">
          <AnimatePresence mode="wait" initial={false}>
            {isRegister ? (
              <motion.label
                key="terms"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex cursor-pointer items-center gap-2.5 text-[13px] leading-snug text-white/70"
              >
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="flex h-4 w-4 flex-none items-center justify-center rounded-[5px] border border-white/25 bg-white/5 transition-all peer-checked:border-[var(--color-green-500)] peer-checked:bg-[var(--color-green-500)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-green-500)]/40"
                >
                  <Check
                    className={`h-3 w-3 text-black transition-opacity ${acceptTerms ? "opacity-100" : "opacity-0"}`}
                    strokeWidth={3}
                  />
                </span>
                <span>
                  Aceito os{" "}
                  <a
                    href="/termos"
                    className="font-medium text-white underline-offset-2 hover:underline"
                  >
                    Termos de Uso
                  </a>{" "}
                  e a{" "}
                  <a
                    href="/privacidade"
                    className="font-medium text-white underline-offset-2 hover:underline"
                  >
                    Política de Privacidade
                  </a>
                  .
                </span>
              </motion.label>
            ) : (
              <motion.div
                key="forgot"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex justify-end"
              >
                <Link
                  to="/esqueci-senha"
                  className="text-[13px] font-medium text-white/70 transition-colors hover:text-white"
                >
                  Esqueci minha senha
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-green-500)] text-[15px] font-semibold text-[#052E17] shadow-[0_10px_30px_-10px_rgba(34,197,94,0.6)] transition-all hover:bg-[var(--color-green-400)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isRegister ? (
            "Criar conta"
          ) : (
            "Entrar"
          )}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-[0.15em] text-white/40">
          ou
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        onClick={onGoogle}
        disabled={submitting}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/5 text-[15px] font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <GoogleIcon />
        Continuar com Google
      </button>

      {isRegister && (
        <PasswordStrengthDots password={password} className="mt-3" />
      )}
    </>
  );
}

interface DarkInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  rightAdornment?: ReactNode;
  invalid?: boolean;
  errorMessage?: string;
}

const DarkInput = forwardRef<HTMLInputElement, DarkInputProps>(function DarkInput(
  props,
  ref,
) {
  const {
    label,
    type,
    value,
    onChange,
    placeholder,
    required,
    minLength,
    autoComplete,
    rightAdornment,
    invalid,
    errorMessage,
  } = props;
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.08em] text-white/50"
      >
        {label}
      </label>
      <div
        className={[
          "flex h-12 items-center overflow-hidden rounded-xl border bg-white/5 px-4 transition-all",
          invalid
            ? "border-[var(--color-state-error)]/60 ring-2 ring-[var(--color-state-error)]/30"
            : focused
              ? "border-[var(--color-green-500)]/70 ring-2 ring-[var(--color-green-500)]/25"
              : "border-white/10 hover:border-white/20",
        ].join(" ")}
      >
        <input
          id={id}
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          className="flex-1 bg-transparent text-[15px] text-white placeholder:text-white/35 focus:outline-none"
        />
        {rightAdornment && <span className="ml-2 flex-none">{rightAdornment}</span>}
      </div>
      {invalid && errorMessage && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[var(--color-state-error)]">
          <AlertCircle className="h-3.5 w-3.5" />
          {errorMessage}
        </p>
      )}
    </div>
  );
});

function PasswordStrengthDots({
  password,
  className = "",
}: {
  password: string;
  className?: string;
}) {
  const score = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/\d/.test(password)) s++;
    if (/[A-Z]/.test(password)) s++;
    return s;
  }, [password]);

  if (password.length === 0) return null;

  const label = score <= 1 ? "Fraca" : score === 2 ? "Média" : "Forte";
  const color =
    score >= 3
      ? "bg-[var(--color-green-500)]"
      : score === 2
        ? "bg-[var(--color-state-warning)]"
        : "bg-[var(--color-state-error)]";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex flex-1 gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? color : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <span className="w-12 text-right text-[11px] font-medium text-white/50">
        {label}
      </span>
    </div>
  );
}

function GlobalErrorBanner({
  error,
}: {
  error: { kind: "credentials" | "network"; message: string };
}) {
  const Icon = error.kind === "network" ? WifiOff : AlertCircle;
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-[var(--color-state-error)]/30 bg-[var(--color-state-error)]/10 p-3 text-[13px] text-[var(--color-state-error)]"
    >
      <Icon className="mt-0.5 h-4 w-4 flex-none" />
      <p>{error.message}</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
