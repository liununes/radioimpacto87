import RadioPlayer from "@/components/RadioPlayer";
import Navigation from "@/components/Navigation";
import HeroCarousel from "@/components/HeroCarousel";
import TopSongs from "@/components/TopSongs";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <RadioPlayer />
      <Navigation />
      <HeroCarousel />
      <TopSongs />
      <NewsSection />
      <Footer />
    </div>
  );
};

export default Index;