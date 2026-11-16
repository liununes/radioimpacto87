import HeroCarousel from "@/components/HeroCarousel";
import TopSongs from "@/components/TopSongs";
import { FeaturedNews, RemainingNews, useNews } from "@/components/EnhancedNewsSection";
import GaleriaSection from "@/components/GaleriaSection";
import AboutSection from "@/components/AboutSection";
import SponsorsSection from "@/components/SponsorsSection";
import PromosSection from "@/components/PromosSection";
import PedidoSection from "@/components/PedidoSection";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Index = () => {
  const theme = useTheme();
  const { news, loading } = useNews();
  const regularNews = news.filter(n => n.categoria !== "Entretenimento");
  const entertainmentNews = news.filter(n => n.categoria === "Entretenimento");
  const topSongsPos = theme.topSongsPosition || "hero";

  useEffect(() => {
    // Rastreador de acessos: registra uma visita por sessão a cada dia.
    const logAccess = async () => {
      const today = new Date().toISOString().split("T")[0];
      const lastAccessDate = localStorage.getItem("lastAccessDate");

      if (lastAccessDate !== today) {
        let sessionId = localStorage.getItem("siteSessionId");
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          localStorage.setItem("siteSessionId", sessionId);
        }

        try {
          const { error } = await (supabase as any)
            .from("site_accesses")
            .insert({ session_id: sessionId });
          if (error) throw error;
          localStorage.setItem("lastAccessDate", today);
        } catch (error) {
          console.error("Erro ao registrar estatísticas:", error);
        }
      }
    };

    logAccess();
  }, []);

  return (
    <div className="radio-home-content">
      {theme.showSlides && <HeroCarousel />}

      {theme.showNews && (
        <section id="noticias" className="radio-editorial-section">
          <FeaturedNews news={regularNews} loading={loading} />
          <RemainingNews news={regularNews} loading={loading} />

          {theme.showPedidos && (
            <div className="radio-pedido-wrap">
              <PedidoSection position={theme.pedidoPosition} />
            </div>
          )}

          {theme.showEntretenimento !== false && entertainmentNews.length > 0 && (
            <section id="entretenimento" className="radio-entertainment-section">
              <div className="container mx-auto px-6 radio-section-heading">
                <span className="radio-eyebrow">Cultura e variedades</span>
                <h2>
                  {theme.labels.entertainmentTitle}{" "}
                  <span>{theme.labels.entertainmentSubtitle}</span>
                </h2>
              </div>
              <RemainingNews news={entertainmentNews} loading={loading} showAll />
            </section>
          )}
        </section>
      )}

      {theme.showPromos && <PromosSection />}

      {theme.showTopSongs && topSongsPos === "hero" && (
        <div id="musica" className="radio-music-section">
          <TopSongs />
        </div>
      )}

      {theme.showGallery && <GaleriaSection />}

      {theme.showTopSongs && topSongsPos === "gallery" && (
        <div id="musica" className="radio-music-section">
          <TopSongs />
        </div>
      )}

      {(theme.showAbout || (theme.showTopSongs && (topSongsPos === "news" || topSongsPos === "contact"))) && (
        <section className="radio-about-section">
          {theme.showAbout && (
            <div>
              <AboutSection />
            </div>
          )}
          {theme.showTopSongs && (topSongsPos === "news" || topSongsPos === "contact") && (
            <div id="musica" className="radio-music-section">
              <TopSongs />
            </div>
          )}
        </section>
      )}

      {theme.showSponsors && <SponsorsSection />}
    </div>
  );
};

export default Index;
