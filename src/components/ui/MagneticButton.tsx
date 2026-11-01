"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "motion/react";

type Variant = "primary" | "ghost";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-tight transition-colors duration-300 will-change-transform";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-bg-0 hover:bg-[color-mix(in_srgb,var(--color-accent)_85%,white)]",
  ghost:
    "border border-line text-text hover:border-[color-mix(in_srgb,var(--color-accent)_60%,var(--color-line))] hover:text-accent",
};

export default function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  external,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.3;
    const y = (e.clientY - r.top - r.height / 2) * 0.4;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  const content = (
    <motion.span
      whileTap={{ scale: 0.96 }}
      className={`${base} ${variants[variant]} w-full`}
      style={{ transition: "transform 0.35s var(--ease-out-expo)" }}
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        aria-label={ariaLabel}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        data-cursor
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={`inline-block will-change-transform ${className}`}
        style={{ transition: "transform 0.35s var(--ease-out-expo)" }}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-cursor
      className={`inline-block will-change-transform ${className}`}
      style={{ transition: "transform 0.35s var(--ease-out-expo)" }}
    >
      {content}
    </button>
  );
}
