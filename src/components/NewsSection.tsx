import { Newspaper } from "lucide-react";

interface NewsItem {
  title: string;
  summary: string;
  date: string;
}

const localNews: NewsItem[] = [
  {
    title: "Prefeitura anuncia obras de pavimentação no bairro Centro",
    summary: "O prefeito confirmou o início das obras de pavimentação em ruas do centro histórico da cidade, beneficiando milhares de moradores.",
    date: "08 de mar. de 2026",
  },
  {
    title: "Festival de inverno movimenta turismo local este fim de semana",
    summary: "O tradicional festival de inverno acontece neste final de semana com shows, gastronomia e artesanato local.",
    date: "08 de mar. de 2026",
  },
  {
    title: "Escola pública conquista primeiro lugar em olimpíada estadual",
    summary: "Alunos da Escola Estadual João Paulo II representam o município com destaque na olimpíada de matemática.",
    date: "08 de mar. de 2026",
  },
  {
    title: "Novo hospital regional é aprovado pelo governo estadual",
    summary: "A aprovação garante investimento de R$ 45 milhões na construção de um novo centro hospitalar para atender a região.",
    date: "08 de mar. de 2026",
  },
];

const NewsSection = () => {
  return (
    <section id="noticias-locais" className="py-12 border-t border-border/30">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-display font-bold">
              Notícias <span className="text-primary">Locais</span>
            </h2>
          </div>
          <a href="#" className="text-sm text-primary hover:underline">
            Ver todas →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {localNews.map((news, i) => (
            <article
              key={i}
              className="card-glass p-5 hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-primary">Impacto FM</span>
                <span className="text-xs text-muted-foreground">{news.date}</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {news.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {news.summary}
              </p>
              <span className="text-sm text-primary font-medium">Ler mais →</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;