import { useEffect } from "react";
import RadioPlayer from "@/components/RadioPlayer";
import Navigation from "@/components/Navigation";
import HeroLive from "@/components/HeroLive";
import ProgramacaoSection from "@/components/ProgramacaoSection";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";
import { getSiteConfig, applySiteConfig } from "@/lib/siteConfig";

const Index = () => {
  useEffect(() => {
    applySiteConfig(getSiteConfig());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <RadioPlayer />
      <Navigation />
      <HeroLive />
      <ProgramacaoSection />
      <NewsSection />
      <Footer />
    </div>
  );
};

export default Index;
