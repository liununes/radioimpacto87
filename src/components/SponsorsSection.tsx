import { useTheme } from "@/hooks/useTheme";
import { Card, CardContent } from "./ui/card";

const SponsorsSection = () => {
  const theme = useTheme();
  const sponsors = theme.sponsors || [];

  if (!theme.showSponsors || sponsors.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-[10px] font-black text-accent uppercase tracking-[0.5em] block mb-2">Parceiros</span>
          <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase italic leading-none">Nossos Patrocinadores</h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.url || "#"}
              target={sponsor.url ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group relative transition-all duration-500 hover:scale-110"
              title={sponsor.nome}
            >
              <div className="w-32 h-32 md:w-44 md:h-44 bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center grayscale hover:grayscale-0 transition-all group-hover:shadow-orange-500/10 active:scale-95">
                <img
                  src={sponsor.logo}
                  alt={sponsor.nome}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-md border border-gray-50 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[9px] font-black uppercase tracking-widest text-[#002e5d] dark:text-white">{sponsor.nome}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
