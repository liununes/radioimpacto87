import { useTheme } from "@/hooks/useTheme";
import { ExternalLink } from "lucide-react";

const PromosSection = () => {
  const theme = useTheme();
  const promos = (theme.promos || []).filter(p => p.ativa);

  if (!theme.showPromos || promos.length === 0) return null;

  return (
    <section id="promocoes" className="py-32 bg-white dark:bg-gray-950 border-y border-gray-50 dark:border-gray-900 transition-all duration-700">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <span className="text-[10px] font-black uppercase tracking-[0.5em] block mb-2" style={{ color: 'var(--text-detail)' }}>Participe</span>
           <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none mb-4" style={{ color: 'var(--text-title)' }}>Promoções <span className="underline underline-offset-8" style={{ color: 'var(--text-detail)' }}>Ativas</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {promos.map((promo) => (
            <div 
              key={promo.id} 
              className="group relative bg-gray-50 dark:bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-pink-500/10 hover:scale-[1.02] active:scale-95 border border-gray-100 dark:border-gray-800"
            >
              <div className="aspect-[4/5] relative overflow-hidden">
                <img 
                  src={promo.imagem} 
                  alt={promo.titulo} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-10">
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">{promo.titulo}</h3>
                   {promo.link && (
                     <a 
                       href={promo.link}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="h-16 bg-accent text-white rounded-2xl flex items-center justify-center gap-4 font-black uppercase text-xs tracking-widest shadow-xl hover:bg-white hover:text-accent transition-all"
                     >
                        Quero Ganhar <ExternalLink className="w-4 h-4" />
                     </a>
                   )}
                </div>
              </div>
              <div className="p-10 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                 <h4 className="text-xl font-black text-primary uppercase tracking-tighter truncate italic">{promo.titulo}</h4>
                 <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aproveite agora</span>
                    <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                       <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse delay-75" />
                       <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse delay-150" />
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromosSection;
