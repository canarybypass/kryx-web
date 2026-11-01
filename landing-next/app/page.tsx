import PhaseEntry from "@/components/phases/PhaseEntry";
import PhaseRecon from "@/components/phases/PhaseRecon";
import PhaseSwarm from "@/components/phases/PhaseSwarm";
import PhaseContact from "@/components/phases/PhaseContact";
import PhaseReview from "@/components/phases/PhaseReview";
import PhaseChaining from "@/components/phases/PhaseChaining";
import PhaseProven from "@/components/phases/PhaseProven";
import PhaseDelivered from "@/components/phases/PhaseDelivered";
import PhasePricing from "@/components/phases/PhasePricing";
import PhaseEngage from "@/components/phases/PhaseEngage";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <PhaseEntry />
      <PhaseRecon />
      <PhaseSwarm />
      <PhaseContact />
      <PhaseReview />
      <PhaseChaining />
      <PhaseProven />
      <PhaseDelivered />
      <PhasePricing />
      <PhaseEngage />
      <Footer />
    </>
  );
}
