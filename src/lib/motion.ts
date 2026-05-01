/**
 * DEZRAIZ motion system.
 *
 * Centralized variants and durations so every transition feels like part of
 * the same product (Linear / Vercel / Mercury cadence).
 *
 * Principles:
 *  - Every animation has a purpose (feedback, continuity, hierarchy).
 *  - Micro 100–150ms (hover/active), short 200–300ms (entries),
 *    medium 300–500ms (page transitions). Never above 500ms except specials.
 *  - Springs only on physical interactions (drag, dismiss, pill highlights).
 *  - Reduced motion ALWAYS collapses transforms — opacity-only fallback.
 */
import type { Transition, Variants } from "framer-motion";

/* Easings — cubic-bezier strings for both Framer and CSS. */
const EASE_OUT_EXPRESSIVE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Page enter — opacity 0→1 + translateY 4→0, 140ms. */
export function pageVariants(reduceMotion: boolean): Variants {
  return {
    initial: { opacity: 0, y: reduceMotion ? 0 : 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduceMotion ? 0 : -2 },
  };
}

export function pageTransition(reduceMotion: boolean): Transition {
  return {
    duration: reduceMotion ? 0 : 0.14,
    ease: EASE_OUT_EXPRESSIVE,
  };
}

/** Stagger container — 40ms between children. */
export function staggerContainer(reduceMotion: boolean): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.04,
        delayChildren: reduceMotion ? 0 : 0.05,
      },
    },
  };
}

/** Stagger child — soft fade + 6px lift. */
export function staggerItem(reduceMotion: boolean): Variants {
  return {
    initial: { opacity: 0, y: reduceMotion ? 0 : 6 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.28, ease: EASE_OUT_EXPRESSIVE },
    },
  };
}


/** Spring for physical highlights (sidebar pill, tab indicator). */
export const SPRING_PILL: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.6,
};
