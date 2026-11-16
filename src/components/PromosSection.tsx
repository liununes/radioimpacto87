import { useTheme } from "@/hooks/useTheme";
import { ExternalLink, Radio } from "lucide-react";

const PromosSection = () => {
  const theme = useTheme();
  const promos = (theme.promos || []).filter(p => p.ativa);

  if (!theme.showPromos || promos.length === 0) return null;

  return (
    <section id="promocoes" className="py-20 md:py-24 bg-slate-50 dark:bg-gray-950 border-y border-slate-200/70 dark:border-gray-900 transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#ffed32]/20 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#002e5d] dark:text-[#ffed32] mb-5">
            <Radio className="w-4 h-4" />
            Participe e concorra
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none text-[#002e5d] dark:text-white">
            PROMOÇÃO <span className="text-[#e5a900] dark:text-[#ffed32]">NO AR!</span>
          </h2>
          <div className="mt-5 h-1 w-16 rounded-full bg-[#ffed32]" />
        </div>

        <div className="flex flex-wrap items-start justify-center gap-7 md:gap-9">
          {promos.map((promo) => {
            const isVertical = promo.formato === "9:16";
            return (
              <article
                key={promo.id}
                className={`group w-full ${isVertical ? "max-w-[360px]" : "max-w-[760px]"} overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className={`relative w-full ${isVertical ? "aspect-[9/16]" : "aspect-video"} overflow-hidden bg-slate-100 dark:bg-gray-950 flex items-center justify-center`}>
                  {promo.imagem ? (
                    <img
                      src={promo.imagem}
                      alt={promo.titulo}
                      className="h-full w-full object-contain object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                      Imagem da promoção
                    </div>
                  )}
                  {promo.link && (
                    <a
                      href={promo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Participar: ${promo.titulo}`}
                      className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/85 to-transparent px-5 pb-5 pt-14 text-sm font-extrabold uppercase tracking-wider text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus:opacity-100"
                    >
                      Quero participar <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 dark:border-gray-800 px-5 py-4 sm:px-6">
                  <h3 className="min-w-0 truncate text-base sm:text-lg font-extrabold tracking-tight text-[#002e5d] dark:text-white">
                    {promo.titulo}
                  </h3>
                  {promo.link && (
                    <a
                      href={promo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#ffed32] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-[#002e5d] transition-colors hover:bg-[#ffdb00]"
                    >
                      Participar <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PromosSection;
