import { lazy, Suspense, useEffect, useState } from "react";

// The CommandPalette pulls in cmdk + a handful of lucide icons + the Command
// UI primitives. It's only needed when the user actually presses ⌘K/Ctrl+K,
// so we keep it out of the initial bundle and mount it on first invocation.
const CommandPalette = lazy(() =>
  import("@/components/CommandPalette").then((m) => ({
    default: m.CommandPalette,
  })),
);

/**
 * Mounts CommandPalette only after the first ⌘K / Ctrl+K keystroke.
 * The keyboard listener is tiny and runs globally; the heavy component code
 * only loads when needed, cutting the initial JS on every page.
 */
export function LazyCommandPalette() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key === "k" || e.key === "K";
      if (isK && (e.metaKey || e.ctrlKey)) {
        setMounted(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted]);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <CommandPalette />
    </Suspense>
  );
}
