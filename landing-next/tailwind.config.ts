import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#050507",
        panel: "#0C0D10",
        "panel-2": "#101216",
        line: "rgba(255,255,255,0.07)",
        "line-strong": "rgba(255,255,255,0.13)",
        ink: {
          DEFAULT: "#E7E9EE",
          dim: "#8A8F98",
          faint: "#565B64",
          ghost: "#34373D",
        },
        accent: {
          DEFAULT: "#46E5FF",
          soft: "rgba(70,229,255,0.14)",
          line: "rgba(70,229,255,0.40)",
          glow: "rgba(70,229,255,0.55)",
        },
        danger: "#FF5B5B",
        good: "#46FFB0",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      maxWidth: {
        stage: "1180px",
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.82)" },
        },
        "grain-shift": {
          "0%, 100%": { transform: "translate(0,0)" },
          "25%": { transform: "translate(-1%, 1%)" },
          "50%": { transform: "translate(1%, -1%)" },
          "75%": { transform: "translate(1%, 1%)" },
        },
        sweep: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
      },
      animation: {
        blink: "blink 1.05s steps(1) infinite",
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
        "grain-shift": "grain-shift 8s steps(4) infinite",
        sweep: "sweep 7s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
