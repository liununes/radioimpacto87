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
  const otherNews = news.slice(1);

  return (
    <section className="py-12 w-full">
      <div className="px-4 mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Notícias em Destaque</h2>
        <p className="text-muted-foreground">Acompanhe as últimas notícias locais e regionais</p>
      </div>

      {featuredNews && (
        <div className="mb-12">
          <Card className="mx-4 overflow-hidden border-none shadow-xl bg-card/60 backdrop-blur-md hover:shadow-2xl transition-all duration-500 group">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-video lg:aspect-auto overflow-hidden relative">
                <img 
                  src={featuredNews.imagem || ""} 
                  alt={featuredNews.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  {featuredNews.categoria && (
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg">
                      {featuredNews.categoria}
                    </span>
                  )}
                </div>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  {new Date(featuredNews.data_postagem).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {featuredNews.fonte && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{featuredNews.fonte}</span>
                    </>
                  )}
                </div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                  {featuredNews.titulo}
                </h3>
                {featuredNews.resumo && (
                  <p className="text-lg text-muted-foreground mb-8 line-clamp-4 leading-relaxed">
                    {featuredNews.resumo}
                  </p>
                )}
                {featuredNews.url && (
                  <a
                    href={featuredNews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary-gradient)] text-primary-foreground rounded-full font-bold hover:opacity-90 transition-all shadow-lg w-fit"
                  >
                    Ler matéria completa
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </CardContent>
            </div>
          </Card>
        </div>
      )}

      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherNews.map((item) => (
            <Card key={item.id} className="overflow-hidden bg-card/40 backdrop-blur-sm hover:shadow-lg transition-all hover:-translate-y-1">
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
                <CardTitle className="text-base line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                  {item.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.data_postagem).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando notícias...</p>
        </div>
      )}

      {!loading && news.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Ainda não há notícias hoje</h3>
          <p className="text-muted-foreground">Fique ligado para as atualizações da nossa rádio!</p>
        </div>
      )}
    </section>
  );
};

export default EnhancedNewsSection;
