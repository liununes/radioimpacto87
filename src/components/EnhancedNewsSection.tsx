import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
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
        <h2>NOTÍCIAS</h2>
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
                {activeNews.url ? (
                  <a href={activeNews.url} target="_blank" rel="noopener noreferrer" className="news-feature-link">
                    Ler matéria completa <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <button type="button" onClick={() => setSelectedNews(activeNews)} className="news-feature-link">
                    Ler matéria completa <span aria-hidden="true">→</span>
                  </button>
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
          {mainNews.map((item, index) => {
            const summaryContent = (
              <>
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
              </>
            );
            const className = `news-feature-summary${index === activeIndex ? " is-active" : ""}`;
            return item.url ? (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className={className}>
                {summaryContent}
              </a>
            ) : (
              <button key={item.id} type="button" onClick={() => setSelectedNews(item)} className={className}>
                {summaryContent}
              </button>
            );
          })}
          <a href="#mais-conteudos" className="news-all-link">
            Ver todas as notícias <span aria-hidden="true">→</span>
          </a>
        </aside>
      </div>

      <Dialog open={!!selectedNews} onOpenChange={(open) => { if (!open) setSelectedNews(null); }}>
        <DialogContent className="news-full-dialog max-w-3xl w-[calc(100%-2rem)] max-h-[82dvh]">
          {selectedNews && (
            <>
              <DialogHeader>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-amber-700 dark:text-amber-300">
                  {selectedNews.categoria || "Notícia"} · {new Date(selectedNews.data_postagem || Date.now()).toLocaleDateString("pt-BR")}
                </p>
                <DialogTitle className="news-full-title text-xl sm:text-2xl text-slate-900 dark:text-slate-50">{selectedNews.titulo}</DialogTitle>
                <DialogDescription>{selectedNews.resumo || "Leia a matéria completa."}</DialogDescription>
              </DialogHeader>
              <div className="news-full-body px-5 py-5 sm:px-6 sm:py-6">
                {selectedNews.imagem && (
                  <img src={selectedNews.imagem} alt={selectedNews.titulo} className="mb-5 max-h-[300px] w-full rounded-xl object-cover" />
                )}
                <div className="news-full-copy whitespace-pre-wrap break-words text-[0.95rem] leading-7 text-slate-700 dark:text-slate-200">
                  {selectedNews.conteudo?.trim() || selectedNews.resumo || "O conteúdo completo desta notícia ainda não foi informado."}
                </div>
                {selectedNews.fonte && (
                  <p className="mt-8 border-t border-border pt-4 text-sm text-muted-foreground">Fonte: {selectedNews.fonte}</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
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
