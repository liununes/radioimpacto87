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

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Notícias</h2>
            <p className="text-muted-foreground">Acompanhe as últimas notícias locais e regionais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.imagem && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={item.imagem} 
                    alt={item.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {item.categoria && (
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      item.categoria.toLowerCase() === 'local' ? 'bg-blue-100 text-blue-800' :
                      item.categoria.toLowerCase() === 'regional' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {item.categoria}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2">{item.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.resumo && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.resumo}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.data_postagem).toLocaleDateString('pt-BR')}
                  </div>
                  {item.fonte && (
                    <span className="text-xs">{item.fonte}</span>
                  )}
                </div>

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ler mais
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando notícias...</p>
          </div>
        )}

        {!loading && news.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma notícia encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando sua primeira notícia usando o botão acima.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EnhancedNewsSection;
