type Props = {
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
};

/** Mono status badge, e.g. "kryx.io — coming soon". */
export default function Badge({ children, pulse, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-line bg-bg-1/60 px-3.5 py-1.5 font-mono text-xs text-muted backdrop-blur ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
      )}
      {children}
    </span>
  );
}
