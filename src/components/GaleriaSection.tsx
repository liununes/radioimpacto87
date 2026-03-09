import { useState } from "react";
import { getFotos } from "@/lib/radioStore";
import PhotoLightbox from "./PhotoLightbox";

const GaleriaSection = () => {
  const fotos = getFotos();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (fotos.length === 0) return null;

  const images = fotos.map(f => ({ src: f.imagem, alt: f.descricao || "Foto" }));

  return (
    <section id="galeria" className="py-12">
      <div className="container px-4">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-center">
          Galeria de Fotos
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {fotos.map((foto, idx) => (
            <div
              key={foto.id}
              className="relative group rounded-lg overflow-hidden border border-border cursor-pointer"
              onClick={() => setLightboxIndex(idx)}
            >
              <img
                src={foto.imagem}
                alt={foto.descricao}
                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {foto.descricao && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/80 to-transparent p-2">
                  <p className="text-xs text-foreground truncate">{foto.descricao}</p>
                </div>
              )}
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
