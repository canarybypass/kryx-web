"use client";

import { MotionConfig } from "motion/react";

/** Makes every Framer Motion animation honour prefers-reduced-motion. */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
