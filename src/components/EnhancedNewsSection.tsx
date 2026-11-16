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
  const moreNews = news.slice(3, 6);

  if (mainNews.length === 0 && !loading) return null;

  return (
    <div className="container mx-auto px-4 py-14 news-editorial-section">
      <div className="news-editorial-heading">
        <div>
          <h2 style={{ color: "var(--plantao-title)" }}>
            {theme.labels.newsTitle}{" "}
            <span style={{ color: "var(--plantao-subtitle)", textDecorationColor: "var(--nav-item-active)" }}>
              {theme.labels.newsSubtitle}
            </span>
          </h2>
          <p>As três principais notícias</p>
        </div>
      </div>

      <div className="news-editorial-layout">
        <section className="news-primary-list" aria-label="Três principais notícias">
          {mainNews.map((item) => (
            <NewsTextItem key={item.id} item={item} />
          ))}
          {loading && mainNews.length === 0 && <p className="news-loading">Carregando notícias...</p>}
        </section>

        <aside className="news-more-list" style={{ padding: ".85rem", alignSelf: "start" }}>
          <div className="news-more-heading">
            <h3 style={{ fontSize: ".78rem", lineHeight: 1.2, letterSpacing: ".1em", margin: 0 }}>VÍDEOS E MAIS</h3>
          </div>
          {moreNews.length > 0 ? (
            moreNews.map((item) => <NewsTextItem key={item.id} item={item} compact />)
          ) : (
            <p className="news-more-empty">Confira outros conteúdos publicados pela rádio.</p>
          )}
          <a href="#conteudos" className="news-all-link">
            Ver todos os conteúdos <span aria-hidden="true">→</span>
          </a>
        </aside>
      </div>
    </div>
  );
};

export const RemainingNews = ({ news, loading, showAll = false }: { news: NewsItem[]; loading: boolean; showAll?: boolean }) => {
  const remaining = showAll ? news : news.slice(6);

  if (remaining.length === 0 && !loading) return null;

  return (
    <div id="conteudos" className="container mx-auto px-4 py-12 news-remaining-section scroll-mt-24">
      <div className="news-remaining-heading">
        <h2>CONTEÚDOS</h2>
        <p>Mais notícias e publicações</p>
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
