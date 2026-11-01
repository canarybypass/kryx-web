import { useState, useEffect, useRef } from "react";

const PHASES = [
  { id: "00", code: "ENTRY",   label: "Recon initiated" },
  { id: "01", code: "RECON",   label: "Surface mapped" },
  { id: "02", code: "SWARM",   label: "Agents deployed" },
  { id: "03", code: "CONTACT", label: "Vulnerability found" },
  { id: "04", code: "CHAIN",   label: "Attack chained" },
  { id: "05", code: "PROVEN",  label: "Exploit confirmed" },
];

const FEATURES = [
  { icon: "⬡", title: "Multi-Agent Swarm", desc: "8 specialized hunters run in parallel — injection, auth, CORS, CVE, RCE and more." },
  { icon: "⬢", title: "CVE Intelligence", desc: "Auto-matches your target's stack against 15+ critical CVEs and tests each one." },
  { icon: "⬡", title: "Real RCE Proof", desc: "Doesn't stop at detection — escalates SSTI and CMDi to actual id/whoami output." },
  { icon: "⬢", title: "Attack Chains", desc: "Combines individual findings into multi-step kill chains with full reproduction steps." },
  { icon: "⬡", title: "Adversarial Debate", desc: "Attacker and defender LLMs debate each finding before it reaches the report." },
  { icon: "⬢", title: "Live Terminal", desc: "Watch the agent think and act in real time via WebSocket stream." },
];

const PLANS = [
  { name: "STARTER", price: "$99", period: "/mo", scans: "10 scans/mo", features: ["Web targets", "Full hunter suite", "PDF report", "7-day history"] },
  { name: "PRO", price: "$499", period: "/mo", scans: "100 scans/mo", features: ["Everything in Starter", "CVE intel + RCE", "Attack chains", "API access", "30-day history"], hot: true },
  { name: "ENTERPRISE", price: "$2,999", period: "/mo", scans: "Unlimited", features: ["Everything in Pro", "Custom integrations", "SLA", "Dedicated support", "1-year history"] },
];

function TypewriterText({ text, speed = 60 }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return <span>{displayed}<span style={{ opacity: Math.random() > 0.5 ? 1 : 0, transition: "opacity 0.1s" }}>_</span></span>;
}

function PhaseDot({ active }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: active ? "#46E5FF" : "#2a2a3a",
      boxShadow: active ? "0 0 8px #46E5FF" : "none",
      transition: "all 0.4s",
    }} />
  );
}

