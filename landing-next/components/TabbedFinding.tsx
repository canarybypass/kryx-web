"use client";

import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShieldCheck, Terminal as TermIcon, Code2 } from "lucide-react";
import { OPERATION } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import Terminal from "./primitives/Terminal";

type TabKey = "evidence" | "exploit" | "remediation";

const { finding } = OPERATION;

const KW = /(POST|GET|HTTP\/1\.1|Host|Content-Type|UNION|SELECT|FROM|AND|OR|SLEEP|NULL|WHERE)/g;
const KEYWORDS = new Set([
  "POST", "GET", "HTTP/1.1", "Host", "Content-Type",
  "UNION", "SELECT", "FROM", "AND", "OR", "SLEEP", "NULL", "WHERE",
]);

/** Light, intentional highlighting for the exploit request/SQL. */
function highlight(line: string) {
  const parts = line.split(KW);
  return parts.map((part, i) =>
    KEYWORDS.has(part) ? (
      <span key={i} className="text-accent">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export default function TabbedFinding() {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabKey>("evidence");

  const tabs: { key: TabKey; label: string; icon: typeof TermIcon }[] = [
    { key: "evidence", label: t.contact.tabs.evidence, icon: TermIcon },
    { key: "exploit", label: t.contact.tabs.exploit, icon: Code2 },
    { key: "remediation", label: t.contact.tabs.remediation, icon: ShieldCheck },
  ];

  return (
    <div className="panel overflow-hidden">
      {/* finding header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line bg-black/20 p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[11px] text-ink-faint">{finding.id}</span>
            <span className="rounded border border-danger/40 bg-danger/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-danger">
              {finding.severity}
            </span>
          </div>
          <h3 className="display mt-2 text-2xl text-ink sm:text-[1.7rem]">{finding.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[12px] text-ink-dim">
            <span className="text-accent">{finding.endpoint}</span>
            <span>
              {t.contact.paramLabel}: <span className="text-ink">{finding.param}</span>
            </span>
          </div>
        </div>
        <div className="text-right font-mono text-[11px] text-ink-faint">
          <div>
            CVSS <span className="text-danger">{finding.cvss}</span>
          </div>
          <div className="mt-1">{finding.cwe}</div>
        </div>
      </div>

      {/* tabs */}
      <div role="tablist" aria-label="Finding detail" className="flex gap-1 border-b border-line px-3 pt-3">
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={`relative flex items-center gap-2 rounded-t-md px-3.5 py-2.5 font-mono text-[12px] transition-colors sm:px-4 ${
                active ? "text-accent" : "text-ink-dim hover:text-ink"
              }`}
            >
              <Icon size={13} strokeWidth={2} />
              {label}
              {active && (
                <motion.span
                  layoutId="finding-tab"
                  className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-accent shadow-[0_0_8px_1px_rgba(70,229,255,0.6)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* content */}
      <div className="min-h-[340px] p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === "evidence" && (
              <Terminal
                lines={finding.evidence}
                typing
                title={`replay · ${finding.id}`}
                status="live"
                speed={12}
              />
            )}

            {tab === "exploit" && (
              <div className="panel-2 overflow-hidden">
                <div className="flex items-center justify-between border-b border-line bg-black/20 px-4 py-2 font-mono text-[11px] text-ink-faint">
                  <span>request.http</span>
                  <span className="text-danger">unauthenticated</span>
                </div>
                <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-relaxed text-ink-dim">
                  {finding.exploit.map((row, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="w-4 shrink-0 select-none text-right text-ink-ghost">
                        {row.ln === "" ? "" : i + 1}
                      </span>
                      <span className="whitespace-pre">{highlight(row.ln)}</span>
                    </div>
                  ))}
                </pre>
                <div className="border-t border-line px-4 py-2.5 font-mono text-[11px] text-ink-faint">
                  <span className="text-ink-ghost">{"// "}</span>
                  {finding.exploitNote}
                </div>
              </div>
            )}

            {tab === "remediation" && (
              <ul className="space-y-3">
                {t.contact.remediation.map((fix, i) => (
                  <li key={i} className="panel-2 flex items-start gap-3 px-4 py-3.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-good/40 bg-good/10 text-good">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-ink-dim">{fix}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
