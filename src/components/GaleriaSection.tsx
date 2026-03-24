import { useState, useEffect } from "react";
import { getFotos, type Foto } from "@/lib/radioStore";
import PhotoLightbox from "./PhotoLightbox";
import { useTheme } from "@/hooks/useTheme";

const GaleriaSection = () => {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const theme = useTheme();

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
    <section id="galeria" className="py-24 bg-white border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-center leading-none" style={{ color: 'var(--text-title)' }}>
            {theme.labels.galleryTitle} <span className="underline decoration-[var(--clube-yellow)]" style={{ color: 'var(--text-detail)' }}>{theme.labels.gallerySubtitle}</span>
          </h2>
          <p className="font-bold uppercase tracking-[0.3em] text-[10px] mt-4" style={{ color: 'var(--text-content)' }}>Fotos e eventos exclusivos</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fotos.map((foto, idx) => (
            <div
              key={foto.id}
              className="aspect-square relative group cursor-pointer rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
              onClick={() => setLightboxIndex(idx)}
            >
              <img
                src={foto.imagem}
                alt={foto.descricao}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                {foto.descricao && (
                  <p className="text-[10px] font-black uppercase text-white tracking-widest leading-tight">
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
