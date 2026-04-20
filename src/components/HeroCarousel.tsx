import { useState, useEffect } from "react";
import { getSlides } from "@/lib/radioStore";
import { useTheme } from "@/hooks/useTheme";

const HeroCarousel = () => {
  const [slides, setSlides] = useState<{ image: string; title: string; category?: string; link?: string }[]>([]);
  const [current, setCurrent] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const fetchSlides = async () => {
      const data = await getSlides();
      if (data && data.length > 0) {
        setSlides(data.map(s => ({ 
          image: s.imagem, 
          title: s.titulo,
          category: "DESTAQUE",
          link: s.link
        })));
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, 7000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  if (slides.length === 0) {
    // Placeholder slide if empty
    return (
      <section id="home" className="relative h-[60vh] md:h-[70vh] min-h-[500px] overflow-hidden bg-[var(--clube-blue)]">
         <div className="absolute inset-0 flex items-center justify-center text-center p-20">
            <div className="space-y-6">
               <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">O Melhor da Música <br/><span className="text-[var(--clube-yellow)]">Sintonize com a gente</span></h2>
               <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-xs">Seu portal de notícias e entretenimento</p>
            </div>
         </div>
         <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 pointer-events-none" />
      </section>
    );
  }

  return (
    <section id="home" className="relative h-[90vh] md:h-[85vh] min-h-[700px] overflow-hidden bg-[var(--clube-blue)]">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-1000 ${
            i === current ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm"
          }`}
        >
          {/* Smooth Gradient Overlay with Image Behind - Removed overlay per user request */}
          <div className="absolute inset-0 z-0">
             <img
               src={slide.image}
               alt={slide.title}
               className="w-full h-full object-cover object-[center_right]"
             />
          </div>

          {/* Text Content - Only show if title exists */}
          {slide.title && (
            <div className="container mx-auto h-full px-12 md:px-20 lg:px-32 flex flex-col justify-center relative z-10">
              <div className="max-w-4xl space-y-10">
                 <span className="text-[var(--clube-yellow)] font-black uppercase tracking-[0.4em] text-xs underline decoration-2 underline-offset-8">
                   {slide.category}
                 </span>
                 <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight drop-shadow-2xl animate-in fade-in slide-in-from-left duration-1000">
                  {slide.title}
                </h2>
                <div className="pt-12 flex flex-wrap gap-6 animate-in fade-in slide-in-from-bottom duration-1000">
                   {slide.link ? (
                      <a href={slide.link} target="_blank" rel="noopener noreferrer">
                        <button className="clube-btn-yellow h-14 px-12 text-sm tracking-widest">
                          {theme.labels.heroReadMore}
                        </button>
                      </a>
                   ) : (
                      <button className="clube-btn-yellow h-14 px-12 text-sm tracking-widest">
                        {theme.labels.heroReadMore}
                      </button>
                   )}
                   <a href="#noticias">
                     <button className="clube-btn-outline h-14 px-12 text-sm tracking-widest border-2">
                       {theme.labels.heroMoreNews}
                     </button>
                   </a>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Slide Indicators - Exactly as photo */}
      <div className="absolute bottom-40 md:bottom-32 left-0 right-0 z-20">
        <div className="container mx-auto px-12 md:px-20 lg:px-32 flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`hero-indicator ${
                i === current ? "hero-indicator-active shadow-[0_0_15px_rgba(255,237,50,0.4)]" : "w-12 h-1 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;