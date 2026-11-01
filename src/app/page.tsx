import Nav from "@/components/ui/Nav";
import Hero from "@/components/sections/Hero";
import Pipeline from "@/components/sections/Pipeline";
import Terminal from "@/components/sections/Terminal";
import WhyKryx from "@/components/sections/WhyKryx";
import Engine from "@/components/sections/Engine";
import Comparison from "@/components/sections/Comparison";
import Pricing from "@/components/sections/Pricing";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" className="relative">
        <Hero />
        <Pipeline />
        <Terminal />
        <WhyKryx />
        <Engine />
        <Comparison />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
