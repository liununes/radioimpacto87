import { useState, useEffect } from "react";
import { Calendar, MapPin, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
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

const EnhancedNewsSection = ({ showNews = true }: EnhancedNewsSectionProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("data_postagem", { ascending: false })
      .limit(20);
    
    if (error) {
      console.error("Erro ao buscar notícias:", error.message);
    } else {
      setNews(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (!showNews) return null;
  const featuredNews = news[0];
  const sidebarNews = news.slice(1, 4);
  const remainingNews = news.slice(4);

  return (
    <section className="py-12 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 border-l-4 border-primary pl-4">
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">Plantão de Notícias</h2>
            <p className="text-muted-foreground font-medium">As principais manchetes da nossa região</p>
          </div>
          <div className="hidden md:block h-1 flex-1 bg-border/20 mx-8 mb-3" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Principal News - Large */}
          {featuredNews && (
            <div className="lg:col-span-8 group">
              <Card className="h-full overflow-hidden border-none shadow-2xl bg-card/40 backdrop-blur-md transition-all duration-500 hover:shadow-primary/5 relative">
                <div className="flex flex-col h-full">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img 
                      src={featuredNews.imagem || ""} 
                      alt={featuredNews.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-6 left-6">
                      {featuredNews.categoria && (
                        <span className="px-4 py-1.5 bg-[var(--primary-gradient)] text-primary-foreground text-xs font-black rounded-lg shadow-xl uppercase tracking-widest">
                          {featuredNews.categoria}
                        </span>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-8 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-primary uppercase tracking-widest mb-4">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(featuredNews.data_postagem).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {featuredNews.fonte && (
                          <>
                            <span className="opacity-30">•</span>
                            <span className="text-muted-foreground">{featuredNews.fonte}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black mb-6 group-hover:text-primary transition-colors leading-[1.1]">
                        {featuredNews.titulo}
                      </h3>
                      {featuredNews.resumo && (
                        <p className="text-muted-foreground mb-8 line-clamp-3 leading-relaxed text-lg">
                          {featuredNews.resumo}
                        </p>
                      )}
                    </div>
                    {featuredNews.url && (
                      <a
                        href={featuredNews.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--primary-gradient)] text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl w-fit"
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

          {/* Sidebar - 3 Smaller News */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Mais Lidas
            </h4>
            {sidebarNews.map((item) => (
              <Card key={item.id} className="overflow-hidden bg-card/20 backdrop-blur-sm border-white/5 hover:bg-card/40 transition-all group cursor-pointer shadow-lg">
                <div className="flex h-32">
                  <div className="w-32 shrink-0 overflow-hidden relative">
                    <img 
                      src={item.imagem || ""} 
                      alt={item.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-4 flex flex-col justify-center gap-2">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{item.categoria || "Geral"}</span>
                    <CardTitle className="text-sm font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {item.titulo}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                       <Calendar className="w-3 h-3" />
                       {new Date(item.data_postagem).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Remaining grid */}
        {remainingNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-border/20">
            {remainingNews.map((item) => (
              <Card key={item.id} className="overflow-hidden bg-white autofill:white/5 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1">
                {item.imagem && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.imagem} 
                      alt={item.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="p-4 pb-2">
                  {item.categoria && (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 block">
                      {item.categoria}
                    </span>
                  )}
                  <CardTitle className="text-sm font-bold line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                    {item.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.data_postagem).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Sintonizando informações...</p>
          </div>
        )}

        {!loading && news.length === 0 && (
          <div className="text-center py-20 bg-card/20 rounded-3xl border border-dashed border-border/50">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">Sem atualizações no momento</h3>
            <p className="text-muted-foreground">Fique ligado para novas manchetes em instantes.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EnhancedNewsSection;