export default function LandingPage({ onGetStarted }) {
  const [activePhase, setActivePhase] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const pricingRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActivePhase(p => (p + 1) % PHASES.length), 2200);
    return () => clearInterval(t);
  }, []);

  const scrollToPricing = () => pricingRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={S.page}>
      {/* Nav */}
      <header style={{ ...S.nav, background: scrolled ? "rgba(8,8,16,.85)" : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none", borderBottom: scrolled ? "1px solid #1a1a2e" : "1px solid transparent" }}>
        <div style={S.navInner}>
          <span style={S.logo}><span style={{ color: "#46E5FF" }}>●</span> Kryx</span>
          <div style={S.navCenter}>
            {PHASES.map((p, i) => (
              <span key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 10, color: i === activePhase ? "#46E5FF" : "#3a3a5a", transition: "color 0.4s", letterSpacing: "0.2em" }}>
                <PhaseDot active={i === activePhase} />
                {i === activePhase && <span style={{ color: "#46E5FF" }}>{p.code}</span>}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={onGetStarted} style={S.navLink}>Log in</button>
            <button onClick={onGetStarted} style={S.navBtn}>Launch app →</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={S.hero}>
        <div style={S.aurora}>
          <div style={{ ...S.blob, width: "50vw", height: "50vw", left: "-10vw", top: "-10vh", background: "radial-gradient(circle, rgba(70,229,255,.15), transparent 60%)", animation: "drift1 24s ease-in-out infinite" }} />
          <div style={{ ...S.blob, width: "40vw", height: "40vw", right: "-8vw", top: "5vh", background: "radial-gradient(circle, rgba(233,69,96,.1), transparent 60%)", animation: "drift2 30s ease-in-out infinite" }} />
        </div>
        <div style={S.heroContent}>
          <div style={S.tag}>AUTONOMOUS AI SECURITY AGENT</div>
          <h1 style={S.h1}>
            Security that<br />
            <span style={{ color: "#46E5FF" }}>proves itself.</span>
          </h1>
          <p style={S.heroSub}>
            Kryx deploys a swarm of AI hunters against your target, chains every finding into attack paths, and delivers RCE proof — not just alerts.
          </p>
          <div style={S.terminal}>
            <span style={{ color: "#46E5FF", fontFamily: "monospace" }}>$ </span>
            <span style={{ fontFamily: "monospace", color: "#c0c0d0" }}>
              <TypewriterText text="kryx engage --target https://target.com --depth full" speed={45} />
            </span>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={onGetStarted} style={S.ctaPrimary}>Start scanning →</button>
            <button onClick={scrollToPricing} style={S.ctaSecondary}>View plans</button>
          </div>
          <div style={S.stats}>
            {[["15+", "CVE modules"], ["8", "parallel hunters"], ["100%", "execution proof"], ["RCE", "confirmed output"]].map(([n, l]) => (
              <div key={l} style={S.stat}>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#46E5FF", fontFamily: "monospace" }}>{n}</span>
                <span style={{ fontSize: 11, color: "#5a5a7a", letterSpacing: "0.1em", textTransform: "uppercase" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={S.section}>
        <div style={S.sectionInner}>
          <div style={S.sectionLabel}>CAPABILITIES</div>
          <h2 style={S.h2}>How Kryx hunts</h2>
          <div style={S.grid}>
            {FEATURES.map(f => (
              <div key={f.title} style={S.card}>
                <span style={{ fontSize: 24, marginBottom: 12, display: "block", color: "#46E5FF" }}>{f.icon}</span>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15, color: "#e8e8f0" }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#6a6a8a", lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline viz */}
      <section style={{ ...S.section, background: "#09090f" }}>
        <div style={S.sectionInner}>
          <div style={S.sectionLabel}>PIPELINE</div>
          <h2 style={S.h2}>One scan. Full chain.</h2>
          <div style={S.pipeline}>
            {["RECON", "CRAWL", "SWEEP", "SWARM", "DEBATE", "CHAIN", "REPORT"].map((step, i, arr) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <div style={S.pipeStep}>
                  <div style={{ ...S.pipeBox, background: i === 3 ? "rgba(70,229,255,.12)" : "#12121e", borderColor: i === 3 ? "#46E5FF" : "#1e1e30" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: i === 3 ? "#46E5FF" : "#5a5a7a", letterSpacing: "0.15em" }}>{step}</span>
                  </div>
                </div>
                {i < arr.length - 1 && <div style={{ width: 24, height: 1, background: "#1e1e30", flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingRef} style={S.section}>
        <div style={S.sectionInner}>
          <div style={S.sectionLabel}>PRICING</div>
          <h2 style={S.h2}>Pick your operation</h2>
          <div style={S.plansGrid}>
            {PLANS.map(p => (
              <div key={p.name} style={{ ...S.planCard, ...(p.hot ? S.planCardHot : {}) }}>
                {p.hot && <div style={S.hotBadge}>MOST POPULAR</div>}
                <div style={{ fontFamily: "monospace", fontSize: 11, color: p.hot ? "#46E5FF" : "#5a5a7a", letterSpacing: "0.25em", marginBottom: 16 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: "#e8e8f0" }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: "#5a5a7a" }}>{p.period}</span>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "#46E5FF", marginBottom: 24 }}>{p.scans}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ fontSize: 13, color: "#8a8aa0", display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: "#46E5FF", fontSize: 10 }}>✦</span> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={onGetStarted} style={p.hot ? S.planBtnHot : S.planBtn}>Get started →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ ...S.section, background: "#09090f", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px" }}>
          <div style={S.sectionLabel}>ENGAGE</div>
          <h2 style={{ ...S.h2, fontSize: 36 }}>Ready to hunt?</h2>
          <p style={{ color: "#5a5a7a", marginBottom: 32, fontSize: 15 }}>Register in seconds. No credit card required to start.</p>
          <button onClick={onGetStarted} style={{ ...S.ctaPrimary, fontSize: 15, padding: "14px 40px" }}>Create free account →</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={S.footer}>
        <span style={S.logo}><span style={{ color: "#46E5FF" }}>●</span> Kryx</span>
        <span style={{ color: "#3a3a5a", fontSize: 12, fontFamily: "monospace" }}>Autonomous offensive security · 2026</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(6vw,5vh)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-5vw,7vh)} }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}

const S = {
  page: { background: "#080810", minHeight: "100vh", color: "#e8e8f0", fontFamily: "'Space Grotesk', -apple-system, sans-serif", overflowX: "hidden" },
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "all 0.4s" },
  navInner: { maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 600, color: "#e8e8f0", letterSpacing: "0.05em" },
  navCenter: { display: "flex", alignItems: "center", gap: 20 },
  navLink: { background: "none", border: "none", color: "#5a5a7a", cursor: "pointer", fontSize: 13, fontFamily: "'Space Grotesk', sans-serif", padding: "6px 12px", transition: "color 0.2s" },
  navBtn: { background: "rgba(70,229,255,.08)", border: "1px solid rgba(70,229,255,.25)", color: "#46E5FF", cursor: "pointer", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", padding: "7px 16px", borderRadius: 6, transition: "all 0.2s", letterSpacing: "0.05em" },
  hero: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", paddingTop: 80 },
  aurora: { position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" },
  blob: { position: "absolute", borderRadius: "50%", filter: "blur(80px)" },
  heroContent: { position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px", maxWidth: 800, margin: "0 auto" },
  tag: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.3em", color: "#46E5FF", marginBottom: 24, opacity: 0.8 },
  h1: { fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 24, color: "#f0f0f8" },
  heroSub: { fontSize: "clamp(15px, 2vw, 18px)", color: "#6a6a8a", lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: "0 auto 36px" },
  terminal: { background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 8, padding: "14px 20px", marginBottom: 36, textAlign: "left", fontSize: 13 },
  ctaPrimary: { background: "#46E5FF", color: "#080810", border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.03em", transition: "opacity 0.2s" },
  ctaSecondary: { background: "transparent", color: "#6a6a8a", border: "1px solid #1e1e30", padding: "12px 28px", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s" },
  stats: { display: "flex", gap: 40, justifyContent: "center", marginTop: 52, flexWrap: "wrap" },
  stat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  section: { padding: "100px 24px" },
  sectionInner: { maxWidth: 1160, margin: "0 auto" },
  sectionLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.3em", color: "#46E5FF", marginBottom: 16, opacity: 0.7 },
  h2: { fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, marginBottom: 48, color: "#f0f0f8" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 },
  card: { background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 12, padding: 28, transition: "border-color 0.3s" },
  pipeline: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, justifyContent: "center" },
  pipeStep: { display: "flex", flexDirection: "column", alignItems: "center" },
  pipeBox: { border: "1px solid", borderRadius: 8, padding: "10px 18px", transition: "all 0.4s" },
  plansGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 980, margin: "0 auto" },
  planCard: { background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 16, padding: 32, position: "relative" },
  planCardHot: { border: "1px solid rgba(70,229,255,.35)", background: "rgba(70,229,255,.03)" },
  hotBadge: { position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#46E5FF", color: "#080810", fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", padding: "4px 12px", borderRadius: 20, fontWeight: 700 },
  planBtn: { width: "100%", background: "transparent", border: "1px solid #1e1e30", color: "#6a6a8a", padding: "11px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s" },
  planBtnHot: { width: "100%", background: "#46E5FF", border: "none", color: "#080810", padding: "11px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, transition: "opacity 0.2s" },
  footer: { borderTop: "1px solid #12121e", padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1160, margin: "0 auto" },
};
