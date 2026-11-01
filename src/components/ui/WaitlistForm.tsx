"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useT } from "@/lib/i18n";

/**
 * Waitlist capture. Front-end only — no backend wired yet (domain is
 * "coming soon"). Swap the onSubmit body for a real endpoint later.
 */
export default function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const t = useT();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    if (!valid) {
      setState("error");
      return;
    }
    // Capture the lead via FormSubmit (no backend needed). First submission
    // triggers a one-time activation email to the owner — confirm it once.
    try {
      const res = await fetch("https://formsubmit.co/ajax/d28362242@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email,
          _subject: "Kryx — waitlist / access request",
          _template: "table",
        }),
      });
      if (!res.ok) throw new Error("send failed");
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className={compact ? "w-full max-w-md" : "w-full max-w-lg"}>
      <AnimatePresence mode="wait">
        {state === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-full border border-accent/40 bg-accent/5 px-5 py-3.5"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-bg-0">
              ✓
            </span>
            <span className="font-mono text-sm text-text">{t.waitlist.done}</span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={submit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="waitlist-email" className="sr-only">
              {t.waitlist.placeholder}
            </label>
            <input
              id="waitlist-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state === "error") setState("idle");
              }}
              placeholder={t.waitlist.placeholder}
              aria-invalid={state === "error"}
              className={`flex-1 rounded-full border bg-bg-1/70 px-5 py-3.5 font-mono text-sm text-text placeholder:text-muted focus:outline-none focus-visible:border-accent ${
                state === "error" ? "border-danger" : "border-line"
              }`}
            />
            <button
              type="submit"
              data-cursor
              className="rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-bg-0 transition-colors hover:bg-[color-mix(in_srgb,var(--color-accent)_85%,white)]"
            >
              {t.waitlist.button}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      <p className="mt-3 px-1 font-mono text-[11px] text-muted">
        {state === "error" ? t.waitlist.errorEmail : t.waitlist.note}
      </p>
    </div>
  );
}
