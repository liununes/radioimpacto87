import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import { getSlides, type Slide } from "@/lib/radioStore";

const DEFAULT_SLIDES = [
  { image: heroSlide1, title: "Bem-vindo à Impacto FM 87.9" },
  { image: heroSlide2, title: "As melhores músicas, 24 horas" },
  { image: heroSlide3, title: "Notícias da sua região em tempo real" },
];

const HeroCarousel = () => {
  const [slides, setSlides] = useState<{ image: string; title: string }[]>(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      const data = await getSlides();
      if (data && data.length > 0) {
        setSlides(data.map(s => ({ image: s.imagem, title: s.titulo })));
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <section id="home" className="relative h-[75vh] min-h-[500px] overflow-hidden group">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            i === current ? "opacity-100 scale-100" : "opacity-0 scale-110"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-black/20" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className={`transition-all duration-1000 transform ${i === current ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}>
               <span className="text-primary font-black uppercase tracking-[0.6em] text-[10px] mb-6 block drop-shadow-glow">Exclusivo Impacto</span>
               <h2 className="text-5xl md:text-8xl font-black italic text-white uppercase leading-[0.9] tracking-tighter drop-shadow-2xl max-w-5xl">
                {slide.title}
              </h2>
              <div className="mt-12 flex gap-4 justify-center">
                 <button className="btn-premium">Confira Agora</button>
                 <button className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all text-white">Ver Programação</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Layer */}
      <div className="absolute inset-x-0 bottom-0 p-12 flex justify-between items-end">
        {/* Progress Dots */}
        <div className="flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden relative ${
                i === current ? "w-16 bg-primary shadow-[0_0_10px_#ff1e1e]" : "w-4 bg-white/20"
              }`}
            >
               {i === current && <div className="absolute inset-0 bg-white/20 animate-[progress_5s_linear_infinite]" />}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={prev}
            className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all group/btn shadow-xl"
          >
            <ChevronLeft className="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform" />
          </button>
          <button
            onClick={next}
            className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all group/btn shadow-xl"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;