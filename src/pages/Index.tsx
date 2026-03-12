import RadioPlayer from "@/components/RadioPlayer";
import Navigation from "@/components/Navigation";
import HeroCarousel from "@/components/HeroCarousel";
import TopSongs from "@/components/TopSongs";
import GaleriaSection from "@/components/GaleriaSection";
import NewsSection from "@/components/NewsSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import { getThemeConfig } from "@/lib/themeStore";
import { getSiteConfig } from "@/lib/radioStore";
import { useEffect, useState } from "react";

const Index = () => {
  const [theme, setTheme] = useState(getThemeConfig());

  useEffect(() => {
    const syncTheme = async () => {
      const saved = await getSiteConfig("theme");
      if (saved) setTheme(saved);
    };
    syncTheme();
    
    const handleStorage = () => setTheme(getThemeConfig());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const pos = theme.topSongsPosition || 'hero';

  return (
    <div className="min-h-screen bg-background">
      <RadioPlayer />
      <Navigation />
      <HeroCarousel />
      
      {pos === 'hero' && <TopSongs />}
      
      <GaleriaSection />
      {pos === 'gallery' && <TopSongs />}
      
      <NewsSection />
      {pos === 'news' && <TopSongs />}
      
      <AboutSection />
      {pos === 'contact' && <TopSongs />}
      
      <Footer />
    </div>
  );
};

export default Index;
