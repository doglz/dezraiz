import { motion, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { pageTransition, pageVariants } from "@/lib/motion";

export function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      variants={pageVariants(reduceMotion)}
      transition={pageTransition(reduceMotion)}
      style={{ willChange: "opacity" }}
      onAnimationComplete={() => {
        if (ref.current) {
          ref.current.style.transform = "none";
          ref.current.style.willChange = "auto";
        }
      }}
    >
      {children}
    </motion.div>
  );
}
