/**
 * Logo DEZRAIZ — wordmark Inter bold com o "RAIZ" em verde.
 */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span
      className="select-none font-display leading-none"
      style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.03em" }}
    >
      <span className="text-[var(--color-foreground)]">DEZ</span>
      <span className="text-[var(--color-primary)]">RAIZ</span>
    </span>
  );
}
