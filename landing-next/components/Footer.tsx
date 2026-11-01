"use client";

import { useI18n } from "@/lib/i18n";
import Logo from "./primitives/Logo";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto w-full max-w-stage px-5 py-14 sm:px-8 lg:pl-28 lg:pr-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-ink-dim">{t.footer.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {t.footer.columns.map((col) => (
              <div key={col.title}>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[13.5px] text-ink-dim transition-colors hover:text-accent"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 font-mono text-[11px] text-ink-faint sm:flex-row sm:items-center">
          <span>{t.footer.legal}</span>
          <span className="flex items-center gap-2 text-ink-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
            {t.footer.disclaimer}
          </span>
        </div>
      </div>
    </footer>
  );
}
