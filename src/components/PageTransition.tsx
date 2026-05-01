import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { pageTransition, pageVariants } from "@/lib/motion";

/**
 * PageTransition — wraps a route's content with the standard enter animation
 * (opacity 0→1 + y 8→0, 250ms, ease-out-expressive). Respects prefers-reduced-motion.
 *
 * Use once per route, around the top-level content of the page.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageVariants(reduceMotion)}
      transition={pageTransition(reduceMotion)}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
