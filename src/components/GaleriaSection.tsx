import { useState, useEffect } from "react";
import { getFotos, type Foto } from "@/lib/radioStore";
import PhotoLightbox from "./PhotoLightbox";

const GaleriaSection = () => {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFotos = async () => {
      const data = await getFotos();
      setFotos(data);
    };
    fetchFotos();
  }, []);

  if (fotos.length === 0) return null;

  const images = fotos.map(f => ({ src: f.imagem, alt: f.descricao || "Foto" }));

  return (
    <section id="galeria" className="py-24 bg-black/40">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-center leading-none">
            Momentos <span className="text-primary italic">Impacto</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary mt-6 rounded-full shadow-[0_0_15px_#ff1e1e]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {fotos.map((foto, idx) => (
            <div
              key={foto.id}
              className="card-premium aspect-square relative group cursor-pointer border-white/5"
              onClick={() => setLightboxIndex(idx)}
            >
              <img
                src={foto.imagem}
                alt={foto.descricao}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                {foto.descricao && (
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white animate-in slide-in-from-bottom-2">
                    {foto.descricao}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
};

export default GaleriaSection;
