import RadioPlayer from "@/components/RadioPlayer";
import Navigation from "@/components/Navigation";
import HeroCarousel from "@/components/HeroCarousel";
import TopSongs from "@/components/TopSongs";
import ProgramacaoSection from "@/components/ProgramacaoSection";
import GaleriaSection from "@/components/GaleriaSection";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <RadioPlayer />
      <Navigation />
      <HeroCarousel />
      <ProgramacaoSection />
      <TopSongs />
      <GaleriaSection />
      <NewsSection />
      <Footer />
    </div>
  );
};

export default Index;
