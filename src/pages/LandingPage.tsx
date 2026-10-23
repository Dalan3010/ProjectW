import { Benefits } from "../components/Benefits";
import { CtaCard } from "../components/CtaCard";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { Navbar } from "../components/Navbar";
import { ZodiacBackground } from "../components/ZodiacBackground";
import { usePageMeta } from "../hooks/usePageMeta";

export function LandingPage() {
  usePageMeta(
    "BID — De la idea al negocio",
    "Convierte tus ideas en oportunidades de negocio con ayuda de inteligencia artificial.",
  );

  return (
    <>
      <ZodiacBackground />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <CtaCard />
      </main>
      <Footer />
    </>
  );
}
