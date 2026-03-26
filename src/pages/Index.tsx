import RadioPlayer from "@/components/RadioPlayer";
import Navigation from "@/components/Navigation";
import HeroCarousel from "@/components/HeroCarousel";
import TopSongs from "@/components/TopSongs";
import { FeaturedNews, RemainingNews, useNews } from "@/components/EnhancedNewsSection";
import GaleriaSection from "@/components/GaleriaSection";
import AboutSection from "@/components/AboutSection";
import SponsorsSection from "@/components/SponsorsSection";
import PromosSection from "@/components/PromosSection";
import PedidoSection from "@/components/PedidoSection";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Index = () => {
  const theme = useTheme();
  const { news, loading } = useNews();
  const regularNews = news.filter(n => n.categoria !== "Entretenimento");
  const entertainmentNews = news.filter(n => n.categoria === "Entretenimento");

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
    <>
      <main className="relative z-10">
        {/* Slide de fotos no topo */}
        <section id="home" className="pt-0">
          {theme.showSlides && <HeroCarousel />}
        </section>

        {/* Notícias abaixo do slide */}
        <section id="noticias" className="pt-0 md:pt-10 bg-white dark:bg-gray-950">
          {theme.showNews && (
            <>
              <FeaturedNews news={regularNews} loading={loading} />
              
              {/* Pedidos musicais integrados */}
              {theme.showPedidos && (
                 <div className="container mx-auto px-6 mt-12 mb-20">
                    <PedidoSection position={theme.pedidoPosition} />
                 </div>
              )}

              {theme.showEntretenimento !== false && (
                <div id="entretenimento" className="mt-20 py-20 bg-gray-50/30 dark:bg-gray-900/50 rounded-[3rem]">
                  <div className="container mx-auto px-6 mb-12">
                     <span className="text-[10px] font-black text-accent uppercase tracking-[0.5em] block mb-2">Editoria</span>
                     <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none" style={{ color: 'var(--text-title)' }}>Entretenimento</h2>
                  </div>
                  <RemainingNews news={entertainmentNews} loading={loading} />
                </div>
              )}
            </>
          )}
        </section>

        {theme.showPromos && <PromosSection />}
        
        {theme.showTopSongs && topSongsPos === 'hero' && (
          <section id="musica" className="py-20">
            <TopSongs />
          </section>
        )}
        
        {theme.showGallery && (
          <section id="galeria" className="mt-32 py-20 bg-primary text-white">
            <div className="container mx-auto px-6 mb-12">
               <span className="text-[10px] font-black text-secondary uppercase tracking-[0.5em] block mb-2">Registros</span>
               <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none" style={{ color: 'var(--text-title)' }}>Nossa Galeria</h2>
            </div>
            <GaleriaSection />
          </section>
        )}
        
        {theme.showTopSongs && topSongsPos === 'gallery' && <TopSongs />}
        
        <div className="bg-gray-50/50 dark:bg-gray-900/50 mt-20 py-10">
          <div id="sobre">
            {theme.showAbout && <AboutSection />}
          </div>
          {theme.showTopSongs && (topSongsPos === 'news' || topSongsPos === 'contact') && <TopSongs />}
        </div>
        
        {theme.showSponsors && <SponsorsSection />}
      </main>
    </>
  );
};

export default Index;
