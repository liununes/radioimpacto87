import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { getSlides, type Slide } from "@/lib/radioStore";

const HeroCarousel = () => {
  const [slides, setSlides] = useState<{ image: string; title: string; category?: string }[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      const data = await getSlides();
      if (data && data.length > 0) {
        setSlides(data.map(s => ({ 
          image: s.imagem, 
          title: s.titulo,
          category: "DESTAQUE"
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
    <section id="home" className="relative h-[85vh] min-h-[600px] overflow-hidden bg-[var(--clube-blue)]">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Main Background Image - Right Side Mostly */}
          <div className="absolute right-0 top-0 bottom-0 w-[65%] lg:w-[75%] clip-path-hero">
             <img
               src={slide.image}
               alt={slide.title}
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-[var(--clube-blue)] via-[var(--clube-blue)]/40 to-transparent" />
          </div>

          {/* Left Content Area */}
          <div className="container mx-auto h-full px-6 flex flex-col justify-center relative z-10">
            <div className="max-w-xl md:max-w-2xl lg:max-w-3xl space-y-6">
               <span className="text-[var(--clube-yellow)] font-bold uppercase tracking-[0.2em] text-xs border-l-4 border-[var(--clube-yellow)] pl-3">
                 {slide.category}
               </span>
               <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-xl animate-in fade-in slide-in-from-left duration-700">
                {slide.title}
              </h2>
              <div className="pt-8 flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom duration-1000">
                 <button className="clube-btn-yellow px-10 py-3 text-xs tracking-[0.2em] font-black">
                   LEIA A NOTÍCIA
                 </button>
                 <button className="clube-btn-outline px-10 py-3 text-xs tracking-[0.2em] font-black">
                   MAIS NOTÍCIAS!
                 </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators - Bottom Lines */}
      <div className="absolute bottom-32 left-0 right-0 z-20">
        <div className="container mx-auto px-6 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-0.5 transition-all duration-300 ${
                i === current ? "w-24 bg-[var(--clube-yellow)] shadow-[0_0_10px_rgba(255,237,50,0.5)]" : "w-12 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
      
      <style>{`
        .clip-path-hero {
          clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%);
        }
      `}</style>
    </section>
  );
};

export default HeroCarousel;