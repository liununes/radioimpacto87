import RadioPlayer from "@/components/RadioPlayer";
import Navigation from "@/components/Navigation";
import HeroCarousel from "@/components/HeroCarousel";
import WeatherWidget from "@/components/WeatherWidget";
import TopSongs from "@/components/TopSongs";
import { FeaturedNews, RemainingNews, useNews } from "@/components/EnhancedNewsSection";
import GaleriaSection from "@/components/GaleriaSection";
import ProgramacaoSection from "@/components/ProgramacaoSection";
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
        {/* Slide de fotos no topo, como solicitado - Padrão do site */}
        <section id="home" className="pt-0">
          <HeroCarousel />
        </section>

        {/* Notícias abaixo do slide */}
        <section id="noticias" className="pt-0 md:pt-10 bg-white">
          {theme.showNews && (
            <>
              <FeaturedNews news={news} loading={loading} />
              <div id="entretenimento" className="mt-12 min-h-[400px]">
                <RemainingNews news={news} loading={loading} />
              </div>
            </>
          )}
        </section>

        <section id="promocoes" className="mt-12 min-h-[400px] flex items-center justify-center bg-gray-50/30 rounded-[3rem] mx-6">
           <div className="text-center italic opacity-30 font-black uppercase tracking-widest text-sm">Espaço Para Promoções</div>
        </section>
        
        {theme.showTopSongs && topSongsPos === 'hero' && (
          <section id="musica">
            <TopSongs />
          </section>
        )}

        <div id="programacao" className="mt-20">
           <ProgramacaoSection />
        </div>
        
        {theme.showGallery && (
          <section id="galeria" className="mt-20">
            <GaleriaSection />
          </section>
        )}
        
        {theme.showTopSongs && topSongsPos === 'gallery' && <TopSongs />}
        
        <div className="bg-gray-50/50 mt-20 py-10">
          <div id="sobre">
            {theme.showAbout && <AboutSection />}
          </div>
          {theme.showTopSongs && (topSongsPos === 'news' || topSongsPos === 'contact') && <TopSongs />}
        </div>
      </main>
      
      <Footer />
      <RadioPlayer />
    </div>
  );
};

export default Index;
