import { useState, useEffect } from "react";
import { getSlides } from "@/lib/radioStore";

const HeroCarousel = () => {
  const [slides, setSlides] = useState<{ image: string; title: string; category?: string }[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      const data = await getSlides();
      if (data && data.length > 0) {
        setSlides(data.map(s => ({ 
          image: s.imagem, 
          title: s.titulo || "Novidades na Rede Clube de Rádios",
          category: "PRORROGAÇÃO"
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

  if (slides.length === 0) return null;

  return (
    <section id="home" className="relative h-[90vh] md:h-[85vh] min-h-[700px] overflow-hidden bg-[var(--clube-blue)]">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-1000 ${
            i === current ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm"
          }`}
        >
          {/* Smooth Gradient Overlay with Image Behind */}
          <div className="absolute inset-0 z-0">
             <img
               src={slide.image}
               alt={slide.title}
               className="w-full h-full object-cover object-[center_right]"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-[var(--clube-blue)] via-[var(--clube-blue)]/60 to-[var(--clube-blue)]/10" />
          </div>

          {/* Text Content */}
          <div className="container mx-auto h-full px-12 md:px-20 lg:px-32 flex flex-col justify-center relative z-10">
            <div className="max-w-4xl space-y-10">
               <span className="text-[var(--clube-yellow)] font-black uppercase tracking-[0.4em] text-xs underline decoration-2 underline-offset-8">
                 {slide.category}
               </span>
               <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight drop-shadow-2xl animate-in fade-in slide-in-from-left duration-1000">
                {slide.title}
              </h2>
              <div className="pt-12 flex flex-wrap gap-6 animate-in fade-in slide-in-from-bottom duration-1000">
                 <button className="clube-btn-yellow h-14 px-12 text-sm tracking-widest">
                   LEIA A NOTÍCIA
                 </button>
                 <button className="clube-btn-outline h-14 px-12 text-sm tracking-widest border-2">
                   MAIS NOTÍCIAS!
                 </button>
              </div>
            </div>
          </div>
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