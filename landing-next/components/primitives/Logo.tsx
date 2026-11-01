"use client";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="#entry" className={`group flex items-center gap-2.5 ${className}`} aria-label="Kryx — home">
      <span className="relative grid h-7 w-7 place-items-center">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-accent" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
          <circle cx="12" cy="12" r="2.1" fill="currentColor" />
          <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span className="absolute inset-0 rounded-full bg-accent/0 transition-colors duration-500 group-hover:bg-accent/10" />
      </span>
      <span className="font-mono text-[15px] font-medium tracking-[0.26em] text-ink">KRYX</span>
    </a>
  );
}
