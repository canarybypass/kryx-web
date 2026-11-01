"use client";

import { SITE } from "@/data/site";
import { useT } from "@/lib/i18n";

export default function Footer() {
  const t = useT();
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          {/* brand + status */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="relative grid h-6 w-6 place-items-center">
                <span className="absolute h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_2px_var(--color-accent)]" />
                <span className="absolute h-6 w-6 rounded-full border border-accent/40" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                {SITE.name}
              </span>
            </div>
            <p className="mt-4 font-mono text-xs leading-relaxed text-muted">
              {t.footer.tagline}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {SITE.domain} · {t.comingSoon}
              </span>
            </div>
          </div>

          {/* links */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-12">
            <FooterCol
              title={t.footer.cols.platform}
              links={t.nav.items.map((n) => ({ label: n.label, href: n.href }))}
            />
            <FooterCol
              title={t.footer.cols.product}
              links={[
                { label: t.footer.links.launch, href: SITE.appUrl },
                { label: t.footer.links.request, href: "#waitlist" },
                { label: t.footer.links.docs, href: SITE.github, external: true },
              ]}
            />
            <FooterCol
              title={t.footer.cols.company}
              links={[
                { label: t.footer.links.github, href: SITE.github, external: true },
                { label: t.footer.links.status, href: "#" },
                { label: t.footer.links.security, href: "#" },
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line pt-7 sm:mt-14 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-muted">
            © {new Date().getFullYear()} {SITE.name}. {t.footer.rights}
          </p>
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            data-cursor
            className="font-mono text-[11px] text-muted transition-colors hover:text-accent"
          >
            github.com/xxxoff/Kryx ↗
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              data-cursor
              {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="font-mono text-xs text-text/80 transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
