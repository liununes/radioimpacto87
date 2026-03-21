import { useState, useEffect } from "react";
import { Calendar, ExternalLink, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

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
  const featured = news[0];
  const sidebar = news.slice(1, 4);

  if (!featured && !loading) return null;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-12 border-l-8 border-primary pl-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none">Plantão <span className="text-primary italic">Clube</span></h2>
          <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] mt-2">As principais manchetes da nossa região</p>
        </div>
        <div className="hidden md:block h-px flex-1 bg-white/5 mx-12 mb-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {featured && (
          <div className="lg:col-span-8 group">
            <Card className="card-premium h-full relative">
              <div className="flex flex-col h-full">
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img 
                    src={featured.imagem || ""} 
                    alt={featured.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute top-8 left-8">
                    {featured.categoria && (
                      <span className="px-6 py-2 bg-primary text-white text-[10px] font-black italic rounded-xl shadow-2xl uppercase tracking-[0.2em]">
                        {featured.categoria}
                      </span>
                    )}
                  </div>
                </div>
                <CardContent className="p-10 flex flex-col justify-between flex-1 bg-gradient-to-b from-transparent to-black/40">
                  <div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(featured.data_postagem).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black italic mb-8 group-hover:text-primary transition-colors leading-[0.95] uppercase tracking-tighter">
                      {featured.titulo}
                    </h3>
                  </div>
                  {featured.url && (
                    <a
                      href={featured.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-premium w-fit"
                    >
                      Ler Notícia Completa
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>
        )}

        <div className="lg:col-span-4 flex flex-col gap-8">
          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#ff1e1e]" />
            MAIS LIDAS
          </h4>
          {sidebar.map((item) => (
            <Card key={item.id} className="card-premium h-32 group cursor-pointer border-white/5">
              <div className="flex h-full">
                <div className="w-32 shrink-0 overflow-hidden relative">
                  <img 
                    src={item.imagem || ""} 
                    alt={item.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <CardContent className="p-5 flex flex-col justify-center gap-1.5 flex-1 bg-black/20">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{item.categoria || "GERAL"}</span>
                  <CardTitle className="text-sm font-black italic line-clamp-2 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">
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
    <div className="container mx-auto px-4 py-20 border-t border-white/5">
      <div className="flex items-center gap-4 mb-16">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase shrink-0">Últimas do Portal</h2>
        <div className="h-px w-full bg-white/5" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {remaining.map((item) => (
          <Card key={item.id} className="card-premium group hover:-translate-y-2">
            {item.imagem && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={item.imagem} 
                  alt={item.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            )}
            <CardHeader className="p-8 pb-3">
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-3 block">
                {item.categoria || "INFORMAÇÃO"}
              </span>
              <CardTitle className="text-lg font-black italic line-clamp-2 group-hover:text-primary transition-colors cursor-pointer uppercase tracking-tight leading-tight">
                {item.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="flex items-center gap-2 text-[10px] font-black text-foreground/30 uppercase tracking-[0.1em]">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(item.data_postagem).toLocaleDateString('pt-BR')}
              </div>
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
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6 shadow-[0_0_20px_#ff1e1e]"></div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Sintonizando informações...</p>
        </div>
      )}
      <RemainingNews news={news} loading={loading} />
    </section>
  );
};

export default EnhancedNewsSection;
