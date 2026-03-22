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
              <div id="entretenimento" className="mt-20 py-20 bg-gray-50/30 rounded-[3rem]">
                <div className="container mx-auto px-6 mb-12">
                   <span className="text-[10px] font-black text-accent uppercase tracking-[0.5em] block mb-2">Editoria</span>
                   <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase italic leading-none">Entretenimento</h2>
                </div>
                <RemainingNews news={news} loading={loading} />
              </div>
            </>
          )}
        </section>

        <section id="promocoes" className="py-32 flex flex-col items-center justify-center bg-white border-y border-gray-100">
           <div className="container mx-auto px-6 text-center mb-12">
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.5em] block mb-2">Participe</span>
              <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter uppercase italic leading-none mb-8 text-center">Promoções <span className="text-accent underline">Ativas</span></h2>
           </div>
           <div className="w-full max-w-4xl mx-auto min-h-[300px] flex items-center justify-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <div className="text-center italic opacity-30 font-black uppercase tracking-widest text-sm">Fique ligado! Novas promoções em breve.</div>
           </div>
        </section>
        
        {theme.showTopSongs && topSongsPos === 'hero' && (
          <section id="musica" className="py-20">
            <TopSongs />
          </section>
        )}

        <div id="programacao" className="mt-32 py-20">
           <ProgramacaoSection />
        </div>
        
        {theme.showGallery && (
          <section id="galeria" className="mt-32 py-20 bg-primary text-white">
            <div className="container mx-auto px-6 mb-12">
               <span className="text-[10px] font-black text-secondary uppercase tracking-[0.5em] block mb-2">Registros</span>
               <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Nossa Galeria</h2>
            </div>
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
