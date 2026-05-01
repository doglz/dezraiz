import { cn } from "@/lib/utils";

/**
 * Skeleton — base loading placeholder.
 * Uses the shimmer keyframes defined in src/styles.css (.skeleton-shimmer)
 * so every loading state across the app feels like the same design system.
 *
 * Respects prefers-reduced-motion (handled globally in styles.css).
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn("skeleton-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
