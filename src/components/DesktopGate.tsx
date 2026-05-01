import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

/**
 * DesktopGate — bloqueia rotas autenticadas em desktop.
 * Mostra QR code da URL atual + CTA pra voltar à landing.
 *
 * Breakpoint: desktop = largura >= 1024px (lg).
 * SSR-safe: assume mobile no primeiro paint, valida no client.
 */
export function DesktopGate({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setIsDesktop(mq.matches);
      setUrl(window.location.href);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!mounted || !isDesktop) return <>{children}</>;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-canvas)] px-6 py-12">
      <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        {/* Left — pitch */}
        <div>
          <Logo size={28} />
          <h1 className="mt-8 text-5xl font-extrabold leading-[1.05] tracking-[-0.035em] text-[var(--color-foreground)]">
            DEZRAIZ é um app de celular.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--color-muted-foreground)]">
            Pra ter a melhor experiência, escaneie o QR ao lado e instale o app
            no seu celular. Em segundos você está dentro.
          </p>

          <div className="mt-8 space-y-3">
            <Step n={1} text="Escaneie o QR com a câmera do seu celular" />
            <Step n={2} text="Abra o link no navegador" />
            <Step n={3} text='Toque em "Adicionar à tela de início"' />
          </div>

          <Link
            to="/"
            className="mt-10 inline-flex h-12 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-6 text-sm font-semibold text-[var(--color-foreground)] shadow-[var(--shadow-elev-1)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elev-2)]"
          >
            Voltar para a página inicial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Right — QR card */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-full max-w-sm rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[var(--shadow-elev-3)]">
            <div className="absolute -top-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[var(--color-foreground)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-background)]">
              <Smartphone className="h-3.5 w-3.5" />
              Mobile only
            </div>

            <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-[var(--color-canvas)] p-6">
              {url ? (
                <QRCodeSVG
                  value={url}
                  size={240}
                  level="M"
                  bgColor="transparent"
                  fgColor="#0a0a0c"
                  className="h-full w-full"
                />
              ) : null}
            </div>

            <p className="mt-5 text-center text-sm text-[var(--color-muted-foreground)]">
              Aponte a câmera do celular pro código acima.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--color-foreground)] text-xs font-bold text-[var(--color-background)]">
        {n}
      </span>
      <p className="pt-0.5 text-sm text-[var(--color-foreground)]">{text}</p>
    </div>
  );
}
