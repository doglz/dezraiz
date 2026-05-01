import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Card — single source of truth for surface containers.
 *
 * variants:
 *  - default:  white bg + zinc border (flat)
 *  - elevated: white bg + layered shadow (no border)
 *  - dark:     near-black bg + white text
 *  - accent:   brand green bg + white text
 *
 * Add `interactive` to opt into the hover lift (-translate-y-0.5 + elev-2).
 *
 * Backwards-compat: <Card> with no variant keeps the existing look.
 */
const cardVariants = cva("rounded-xl text-card-foreground transition-all duration-200 ease-out", {
  variants: {
    variant: {
      default: "bg-card border border-[var(--color-zinc-200)]",
      elevated: "bg-card shadow-[var(--shadow-elev-1)]",
      dark: "bg-[var(--color-zinc-950)] text-white",
      accent: "bg-[var(--color-green-500)] text-white",
    },
    padded: {
      true: "p-6",
      false: "",
    },
    interactive: {
      true: "cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-elev-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-green-500)]/40 focus-visible:ring-offset-2",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    padded: false,
    interactive: false,
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padded, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padded, interactive }), className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
