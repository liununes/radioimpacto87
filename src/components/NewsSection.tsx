import { useState, useEffect } from "react";
import { Newspaper, ExternalLink } from "lucide-react";
import { getNoticias, getCategorias, type Noticia } from "@/lib/noticiasStore";

const NewsSection = () => {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [tab, setTab] = useState("");
  const [allNoticias, setAllNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const [newsData, cats] = await Promise.all([getNoticias(), getCategorias()]);
      setAllNoticias(newsData);
      setCategorias(cats);
      if (cats.length > 0) setTab(cats[0]);
      setLoading(false);
    };
    fetchNews();
  }, []);

  const noticias = allNoticias.filter(n => n.categoria === tab);

  return (
    <section id="noticias-locais" className="py-12 border-t border-border/30">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-display font-bold text-foreground">Notícias</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setTab(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {noticias.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {noticias.map((news) => (
              <article
                key={news.id}
                className="card-glass p-5 hover:border-primary/30 transition-all group cursor-pointer"
                onClick={() => news.url && window.open(news.url, '_blank')}
              >
                {news.imagem && (
                  <img src={news.imagem} alt={news.titulo} className="w-full h-32 object-cover rounded-md mb-3" />
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-primary">{news.fonte || "Impacto FM"}</span>
                  <span className="text-xs text-muted-foreground">{news.data}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {news.titulo}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {news.resumo}
                </p>
                <div className="flex items-center gap-1 text-sm text-primary font-medium">
                  Ler mais
                  {news.url && <ExternalLink className="w-3 h-3" />}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma notícia cadastrada na categoria "{tab}".
          </p>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
