import RadioPlayer from "@/components/RadioPlayer";
import Navigation from "@/components/Navigation";
import HeroCarousel from "@/components/HeroCarousel";
import WeatherWidget from "@/components/WeatherWidget";
import TopSongs from "@/components/TopSongs";
import EnhancedNewsSection from "@/components/EnhancedNewsSection";
import GaleriaSection from "@/components/GaleriaSection";
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

  const topSongsPos = theme.topSongsPosition || 'hero';

  return (
    <div className="min-h-screen bg-background">
      <RadioPlayer />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <HeroCarousel />
        </div>
      </div>
      
      {topSongsPos === 'hero' && <TopSongs />}
      
      {theme.showGallery && <GaleriaSection />}
      {topSongsPos === 'gallery' && <TopSongs />}
      
      {theme.showNews && <EnhancedNewsSection />}
      {topSongsPos === 'news' && <TopSongs />}
      
      {theme.showAbout && <AboutSection />}
      {topSongsPos === 'contact' && <TopSongs />}
      
      <Footer />
    </div>
  );
};

export default Index;
