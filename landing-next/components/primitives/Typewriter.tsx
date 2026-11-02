"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface TypewriterProps {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
  cursor?: boolean;
  cursorClassName?: string;
}

/** Types a single string out when it scrolls into view; static under reduced motion. */
export default function Typewriter({
  text,
  speed = 38,
  startDelay = 300,
  className = "",
  cursor = true,
  cursorClassName = "",
}: TypewriterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const start = setTimeout(function tick() {
      i += 1;
      setCount(i);
      if (i < text.length) timer = setTimeout(tick, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [inView, text, speed, startDelay]);

  return (
    <span ref={ref} className={className}>
      {text.slice(0, count)}
      {cursor && (
        <span
          className={`ml-0.5 inline-block h-[1em] w-[0.52em] translate-y-[0.1em] bg-accent animate-blink ${cursorClassName}`}
        />
      )}
    </span>
  );
}
