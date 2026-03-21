import RadioPlayer from "@/components/RadioPlayer";
import Navigation from "@/components/Navigation";
import HeroCarousel from "@/components/HeroCarousel";
import WeatherWidget from "@/components/WeatherWidget";
import TopSongs from "@/components/TopSongs";
import { FeaturedNews, RemainingNews, useNews } from "@/components/EnhancedNewsSection";
import GaleriaSection from "@/components/GaleriaSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import { useTheme } from "@/hooks/useTheme";
import { getSiteConfig } from "@/lib/radioStore";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Index = () => {
  const theme = useTheme();
  const { news, loading } = useNews();

  useEffect(() => {
    // Rastreador de Acessos
    const logAccess = async () => {
    
    // Rastreador de Acessos
    const logAccess = async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastAccessDate = localStorage.getItem('lastAccessDate');
      
      if (lastAccessDate !== today) {
        let sessionId = localStorage.getItem('siteSessionId');
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          localStorage.setItem('siteSessionId', sessionId);
        }
        
        try {
          await (supabase as any).from('site_accesses').insert({ session_id: sessionId });
          localStorage.setItem('lastAccessDate', today);
        } catch (e) {
          console.error("Erro ao registrar estatísticas:", e);
        }
      }
    };
    logAccess();
  }, []);

  const topSongsPos = theme.topSongsPosition || 'hero';

  return (
    <div className="min-h-screen bg-white pb-32 md:pb-40 overflow-x-hidden">
      <Navigation />
      
      <main className="relative z-10">
        <HeroCarousel />
        
        {theme.showNews && (
          <>
            <FeaturedNews news={news} loading={loading} />
            <RemainingNews news={news} loading={loading} />
          </>
        )}
        
        {theme.showTopSongs && topSongsPos === 'hero' && <TopSongs />}
        
        {theme.showGallery && <GaleriaSection />}
        {theme.showTopSongs && topSongsPos === 'gallery' && <TopSongs />}
        
        <div className="bg-gray-50/50">
          {theme.showAbout && <AboutSection />}
          {theme.showTopSongs && (topSongsPos === 'news' || topSongsPos === 'contact') && <TopSongs />}
        </div>
      </main>
      
      <Footer />
      <RadioPlayer />
    </div>
  );
};

export default Index;
