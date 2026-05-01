import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * EmptyState — centralized, brand-aligned empty/error/zero-data layout.
 *
 * Variants:
 *  - default  → neutral zinc, used for "nothing yet" states
 *  - success  → soft green, used for celebrations ("tudo em dia!")
 *  - error    → soft red, used for runtime errors and 404
 *
 * Composes with the design system tokens (no hardcoded colors).
 */
export interface EmptyStateProps {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  variant?: "default" | "success" | "error";
  className?: string;
}

const VARIANT_STYLES: Record<
  NonNullable<EmptyStateProps["variant"]>,
  { wrapper: string; icon: string; eyebrow: string }
> = {
  default: {
    wrapper:
      "border-[var(--color-zinc-200)] bg-[var(--color-zinc-50)]",
    icon: "bg-card text-[var(--color-zinc-500)] ring-1 ring-[var(--color-zinc-200)]",
    eyebrow: "text-[var(--color-zinc-500)]",
  },
  success: {
    wrapper:
      "border-[var(--color-green-200)] bg-[var(--color-green-50)]",
    icon: "bg-card text-[var(--color-green-600)] ring-1 ring-[var(--color-green-200)]",
    eyebrow: "text-[var(--color-green-700)]",
  },
  error: {
    wrapper: "border-[var(--color-state-error)]/10 bg-[var(--color-state-error)]/5",
    icon: "bg-card text-[var(--color-state-error)] ring-1 ring-[var(--color-state-error)]/10",
    eyebrow: "text-[var(--color-state-error)]",
  },
};

export function EmptyState({
  icon,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = "default",
  className,
}: EmptyStateProps) {
  const styles = VARIANT_STYLES[variant];
  return (
    <div
      role="status"
      className={cn(
        "flex w-full flex-col items-center rounded-3xl border px-6 py-10 text-center sm:py-14",
        styles.wrapper,
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl",
            styles.icon,
          )}
          aria-hidden
        >
          {icon}
        </div>
      )}
      {eyebrow && (
        <p
          className={cn(
            "mb-2 text-xs font-semibold uppercase tracking-wider",
            styles.eyebrow,
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="max-w-md text-xl font-semibold tracking-tight text-[var(--color-zinc-900)] sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[var(--color-zinc-600)] sm:text-base">
          {description}
        </p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
