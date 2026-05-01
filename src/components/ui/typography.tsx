import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Typography primitives — escala única responsiva (mobile-first).
 *
 * Use estes componentes para qualquer texto editorial dentro de páginas
 * de marketing/conteúdo (landing, planos, etc). Garantem ritmo, hierarquia
 * e tamanhos consistentes entre seções e cards, sem repetir classes
 * arbitrárias em cada lugar.
 *
 *   <Eyebrow>Como funciona</Eyebrow>
 *   <H2>Como o DEZRAIZ funciona</H2>
 *   <Lead>IA que sabe onde você está...</Lead>
 *
 *   <H3>Diga onde você está</H3>
 *   <Body>O app detecta sua localização...</Body>
 */

type TextProps<E extends React.ElementType> = {
  as?: E;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<E>, "as" | "className" | "children">;

/* Pequena label maiúscula acima de títulos de seção. */
export function Eyebrow<E extends React.ElementType = "p">({
  as,
  className,
  ...props
}: TextProps<E>) {
  const Comp = (as ?? "p") as React.ElementType;
  return (
    <Comp
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.2em] text-primary",
        className,
      )}
      {...props}
    />
  );
}

/* Título de seção (h2). 32px no mobile, escala no desktop. */
export function H2<E extends React.ElementType = "h2">({
  as,
  className,
  ...props
}: TextProps<E>) {
  const Comp = (as ?? "h2") as React.ElementType;
  return (
    <Comp
      className={cn(
        "font-display text-[32px] leading-[1.05] text-foreground sm:text-5xl lg:text-6xl",
        className,
      )}
      {...props}
    />
  );
}

/* Título de card / sub-seção (h3). 20px no mobile. */
export function H3<E extends React.ElementType = "h3">({
  as,
  className,
  ...props
}: TextProps<E>) {
  const Comp = (as ?? "h3") as React.ElementType;
  return (
    <Comp
      className={cn(
        "font-display text-xl leading-tight text-foreground sm:text-2xl lg:text-3xl",
        className,
      )}
      {...props}
    />
  );
}

/* Texto corrido padrão (descrições de cards, parágrafos). */
export function Body<E extends React.ElementType = "p">({
  as,
  className,
  ...props
}: TextProps<E>) {
  const Comp = (as ?? "p") as React.ElementType;
  return (
    <Comp
      className={cn(
        "text-sm leading-[1.55] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/* Texto introdutório maior (logo abaixo do H1/H2 do hero). */
export function Lead<E extends React.ElementType = "p">({
  as,
  className,
  ...props
}: TextProps<E>) {
  const Comp = (as ?? "p") as React.ElementType;
  return (
    <Comp
      className={cn(
        "text-[15px] leading-[1.55] text-muted-foreground sm:text-base",
        className,
      )}
      {...props}
    />
  );
}
