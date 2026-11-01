"use client";

import { useI18n } from "@/lib/i18n";
import PhaseShell from "../primitives/PhaseShell";
import SectionHeading from "../primitives/SectionHeading";
import Reveal from "../primitives/Reveal";
import KillChainGraph from "../KillChainGraph";

export default function PhaseChaining() {
  const { t } = useI18n();
  return (
    <PhaseShell id="chaining">
      <SectionHeading tag={t.chaining.tag} title={t.chaining.title} body={t.chaining.body} className="max-w-3xl" />
      <Reveal delay={0.08} y={30} className="mt-10">
        <KillChainGraph />
      </Reveal>
    </PhaseShell>
  );
}
