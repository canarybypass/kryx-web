import { useState, useEffect, useRef } from "react";

const PHASES = [
  { idx: "00", code: "ENTRY",   desc: "Target acquired" },
  { idx: "01", code: "RECON",   desc: "Surface mapped" },
  { idx: "02", code: "SWARM",   desc: "8 hunters deployed" },
  { idx: "03", code: "CHAIN",   desc: "Attack chained" },
  { idx: "04", code: "PROVEN",  desc: "RCE confirmed" },
  { idx: "05", code: "REPORT",  desc: "Full chain delivered" },
];

const FEATURES = [
  { title: "CVE Intelligence", body: "Auto-matches your stack against 15+ critical CVEs — Log4Shell, Spring4Shell, ProxyLogon — and tests each one live." },
  { title: "Multi-Agent Swarm", body: "8 hunters run in parallel: injection, auth bypass, CORS, SSRF, upload, deserialization, business logic, CVE." },
  { title: "Real RCE Proof", body: "Doesn't stop at `{{7*7}}`. Escalates SSTI and CMDi to actual `id` / `whoami` output. Execution, not detection." },
  { title: "Kill Chain Builder", body: "Combines individual findings into multi-step attack paths with CVSS, reproduction steps, and fix recommendations." },
  { title: "Adversarial Debate", body: "Attacker and defender LLMs challenge each finding before it reaches the report. No false positives in the chain." },
  { title: "Live Terminal", body: "Watch the agent think and act in real time via WebSocket stream. Every step, every payload, every response." },
];

const PLANS = [
  { name: "STARTER", price: "$99", sub: "/mo", quota: "10 scans / month", features: ["Full hunter suite","CVE intel","PDF + JSON report","7-day history","Web targets"] },
  { name: "PRO",     price: "$499", sub: "/mo", quota: "100 scans / month", features: ["Everything in Starter","RCE escalation","Attack chain builder","API access","30-day history"], featured: true },
  { name: "APT",     price: "$2,999", sub: "/mo", quota: "Unlimited",        features: ["Everything in Pro","Custom integrations","Priority SLA","Dedicated support","1-year history"] },
];

function useInterval(cb, ms) {
  const ref = useRef(cb);
  useEffect(() => { ref.current = cb; });
  useEffect(() => { const t = setInterval(() => ref.current(), ms); return () => clearInterval(t); }, [ms]);
}

function Typewriter({ text }) {
  const [i, setI] = useState(0);
  useEffect(() => { setI(0); }, [text]);
  useInterval(() => setI(p => Math.min(p + 1, text.length)), 38);
  return <>{text.slice(0, i)}<span style={{ opacity: i < text.length ? 1 : (Date.now() % 1000 < 500 ? 1 : 0) }}>█</span></>;
}

