"use client";

import Reveal from "./Reveal";

interface SectionHeadingProps {
  tag: string;
  title: string;
  body?: string;
  className?: string;
  align?: "left" | "center";
}

/** The recurring eyebrow → display title → body lockup used by most phases. */
export default function SectionHeading({
  tag,
  title,
  body,
  className = "",
  align = "left",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  return (
    <div className={`${isCenter ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}>
      <Reveal>
        <div className={`flex items-center gap-2.5 ${isCenter ? "justify-center" : ""}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">{tag}</span>
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="display mt-5 text-balance text-3xl text-ink sm:text-4xl lg:text-[2.9rem]">
          {title}
        </h2>
      </Reveal>
      {body && (
        <Reveal delay={0.12}>
          <p className={`mt-5 text-[15px] leading-relaxed text-ink-dim sm:text-base ${isCenter ? "mx-auto" : ""}`}>
            {body}
          </p>
        </Reveal>
      )}
    </div>
  );
}
