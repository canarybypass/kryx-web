import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import TimelineRail from "@/components/TimelineRail";
import { MotionConfig } from "framer-motion";

const sans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kryx — Think like the attacker. Find it first.",
  description:
    "Kryx is an autonomous multi-agent penetration testing platform. A swarm of agents finds real vulnerabilities with real tools, adversarially validates every finding, and chains them into proven APT-grade exploits.",
  metadataBase: new URL("https://kryx.sh"),
  openGraph: {
    title: "Kryx — Think like the attacker. Find it first.",
    description:
      "Autonomous multi-agent pentesting. Real tools, zero false positives, proven exploit chains.",
    url: "https://kryx.sh",
    siteName: "Kryx",
    type: "website",
  },
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon.svg` },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="relative min-h-screen bg-bg text-ink">
        <MotionConfig reducedMotion="never">
          <I18nProvider>
            <SmoothScroll />
            <Navbar />
            <TimelineRail />
            <main className="relative">{children}</main>
          </I18nProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
