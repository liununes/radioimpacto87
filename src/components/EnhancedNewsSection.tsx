import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";

export interface NewsItem {
  id: string;
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  categoria: string | null;
  imagem: string | null;
  fonte: string | null;
  url: string | null;
  data_postagem: string;
  usuario_id: string | null;
}

interface EnhancedNewsSectionProps {
  showNews?: boolean;
}

const openNews = (url: string | null) => {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
};

const NewsTextItem = ({ item, compact = false }: { item: NewsItem; compact?: boolean }) => (
  <article
    className={`news-text-item${compact ? " news-more-card" : ""}`}
    style={compact ? { gridTemplateColumns: "96px minmax(0, 1fr)", gap: ".7rem", padding: ".7rem", borderRadius: ".75rem", alignItems: "start" } : undefined}
    onClick={() => openNews(item.url)}
    onKeyDown={(event) => {
      if ((event.key === "Enter" || event.key === " ") && item.url) {
        event.preventDefault();
        openNews(item.url);
      }
    }}
    role={item.url ? "link" : undefined}
    tabIndex={item.url ? 0 : undefined}
  >
    {item.imagem && (
      <div className="news-text-image-wrap" style={compact ? { aspectRatio: "4 / 3", borderRadius: ".55rem" } : undefined}>
        <img src={item.imagem} alt={item.titulo} className="news-text-image" loading="lazy" />
      </div>
    )}
    <div className="news-text-copy" style={compact ? { minWidth: 0 } : undefined}>
    <div className="news-text-meta" style={compact ? { fontSize: ".64rem", gap: ".25rem .45rem", marginBottom: ".3rem" } : undefined}>
      <span>{item.categoria || "NOTÍCIA"}</span>
      <span>{new Date(item.data_postagem || Date.now()).toLocaleDateString("pt-BR")}</span>
    </div>
    <h3 style={compact ? { fontSize: ".92rem", lineHeight: 1.28, margin: 0 } : undefined}>{item.titulo}</h3>
    {item.resumo && <p style={compact ? { fontSize: ".8rem", lineHeight: 1.42, marginTop: ".35rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" } : undefined}>{item.resumo}</p>}
    {item.url && <span className="news-read-link">Ler notícia <span aria-hidden="true">→</span></span>}
    </div>
  </article>
);

export const FeaturedNews = ({ news, loading }: { news: NewsItem[]; loading: boolean }) => {
  const theme = useTheme();
  const mainNews = news.slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeNews = mainNews[activeIndex] || mainNews[0];

  useEffect(() => {
    if (mainNews.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % mainNews.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [mainNews.length]);

  useEffect(() => {
    if (activeIndex >= mainNews.length) setActiveIndex(0);
  }, [activeIndex, mainNews.length]);

  if (mainNews.length === 0 && !loading) return null;

  return (
    <div id="conteudos" className="container mx-auto px-4 py-14 news-editorial-section scroll-mt-24">
      <div className="news-remaining-heading">
        <h2>CONTEÚDOS</h2>
        <p>Confira as principais notícias e acesse cada matéria completa.</p>
      </div>

      <div className="news-editorial-layout news-feature-layout">
        <section className="news-primary-list" aria-label="Notícia em destaque">
          {activeNews ? (
            <article className="news-feature-card" key={activeNews.id}>
              {activeNews.imagem && (
                <div className="news-feature-image-wrap">
                  <img src={activeNews.imagem} alt={activeNews.titulo} className="news-feature-image" />
                  <span className="news-feature-counter">{activeIndex + 1} / {mainNews.length}</span>
                </div>
              )}
              <div className="news-feature-copy">
                <div className="news-text-meta">
                  <span>{activeNews.categoria || "NOTÍCIA"}</span>
                  <span>{new Date(activeNews.data_postagem || Date.now()).toLocaleDateString("pt-BR")}</span>
                </div>
                <h3>{activeNews.titulo}</h3>
                {activeNews.resumo && <p>{activeNews.resumo}</p>}
                {activeNews.url && (
                  <a href={activeNews.url} target="_blank" rel="noopener noreferrer" className="news-feature-link">
                    Ler matéria completa <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            </article>
          ) : (
            <p className="news-loading">Carregando notícias...</p>
          )}
        </section>

        <aside className="news-more-list news-feature-list" aria-label="Acesse uma das três notícias">
          <div className="news-more-heading">
            <h3>DESTAQUES DO DIA</h3>
            <p>Clique para ler a matéria completa</p>
          </div>
          {mainNews.map((item, index) => (
            <a
              key={item.id}
              href={item.url || "#conteudos"}
              target={item.url ? "_blank" : undefined}
              rel={item.url ? "noopener noreferrer" : undefined}
              className={`news-feature-summary${index === activeIndex ? " is-active" : ""}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              {item.imagem && (
                <span className="news-summary-image-wrap">
                  <img src={item.imagem} alt="" className="news-summary-image" loading="lazy" />
                </span>
              )}
              <span className="news-summary-copy">
                <span className="news-summary-number">0{index + 1} · {item.categoria || "NOTÍCIA"}</span>
                <strong>{item.titulo}</strong>
                {item.resumo && <span className="news-summary-excerpt">{item.resumo}</span>}
              </span>
            </a>
          ))}
          <a href="#mais-conteudos" className="news-all-link">
            Ver mais conteúdos <span aria-hidden="true">→</span>
          </a>
        </aside>
      </div>
    </div>
  );
};

export const RemainingNews = ({ news, loading, showAll = false }: { news: NewsItem[]; loading: boolean; showAll?: boolean }) => {
  const remaining = showAll ? news.slice(3) : news.slice(3, 24);

  if (remaining.length === 0 && !loading) return null;

  return (
    <div id="mais-conteudos" className="container mx-auto px-4 py-12 news-remaining-section scroll-mt-24">
      <div className="news-remaining-heading">
        <h2>MAIS NOTÍCIAS</h2>
        <p>Outras notícias e publicações</p>
      </div>
      <div className="news-remaining-list">
        {remaining.map((item) => (
          <NewsTextItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("destaque", { ascending: false })
      .order("data_postagem", { ascending: false })
      .limit(24);

    if (error) console.error("Erro ao buscar notícias:", error.message);
    else setNews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { news, loading };
};

const EnhancedNewsSection = ({ showNews = true }: EnhancedNewsSectionProps) => {
  const { news, loading } = useNews();

  if (!showNews) return null;

  return (
    <section className="bg-transparent">
      <FeaturedNews news={news} loading={loading} />
      <RemainingNews news={news} loading={loading} />
    </section>
  );
};

export default EnhancedNewsSection;
