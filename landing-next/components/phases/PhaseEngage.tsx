"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import PhaseShell from "../primitives/PhaseShell";
import Reveal from "../primitives/Reveal";
import Typewriter from "../primitives/Typewriter";

export default function PhaseEngage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setError(true);
      return;
    }
    setError(false);
    setSent(true);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 scanfield opacity-40 radial-fade" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
        style={{ background: "radial-gradient(circle, rgba(70,229,255,0.08) 0%, transparent 60%)" }}
      />

      <PhaseShell id="engage" className="relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          {/* closing command — frame closes */}
          <Reveal>
            <div className="mx-auto inline-flex items-center gap-3 rounded-lg border border-line bg-panel/80 px-4 py-3 font-mono text-[13px] backdrop-blur-sm">
              <span className="text-accent">$</span>
              <span className="text-ink">
                <Typewriter text="kryx engage --target you.app" startDelay={400} />
              </span>
            </div>
          </Reveal>

          <h2 className="display mt-9 text-balance text-4xl text-ink sm:text-5xl">{t.engage.title}</h2>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-dim">{t.engage.body}</p>
          </Reveal>

          {/* form */}
          <Reveal delay={0.16}>
            <div className="mx-auto mt-9 max-w-md">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2.5 rounded-xl border border-good/40 bg-good/10 px-5 py-4 font-mono text-[13px] text-good"
                  >
                    <Check size={16} strokeWidth={2.5} />
                    {t.engage.success}
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={onSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-col gap-2.5 sm:flex-row"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(false);
                      }}
                      placeholder={t.engage.placeholder}
                      aria-label={t.engage.placeholder}
                      aria-invalid={error}
                      className={`min-w-0 flex-1 rounded-lg border bg-panel px-4 py-3 font-mono text-[13px] text-ink placeholder:text-ink-faint transition-colors focus:outline-none ${
                        error ? "border-danger" : "border-line focus:border-accent-line"
                      }`}
                    />
                    <button
                      type="submit"
                      className="group flex items-center justify-center gap-2 rounded-lg border border-accent-line bg-accent px-5 py-3 font-mono text-[13px] text-bg transition-all hover:bg-accent/90"
                    >
                      {t.engage.cta}
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
              <p className="mt-3.5 font-mono text-[11px] text-ink-faint">{t.engage.note}</p>
            </div>
          </Reveal>
        </div>
      </PhaseShell>
    </div>
  );
}
