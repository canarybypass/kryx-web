"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { PHASES } from "@/lib/content";
import { useActivePhase } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import Logo from "./primitives/Logo";

export default function Navbar() {
  const { locale, toggle, t } = useI18n();
  const active = useActivePhase();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [appOpen, setAppOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  const phase = PHASES[active];

  return (
    <>
      {/* Full-screen app overlay */}
      {appOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#080810", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "0 20px", height: 48, borderBottom: "1px solid #1a1a2e", flexShrink: 0 }}>
            <button
              onClick={() => setAppOpen(false)}
              style={{ background: "none", border: "none", color: "#46E5FF", cursor: "pointer", fontFamily: "monospace", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
            >
              ← back to site
            </button>
            <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 11, color: "#3a3a5a", letterSpacing: "0.2em" }}>KRYX // SCAN CONSOLE</span>
          </div>
          <iframe
            src="/app"
            style={{ flex: 1, border: "none", width: "100%" }}
            title="Kryx App"
          />
        </div>
      )}

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 w-full max-w-stage items-center justify-between px-5 sm:px-8">
          <Logo />

          {/* live phase indicator — center */}
          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-2.5 md:flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
              {t.nav.phaseWord}
            </span>
            <span className="h-3 w-px bg-line-strong" />
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
              <span className="tabular-nums text-ink-dim">{phase.index}</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={phase.code}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  {phase.code}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>

          {/* actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={toggle}
              className="rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim transition-colors hover:border-line-strong hover:text-ink"
              aria-label="Toggle language"
            >
              <span className={locale === "en" ? "text-ink" : ""}>EN</span>
              <span className="mx-1 text-ink-ghost">/</span>
              <span className={locale === "ru" ? "text-ink" : ""}>RU</span>
            </button>

            <button
              onClick={() => setAppOpen(true)}
              className="hidden rounded-md px-3 py-1.5 font-mono text-[12px] text-ink-dim transition-colors hover:text-ink sm:inline-block"
            >
              {t.nav.launch}
            </button>

            <button
              onClick={() => setAppOpen(true)}
              className="group relative rounded-md border border-accent-line bg-accent-soft px-3.5 py-1.5 font-mono text-[12px] text-accent transition-all hover:bg-accent/20"
            >
              {t.nav.request}
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}