export default function LandingPage({ onEnter }) {
  const [phase, setPhase]   = useState(0);
  const [sticky, setSticky] = useState(false);
  const pricingRef = useRef(null);

  useInterval(() => setPhase(p => (p + 1) % PHASES.length), 2400);
  useEffect(() => {
    const fn = () => setSticky(window.scrollY > 32);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = ref => ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={css.root}>
      <style>{GLOBAL_CSS}</style>

      {/* ── NAV ── */}
      <header style={{ ...css.nav, ...(sticky ? css.navSticky : {}) }}>
        <div style={css.navInner}>
          <span style={css.logo}><span style={{ color: C.accent }}>◉</span> KRYX</span>
          <div style={css.phaseBar}>
            <span style={css.phaseLabelDim}>PHASE</span>
            <span style={css.divider} />
            <span style={{ ...css.phaseCode, color: C.accent }}>
              <span style={{ ...css.dot, background: C.accent, boxShadow: `0 0 6px ${C.accent}` }} />
              {PHASES[phase].idx} · {PHASES[phase].code}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => scrollTo(pricingRef)} style={css.btnGhost}>Plans</button>
            <button onClick={onEnter} style={css.btnAccent}>Launch App →</button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={css.hero}>
        <div style={css.glow1} /><div style={css.glow2} />
        <div style={css.heroInner}>
          <div style={css.eyebrow}>AUTONOMOUS OFFENSIVE SECURITY AGENT</div>
          <h1 style={css.h1}>
            Security that<br />
            <em style={{ color: C.accent, fontStyle: "normal" }}>proves itself.</em>
          </h1>
          <p style={css.lead}>
            Kryx deploys a swarm of AI hunters, chains every finding into kill paths,
            and delivers RCE proof — not just alerts.
          </p>
          <div style={css.terminal}>
            <span style={{ color: "#3a5a6a" }}>~/</span>
            <span style={{ color: C.accent }}> $ </span>
            <span style={{ color: "#c8d8e0" }}>
              <Typewriter text="kryx engage --target https://target.com --depth full --rce" />
            </span>
          </div>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onEnter} style={{ ...css.btnAccent, padding: "13px 32px", fontSize: 14 }}>
              Start scanning →
            </button>
            <button onClick={() => scrollTo(pricingRef)} style={{ ...css.btnGhost, padding: "13px 28px", fontSize: 14 }}>
              See plans
            </button>
          </div>
          <div style={css.statsRow}>
            {[["15+","CVE modules"],["8","parallel hunters"],["100%","exec proof"],["RCE","confirmed"]].map(([n,l])=>(
              <div key={l} style={css.stat}>
                <span style={css.statN}>{n}</span>
                <span style={css.statL}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHASES RAIL ── */}
      <section style={{ ...css.section, padding: "72px 24px" }}>
        <div style={css.inner}>
          <div style={css.label}>PIPELINE</div>
          <h2 style={css.h2}>One engagement. Full chain.</h2>
          <div style={css.rail}>
            {PHASES.map((p, i) => (
              <div key={p.code} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ ...css.railStep, ...(i === phase ? css.railStepActive : {}) }}>
                  <span style={{ fontFamily: "monospace", fontSize: 9, color: i === phase ? C.accent : "#3a3a5a", letterSpacing: "0.2em" }}>{p.idx}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: i === phase ? C.accent : "#4a4a6a", fontWeight: 600 }}>{p.code}</span>
                  <span style={{ fontSize: 10, color: "#3a3a5a" }}>{p.desc}</span>
                </div>
                {i < PHASES.length - 1 && <div style={css.connector} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ ...css.section, background: "#06060e" }}>
        <div style={css.inner}>
          <div style={css.label}>CAPABILITIES</div>
          <h2 style={css.h2}>How Kryx hunts</h2>
          <div style={css.grid}>
            {FEATURES.map(f => (
              <div key={f.title} style={css.card}>
                <span style={{ color: C.accent, fontSize: 18, marginBottom: 10, display: "block" }}>⬡</span>
                <div style={css.cardTitle}>{f.title}</div>
                <div style={css.cardBody}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section ref={pricingRef} style={css.section}>
        <div style={css.inner}>
          <div style={css.label}>ACCESS</div>
          <h2 style={css.h2}>Pick your operation</h2>
          <div style={css.plans}>
            {PLANS.map(p => (
              <div key={p.name} style={{ ...css.plan, ...(p.featured ? css.planFeatured : {}) }}>
                {p.featured && <div style={css.badge}>MOST POPULAR</div>}
                <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.3em", color: p.featured ? C.accent : "#4a4a6a", marginBottom: 16 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 38, fontWeight: 700, color: "#eef0f8" }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: "#4a4a6a" }}>{p.sub}</span>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: C.accent, marginBottom: 28 }}>{p.quota}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ fontSize: 13, color: "#6a6a8a", display: "flex", gap: 8 }}>
                      <span style={{ color: C.accent, fontSize: 9, marginTop: 3 }}>✦</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={onEnter} style={p.featured ? css.planBtnPrimary : css.planBtnSecondary}>
                  Get started →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENGAGE ── */}
      <section style={{ ...css.section, background: "#06060e", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px" }}>
          <div style={css.label}>ENGAGE</div>
          <h2 style={{ ...css.h2, fontSize: 36 }}>Ready to hunt?</h2>
          <p style={{ color: "#4a4a6a", marginBottom: 36, fontSize: 15, lineHeight: 1.7 }}>
            Register in 30 seconds. First scan is on us.
          </p>
          <button onClick={onEnter} style={{ ...css.btnAccent, padding: "15px 44px", fontSize: 15 }}>
            Create account →
          </button>
        </div>
      </section>

      <footer style={css.footer}>
        <span style={css.logo}><span style={{ color: C.accent }}>◉</span> KRYX</span>
        <span style={{ color: "#252535", fontSize: 12, fontFamily: "monospace" }}>Autonomous offensive security · 2026</span>
      </footer>
    </div>
  );
}

const C = { accent: "#46E5FF", bg: "#080810", card: "#0c0c18", border: "#14142a" };

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  html { scroll-behavior: smooth; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes drift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(8vw,6vh) scale(1.1)} }
  @keyframes drift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-6vw,8vh) scale(1.12)} }
`;

const css = {
  root: { background: C.bg, color: "#e0e0f0", fontFamily: "'Space Grotesk', -apple-system, sans-serif", overflowX: "hidden", minHeight: "100vh" },
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "background .35s, border-color .35s", borderBottom: "1px solid transparent" },
  navSticky: { background: "rgba(8,8,16,.9)", backdropFilter: "blur(18px)", borderColor: C.border },
  navInner: { maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 600, letterSpacing: "0.08em", color: "#e0e0f0" },
  phaseBar: { display: "flex", alignItems: "center", gap: 10, pointerEvents: "none" },
  phaseLabelDim: { fontFamily: "monospace", fontSize: 9, letterSpacing: "0.3em", color: "#2a2a4a", textTransform: "uppercase" },
  divider: { width: 1, height: 14, background: "#1a1a2e" },
  phaseCode: { fontFamily: "monospace", fontSize: 10, letterSpacing: "0.2em", display: "flex", alignItems: "center", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: "50%", display: "inline-block" },
  btnGhost: { background: "none", border: "1px solid #1a1a2e", color: "#6a6a9a", cursor: "pointer", fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", padding: "7px 16px", borderRadius: 6, transition: "border-color .2s,color .2s" },
  btnAccent: { background: C.accent, border: "none", color: "#05050f", cursor: "pointer", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, padding: "8px 18px", borderRadius: 6, transition: "opacity .2s", letterSpacing: "0.03em" },
  hero: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", paddingTop: 64 },
  glow1: { position: "absolute", width: "50vw", height: "50vw", left: "-8vw", top: "-10vh", borderRadius: "50%", background: `radial-gradient(circle, rgba(70,229,255,.1), transparent 65%)`, filter: "blur(60px)", animation: "drift1 26s ease-in-out infinite", pointerEvents: "none" },
  glow2: { position: "absolute", width: "42vw", height: "42vw", right: "-6vw", bottom: "-8vh", borderRadius: "50%", background: `radial-gradient(circle, rgba(233,69,96,.08), transparent 65%)`, filter: "blur(70px)", animation: "drift2 32s ease-in-out infinite", pointerEvents: "none" },
  heroInner: { position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px", maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 },
  eyebrow: { fontFamily: "monospace", fontSize: 9, letterSpacing: "0.35em", color: C.accent, opacity: .7 },
  h1: { fontSize: "clamp(40px,7vw,76px)", fontWeight: 700, lineHeight: 1.08, color: "#f0f0fc" },
  lead: { fontSize: "clamp(15px,2vw,18px)", color: "#5a5a8a", lineHeight: 1.75, maxWidth: 540 },
  terminal: { background: "#07070f", border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 22px", fontFamily: "monospace", fontSize: 13, textAlign: "left", width: "100%", maxWidth: 620 },
  statsRow: { display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center", paddingTop: 16 },
  stat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  statN: { fontSize: 22, fontWeight: 700, color: C.accent, fontFamily: "monospace" },
  statL: { fontSize: 10, color: "#3a3a5a", letterSpacing: "0.15em", textTransform: "uppercase" },
  section: { padding: "96px 24px" },
  inner: { maxWidth: 1160, margin: "0 auto" },
  label: { fontFamily: "monospace", fontSize: 9, letterSpacing: "0.3em", color: C.accent, opacity: .65, marginBottom: 14 },
  h2: { fontSize: "clamp(26px,4vw,44px)", fontWeight: 700, marginBottom: 52, color: "#f0f0fc" },
  rail: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, justifyContent: "center" },
  railStep: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 20px", minWidth: 100, transition: "border-color .4s, background .4s" },
  railStepActive: { borderColor: `rgba(70,229,255,.4)`, background: `rgba(70,229,255,.04)` },
  connector: { width: 24, height: 1, background: C.border, flexShrink: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "28px 26px" },
  cardTitle: { fontWeight: 600, fontSize: 15, color: "#d8d8f0", marginBottom: 10 },
  cardBody: { fontSize: 13, color: "#5a5a7a", lineHeight: 1.7 },
  plans: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, maxWidth: 980, margin: "0 auto" },
  plan: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px 28px", position: "relative" },
  planFeatured: { border: `1px solid rgba(70,229,255,.3)`, background: `rgba(70,229,255,.025)` },
  badge: { position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: C.accent, color: "#05050f", fontSize: 8, fontFamily: "monospace", letterSpacing: "0.2em", padding: "3px 14px", borderRadius: 20, fontWeight: 700 },
  planBtnPrimary: { width: "100%", background: C.accent, border: "none", color: "#05050f", padding: "12px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "monospace", fontWeight: 700, transition: "opacity .2s" },
  planBtnSecondary: { width: "100%", background: "transparent", border: `1px solid ${C.border}`, color: "#5a5a7a", padding: "12px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "monospace", transition: "border-color .2s,color .2s" },
  footer: { borderTop: `1px solid ${C.border}`, padding: "32px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1160, margin: "0 auto" },
};
