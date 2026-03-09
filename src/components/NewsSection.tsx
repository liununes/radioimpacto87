import { useState } from "react";
import { Newspaper } from "lucide-react";
import { getNoticias } from "@/lib/noticiasStore";

const NewsSection = () => {
  const [tab, setTab] = useState<"local" | "regional">("local");
  const allNoticias = getNoticias();
  const noticias = allNoticias.filter(n => n.categoria === tab);

  // Fallback static data if no admin news
  const fallbackLocal = [
    { id: "f1", titulo: "Prefeitura anuncia obras de pavimentação no bairro Centro", resumo: "O prefeito confirmou o início das obras de pavimentação em ruas do centro histórico da cidade.", data: "08/03/2026", categoria: "local" as const, conteudo: "" },
    { id: "f2", titulo: "Festival de inverno movimenta turismo local", resumo: "O tradicional festival de inverno acontece neste final de semana com shows e gastronomia.", data: "08/03/2026", categoria: "local" as const, conteudo: "" },
  ];

  const displayNoticias = noticias.length > 0 ? noticias : (tab === "local" ? fallbackLocal : []);

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
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("local")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === "local" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            Notícias Locais
          </button>
          <button
            onClick={() => setTab("regional")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === "regional" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            Notícias Regionais
          </button>
        </div>

        {displayNoticias.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayNoticias.map((news) => (
              <article
                key={news.id}
                className="card-glass p-5 hover:border-primary/30 transition-all group cursor-pointer"
              >
                {('imagem' in news) && news.imagem && (
                  <img src={news.imagem} alt={news.titulo} className="w-full h-32 object-cover rounded-md mb-3" />
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-primary">Impacto FM</span>
                  <span className="text-xs text-muted-foreground">{news.data}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {news.titulo}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {news.resumo}
                </p>
                <span className="text-sm text-primary font-medium">Ler mais →</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma notícia {tab === "local" ? "local" : "regional"} cadastrada.
          </p>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
