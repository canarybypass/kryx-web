import type { Metadata, Viewport } from "next";
import { spaceGrotesk, jetbrainsMono } from "@/lib/fonts";
import LenisProvider from "@/components/providers/LenisProvider";
import MotionProvider from "@/components/providers/MotionProvider";
import Cursor from "@/components/providers/Cursor";
import ScrollProgress from "@/components/providers/ScrollProgress";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const SITE = "https://kryx.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Kryx — Think like the attacker. Find it first.",
    template: "%s — Kryx",
  },
  description:
    "Kryx is an autonomous multi-agent penetration-testing platform. A swarm of agents drives real tools, adversarially validates every finding, and chains them into APT-grade attack paths.",
  keywords: [
    "penetration testing",
    "autonomous pentest",
    "AI security",
    "attack surface",
    "offensive security",
    "multi-agent",
  ],
  openGraph: {
    title: "Kryx — Think like the attacker. Find it first.",
    description:
      "An autonomous swarm of agents that breaks in before the real adversary does. Real tools, adversarial validation, APT-grade attack chains.",
    url: SITE,
    siteName: "Kryx",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kryx — Autonomous Penetration Testing",
    description:
      "Real tools. Adversarial validation. APT-grade attack chains. kryx.io — coming soon.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg-0 text-text antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-bg-0"
        >
          Skip to content
        </a>
        <LanguageProvider>
          <MotionProvider>
            <ScrollProgress />
            <Cursor />
            <LenisProvider>{children}</LenisProvider>
          </MotionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
