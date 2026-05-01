import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Button — single source of truth for all button styles in the app.
 *
 * Variants: primary | secondary | ghost | outline | destructive | link
 * Sizes:    sm (h-9) | md (h-11, default) | lg (h-12) | icon
 * States:   hover, active (scale), focus-visible (green ring), disabled, loading
 *
 * The legacy variant `default` is kept as an alias for `primary` so existing
 * call-sites keep working while the rest of the app migrates.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-full text-sm font-medium",
    "transition-all duration-150 ease-out",
    "active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-green-500)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-green-500)] text-white hover:bg-[var(--color-green-600)] shadow-[var(--shadow-elev-1)]",
        default:
          "bg-[var(--color-green-500)] text-white hover:bg-[var(--color-green-600)] shadow-[var(--shadow-elev-1)]",
        secondary:
          "bg-[var(--color-zinc-100)] text-[var(--color-zinc-900)] hover:bg-[var(--color-zinc-200)]",
        ghost:
          "bg-transparent text-[var(--color-zinc-700)] hover:bg-[var(--color-zinc-100)]",
        outline:
          "border border-[var(--color-zinc-200)] bg-card text-[var(--color-zinc-900)] hover:bg-[var(--color-zinc-50)]",
        destructive:
          "bg-[var(--color-state-error)] text-white hover:brightness-95 shadow-[var(--shadow-elev-1)]",
        link: "text-[var(--color-green-600)] underline-offset-4 hover:underline rounded-none active:scale-100",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        default: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="animate-spin" aria-hidden />
            <span className="sr-only">Carregando…</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
