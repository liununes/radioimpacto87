import { useState, useEffect } from "react";
import { Calendar, ExternalLink, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";

// ... previous interfaces
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

  if (!featured && !loading) return null;

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-l-[12px] border-primary pl-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase leading-none">
            {theme.labels.newsTitle} <span className="text-accent underline decoration-[var(--clube-yellow)]">{theme.labels.newsSubtitle}</span>
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Destaques e últimas notícias</p>
        </div>
        <div className="hidden md:block h-0.5 flex-1 bg-gray-100 mx-12 mb-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {featured && (
          <div className="lg:col-span-8 group">
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
                    <h3 className="text-3xl md:text-4xl font-black mb-6 group-hover:text-primary transition-colors leading-[1.1] uppercase tracking-tight text-primary">
                      {featured.titulo}
                    </h3>
                  </div>
                  {featured.url && (
                    <a
                      href={featured.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="clube-btn-yellow w-fit"
                    >
                      LER NOTÍCIA
                    </a>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>
        )}

        {/* Sidebar News Grid */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-2 flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
            VÍDEOS E MAIS
          </h4>
          {sidebar.map((item) => (
            <Card key={item.id} className="h-32 group cursor-pointer border-none shadow-lg rounded-2xl overflow-hidden hover:scale-[1.02] transition-all">
              <div className="flex h-full bg-white">
                <div className="w-32 shrink-0 overflow-hidden relative">
                  <img 
                    src={item.imagem || ""} 
                    alt={item.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <CardContent className="p-4 flex flex-col justify-center gap-1.5 flex-1">
                  <span className="text-[9px] font-black text-accent uppercase">{item.categoria || "NEWS"}</span>
                  <CardTitle className="text-sm font-black text-primary line-clamp-2 leading-tight uppercase tracking-tight">
                    {item.titulo}
                  </CardTitle>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RemainingNews = ({ news, loading }: { news: NewsItem[], loading: boolean }) => {
  const remaining = news.slice(4);

  if (remaining.length === 0 && !loading) return null;

  return (
    <div className="container mx-auto px-4 py-20 bg-gray-50/50 rounded-[3rem] my-12 shadow-inner">
      <div className="flex items-center gap-4 mb-16">
        <h2 className="text-2xl font-black text-primary uppercase tracking-tighter shrink-0">MAIS NOTÍCIAS</h2>
        <div className="h-0.5 w-full bg-gray-200" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {remaining.map((item) => (
          <Card key={item.id} className="group hover:-translate-y-2 transition-all duration-500 border-none shadow-xl rounded-2xl overflow-hidden bg-white">
            {item.imagem && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={item.imagem} 
                  alt={item.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            )}
            <CardHeader className="p-6 pb-2">
              <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-3 block">
                {item.categoria || "LOCAL"}
              </span>
              <CardTitle className="text-base font-black text-primary line-clamp-2 hover:underline cursor-pointer uppercase tracking-tight leading-tight">
                {item.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
               <div className="text-[10px] font-bold text-gray-300 uppercase">{new Date(item.data_postagem).toLocaleDateString('pt-BR')}</div>
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
      {loading && (
        <div className="container mx-auto px-4 text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-xs font-black uppercase text-accent">CARREGANDO...</p>
        </div>
      )}
      <RemainingNews news={news} loading={loading} />
    </section>
  );
};

export default EnhancedNewsSection;
