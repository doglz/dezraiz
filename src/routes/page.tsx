import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Home,
  Utensils,
  Car,
  Send,
  Landmark,
  HeartPulse,
  MapPin,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { seo } from "@/lib/seo";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Eyebrow, H2, H3, Body, Lead } from "@/components/ui/typography";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/page")({
  head: () => ({
    ...seo({
      title: "DEZRAIZ — O guia do brasileiro fora do Brasil",
      description:
        "Planeja a mudança, está viajando ou já mora fora? IA que te ajuda com banco, médico, remessa, restaurante brasileiro. Em português, do jeitinho certo.",
      path: "/page",
      rawTitle: true,
    }),
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div
      className="min-h-screen bg-[#0A0A0A]"
      style={{
        // Sobrescreve tokens semânticos só dentro da landing (que é dark)
        // para que classes utilitárias do design system fiquem legíveis.
        ["--foreground" as string]: "#ffffff",
        ["--muted-foreground" as string]: "#a1a1aa",
        ["--card" as string]: "#1A1A1A",
        ["--card-foreground" as string]: "#ffffff",
        ["--border" as string]: "rgba(255,255,255,0.1)",
        color: "#ffffff",
      }}
    >
      <SiteHeader />
      <Hero />
      <Numbers />
      <HowItWorks />
      <Categories />
      <Plans />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

/* ---------------- Header ---------------- */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0A0A0A]/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link to="/page" aria-label="DEZRAIZ — início">
          <Logo size={26} />
        </Link>
        <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:flex">
          <a href="#como-funciona" className="hover:text-foreground">Como funciona</a>
          <a href="#categorias" className="hover:text-foreground">O que tem</a>
          <Link to="/planos" className="hover:text-foreground">Planos</Link>
        </nav>
        <Link
          to="/login"
          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0A]">
      <div aria-hidden className="absolute inset-0 bg-grid-subtle" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pb-14 pt-12 text-center sm:px-6 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-32">
        {/* Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-yellow-300 sm:mb-7 sm:px-4 sm:py-1.5 sm:text-[11px]">
          <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.4} />
          Plano gratuito disponível · Sem cartão
        </div>

        <h1 className="font-display text-[44px] leading-[0.95] tracking-tight sm:text-[88px] lg:text-[128px]">
          <span className="block text-foreground">O guia do brasileiro</span>
          <span className="block">
            <span className="text-foreground">lá </span>
            <span className="text-primary">fora</span>
          </span>
        </h1>

        <Lead className="mt-5 max-w-[20rem] px-1 leading-[1.6] text-pretty sm:mt-7 sm:max-w-2xl sm:px-2 sm:leading-[1.55]">
          IA que sabe onde você está e te ajuda com tudo — de banco a
          restaurante brasileiro, de remessa a pré-natal.{" "}
          <span className="whitespace-nowrap">Em português,</span> do jeitinho
          certo.
        </Lead>

        <div className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Link
            to="/login"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
          >
            Começar grátis
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex h-13 items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Ver como funciona
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Numbers ---------------- */
const STATS = [
  { value: "4.5M+", label: "Brasileiros no exterior" },
  { value: "6", label: "Categorias de busca" },
  { value: "R$0", label: "Para começar" },
  { value: "100%", label: "Em português" },
];

function Numbers() {
  return (
    <section className="border-y border-white/5 bg-[#111111]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 py-14 sm:gap-y-10 sm:px-6 sm:py-14 lg:grid-cols-4 lg:gap-0 lg:px-8 lg:py-20">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={
              "flex flex-col items-center text-center lg:px-6 " +
              (i > 0 ? "lg:border-l lg:border-white/5" : "")
            }
          >
            <p
              data-numeric
              className="font-display text-[40px] leading-none text-primary sm:text-6xl lg:text-7xl"
            >
              {stat.value}
            </p>
            <p className="mt-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:mt-2 sm:text-[11px]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Mobile-only carousel helper: carousel on mobile, plain grid on lg+ */
function MobileCarousel<T>({
  items,
  renderItem,
  desktopClassName,
  itemBasis = "basis-[85%] sm:basis-[60%]",
}: {
  items: ReadonlyArray<T>;
  renderItem: (item: T, index: number) => React.ReactNode;
  desktopClassName: string;
  itemBasis?: string;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setCurrent(api.selectedScrollSnap());
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
    };
  }, [api]);

  return (
    <>
      <div className="lg:hidden">
        <Carousel
          setApi={setApi}
          opts={{ align: "start", dragFree: false }}
          className="-mx-5 sm:-mx-6"
        >
          <CarouselContent className="-ml-3 items-stretch px-5 sm:px-6">
            {items.map((item, i) => (
              <CarouselItem key={i} className={`pl-3 ${itemBasis} h-auto`}>
                <div className="h-full">{renderItem(item, i)}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="mt-6 flex items-center justify-center gap-4 px-5 sm:px-6">
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={() => api?.scrollPrev()}
            disabled={!canPrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir para slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={
                  "h-1.5 rounded-full transition-all " +
                  (current === i
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-white/20 hover:bg-white/40")
                }
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Próximo slide"
            onClick={() => api?.scrollNext()}
            disabled={!canNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={`hidden lg:grid ${desktopClassName}`}>
        {items.map((item, i) => (
          <div key={i} className="contents">{renderItem(item, i)}</div>
        ))}
      </div>
    </>
  );
}

/* ---------------- How it works ---------------- */
const STEPS = [
  {
    n: "01",
    icon: MapPin,
    title: "Diga onde você está",
    desc: "O app detecta sua localização automaticamente e ajusta tudo para o seu país e cidade.",
  },
  {
    n: "02",
    icon: MessageCircle,
    title: "Pergunte o que quiser",
    desc: "Em português mesmo. A IA entende e busca o que você precisa — de médico a banco.",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Receba resultados reais",
    desc: "Lugares próximos em cards, com distância, horário e botão para abrir no mapa.",
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <SectionHeader eyebrow="Como funciona" title="Como o DEZRAIZ funciona" />
        <div className="mt-8 sm:mt-14">
          <MobileCarousel
            items={STEPS}
            desktopClassName="gap-5 lg:grid-cols-3"
            renderItem={(step) => {
              const Icon = step.icon;
              return (
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1A] p-5 transition-colors hover:border-primary/40 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span
                      data-numeric
                      aria-hidden="true"
                      className="inline-flex h-11 items-center font-display text-[40px] leading-none text-primary/30 group-hover:text-primary/60 sm:h-auto sm:text-5xl"
                    >
                      {step.n}
                    </span>
                    <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                  </div>
                  <H3 className="mt-5 sm:mt-7">{step.title}</H3>
                  <Body className="mt-1.5 sm:mt-3">{step.desc}</Body>
                </div>
              );
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Categories ---------------- */
const CATEGORIES = [
  { icon: Home, title: "Moradia", desc: "Bairros baratos, aluguel sem histórico de crédito." },
  { icon: Utensils, title: "Restaurantes BR", desc: "Os mais próximos, avaliados por brasileiros." },
  { icon: Car, title: "Aluguel de carro", desc: "Locadoras que aceitam CNH brasileira." },
  { icon: Send, title: "Remessas", desc: "Compare taxas e envie mais barato para o Brasil." },
  { icon: Landmark, title: "Conta bancária", desc: "Bancos que abrem sem SSN ou NIF." },
  { icon: HeartPulse, title: "Saúde", desc: "Médicos, clínicas e pré-natal próximos." },
];

function Categories() {
  return (
    <section id="categorias" className="border-t border-white/5 bg-[#0F0F0F]">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <SectionHeader eyebrow="O que você encontra" title="Tudo que você precisa" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="group rounded-2xl border border-white/10 bg-[#1A1A1A] p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-[#1F1F1F] sm:p-6"
              >
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:h-12 sm:w-12">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
                </span>
                <H3 className="mt-5 text-lg sm:mt-5 sm:text-xl lg:text-2xl">
                  {cat.title}
                </H3>
                <Body className="mt-1.5 text-[13px] leading-[1.5] sm:mt-2 sm:text-xs lg:text-sm">
                  {cat.desc}
                </Body>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Plans ---------------- */
const PLANS = [
  {
    name: "Livre",
    price: "R$0",
    period: "",
    tagline: "Para começar",
    features: [
      "IA com geolocalização (10 perguntas/mês)",
      "Search Cards com Maps (5 buscas/mês)",
      "Clarification Menu ativo",
      "Checklist básico do país",
      "Comparador de remessas (visualização)",
      "Newsletter semanal",
    ],
    highlight: false,
  },
  {
    name: "Raízes",
    price: "R$49",
    period: "/mês",
    tagline: "Para quem usa todo dia",
    features: [
      "IA ilimitada com geolocalização",
      "Search Cards com Maps (70 buscas/mês)",
      "Foto real + rota + horário nos cards",
      "Checklist completo e interativo",
      "Comparador de remessas em tempo real",
      "Módulo gestante completo",
      "Newsletter localizada por país",
      "Guia de crédito local por país",
      "Acesso a parceiros com desconto",
    ],
    highlight: true,
  },
  {
    name: "Terra",
    price: "R$99",
    period: "/mês",
    tagline: "Sem limites",
    features: [
      "Tudo do plano Raízes",
      "170 buscas Maps/mês (vs 70 do Raízes)",
      "IA com histórico completo de conversas",
      "Alertas de câmbio personalizados",
      "Badge \"Membro Terra\" na comunidade",
      "Acesso antecipado a funcionalidades beta",
      "Suporte prioritário via chat",
    ],
    highlight: false,
  },
];

function Plans() {
  const renderPlan = (plan: typeof PLANS[number]) => (
    <div
      className={
        "relative flex h-full flex-col rounded-2xl border p-5 transition-colors sm:p-7 " +
        (plan.highlight
          ? "border-primary bg-gradient-to-b from-primary/15 to-[#1A1A1A] shadow-[0_0_60px_-15px_rgba(34,197,94,0.4)]"
          : "border-white/10 bg-[#1A1A1A] hover:border-white/20")
      }
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 inline-flex h-7 -translate-x-1/2 items-center justify-center rounded-full bg-primary px-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-foreground">
          Mais popular
        </span>
      )}
      <H3 className="text-2xl sm:text-3xl">{plan.name}</H3>
      <Eyebrow className="mt-1.5 tracking-wider text-muted-foreground sm:text-xs">
        {plan.tagline}
      </Eyebrow>
      <div className="mt-5 flex items-baseline gap-1 sm:mt-6">
        <span data-numeric className="font-display text-[40px] leading-none text-foreground sm:text-5xl">
          {plan.price}
        </span>
        {plan.period && (
          <span className="text-sm text-muted-foreground">{plan.period}</span>
        )}
      </div>
      <ul className="mt-5 flex-1 space-y-3 text-sm sm:mt-7 sm:space-y-3 sm:text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-muted-foreground">
            <span className="mt-[3px] inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check className="h-3 w-3" strokeWidth={2.6} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section className="bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <SectionHeader eyebrow="Planos" title="Escolha seu plano" />
        <div className="mt-8 sm:mt-14">
          <MobileCarousel
            items={PLANS}
            desktopClassName="gap-5 lg:grid-cols-3"
            itemBasis="basis-[88%] sm:basis-[60%]"
            renderItem={renderPlan}
          />
        </div>
        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            to="/planos"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary sm:px-7"
          >
            Ver todos os planos
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */
function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/5">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-primary/25 via-[#0A0A0A] to-[#0A0A0A]"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[140px]"
      />
      <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <H2 className="text-4xl leading-[0.95] sm:text-7xl lg:text-8xl">
          Comece hoje, <span className="text-primary">grátis</span>
        </H2>
        <Lead className="mx-auto mt-5 max-w-xl px-2 sm:mt-6">
          Comece grátis, sem precisar de cartão.
        </Lead>
        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            to="/login"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)] transition-opacity hover:opacity-90 sm:h-14 sm:px-8"
          >
            Criar conta gratuita
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#0A0A0A]">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Logo size={26} />
        <nav className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Link to="/planos" className="hover:text-foreground">Planos</Link>
          <a href="#como-funciona" className="hover:text-foreground">Sobre</a>
          <a href="mailto:contato@dezraiz.com" className="hover:text-foreground">Contato</a>
        </nav>
        <p className="text-[11px] text-muted-foreground">
          © 2025 DEZRAIZ · Feito para brasileiros no mundo
        </p>
      </div>
    </footer>
  );
}

/* ---------------- Shared ---------------- */
function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <H2 className="mt-2.5 sm:mt-3">{title}</H2>
    </div>
  );
}
