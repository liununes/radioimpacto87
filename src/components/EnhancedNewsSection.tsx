import { useState, useEffect } from "react";
import { Calendar, ExternalLink, ImageIcon, PlayCircle, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export const FeaturedNews = ({ news, loading }: { news: NewsItem[], loading: boolean }) => {
  const theme = useTheme();
  const featured = news[0];
  const sidebar = news.slice(1, 4);
  const [videosOpen, setVideosOpen] = useState(false);

  if (!featured && !loading) return null;

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-l-[12px] pl-6" style={{ borderColor: 'var(--plantao-line)' }}>
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none" style={{ color: 'var(--plantao-title)' }}>
            {theme.labels.newsTitle} <span className="underline" style={{ color: 'var(--plantao-subtitle)', textDecorationColor: 'var(--nav-item-active)' }}>{theme.labels.newsSubtitle}</span>
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Destaques e últimas notícias</p>
        </div>
        <div className="hidden md:block h-0.5 flex-1 bg-gray-100 mx-12 mb-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {featured && (
          <div 
            className="lg:col-span-8 group cursor-pointer"
            onClick={() => featured.url && window.open(featured.url, '_blank')}
          >
            <Card className="h-full relative overflow-hidden rounded-3xl border-none shadow-2xl hover:shadow-primary/10 transition-all duration-500">
              <div className="flex flex-col h-full">
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img 
                    src={featured.imagem || ""} 
                    alt={featured.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute top-8 left-8">
                    {featured.categoria && (
                      <span className="px-6 py-2 bg-accent text-white text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest">
                        {featured.categoria}
                      </span>
                    )}
                  </div>
                </div>
                <CardContent className="p-10 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black mb-3 transition-colors leading-[1.15] tracking-tight" style={{ color: 'var(--text-title)' }}>
                      {featured.titulo}
                    </h3>
                  </div>
                  {featured.resumo && (
                    <p className="text-gray-500 mb-5 line-clamp-4 text-sm md:text-base leading-relaxed font-normal">
                      {featured.resumo}
                    </p>
                  )}
                  {featured.url && (
                    <div className="clube-btn-yellow w-fit">
                      LER NOTÍCIA
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>
        )}

        {/* Sidebar News Grid */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="rounded-2xl border border-gray-200/80 bg-white/70 p-4 shadow-sm">
            <div className="mb-3">
              <h4 className="text-[9px] font-extrabold text-accent uppercase tracking-[0.12em]">
                VÍDEOS E MAIS
              </h4>
              <p className="mt-1 text-[10px] leading-relaxed text-gray-500">
                Acompanhe outros destaques da Impacto FM.
              </p>
            </div>
            <div className="space-y-2">
              {sidebar.slice(0, 2).map((item) => (
                <p key={item.id} className="line-clamp-1 text-[11px] font-semibold leading-snug" style={{ color: 'var(--plantao-card-text)' }}>
                  {item.titulo}
                </p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setVideosOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--nav-item-active)] px-4 py-2 text-[10px] font-extrabold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            >
              <PlayCircle className="h-4 w-4" />
              Ver conteúdos
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <Dialog open={videosOpen} onOpenChange={setVideosOpen}>
            <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-0 text-gray-900 shadow-2xl sm:max-w-xl">
              <DialogHeader className="border-b border-gray-100 px-6 py-5 text-left">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-accent">Impacto FM</p>
                <DialogTitle className="text-xl font-black tracking-tight text-gray-900">Vídeos e mais</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Outros destaques e conteúdos publicados pela rádio.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 px-6 py-5">
                {sidebar.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {item.imagem && (
                      <div className="aspect-video max-h-48 overflow-hidden bg-gray-100">
                        <img src={item.imagem} alt={item.titulo} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      {item.categoria && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-accent">{item.categoria}</span>
                      )}
                      <h3 className="mt-1 text-sm font-bold leading-snug text-gray-900">{item.titulo}</h3>
                      {item.resumo && <p className="mt-2 text-xs leading-relaxed text-gray-600">{item.resumo}</p>}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">
                          Acessar conteúdo <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
                {sidebar.length === 0 && <p className="py-8 text-center text-sm text-gray-500">Novos conteúdos serão exibidos aqui.</p>}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export const RemainingNews = ({ news, loading, showAll = false }: { news: NewsItem[], loading: boolean, showAll?: boolean }) => {
  const remaining = showAll ? news : news.slice(4);

  if (remaining.length === 0 && !loading) return null;

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50/50 rounded-3xl my-8 shadow-inner">
      <div className="flex items-center gap-3 mb-7">
        <h2 className="text-xs font-extrabold tracking-tight shrink-0" style={{ color: 'var(--text-title)' }}>CONTEÚDOS</h2>
        <div className="h-0.5 w-full bg-gray-200" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {remaining.map((item) => (
          <Card 
            key={item.id} 
            className="group hover:-translate-y-1 cursor-pointer transition-all duration-300 border-none shadow-md rounded-xl overflow-hidden bg-white"
            onClick={() => item.url && window.open(item.url, '_blank')}
          >
            {item.imagem && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={item.imagem} 
                  alt={item.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            )}
            <CardHeader className="p-4 pb-2">
              <span className="text-[8px] font-bold text-accent uppercase tracking-wider mb-2 block">
                {item.categoria || "LOCAL"}
              </span>
              <CardTitle className="text-xs font-semibold line-clamp-2 hover:underline tracking-tight leading-snug" style={{ color: 'var(--text-title)' }}>
                {item.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {item.resumo && (
                <p className="text-[10px] leading-snug text-gray-600 line-clamp-2 mb-2">
                  {item.resumo}
                </p>
              )}
               <div className="text-[9px] font-bold text-gray-400 uppercase">{new Date(item.data_postagem || new Date()).toLocaleDateString('pt-BR')}</div>
            </CardContent>
          </Card>
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
