"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin accent progress bar pinned to the top of the viewport. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[100] h-px origin-left bg-gradient-to-r from-accent via-accent-2 to-accent"
    />
  );
}
