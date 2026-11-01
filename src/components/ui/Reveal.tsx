"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "@/lib/motion";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "span";
};

/** Scroll-reveal wrapper: fade + rise, respects reduced-motion via viewport. */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
  as = "div",
}: Props) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE.outExpo }}
    >
      {children}
    </MotionTag>
  );
}
