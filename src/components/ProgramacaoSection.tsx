import { useState } from "react";
import { Radio, Clock } from "lucide-react";
import { getProgramas, getLocutores, getProgramaAtual } from "@/lib/radioStore";
import PhotoLightbox from "./PhotoLightbox";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const ProgramacaoSection = () => {
  const programas = getProgramas();
  const locutores = getLocutores();
  const atual = getProgramaAtual();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const getLocutorNome = (id: string) => locutores.find(l => l.id === id)?.nome || "—";
  const getLocutorFoto = (id: string) => locutores.find(l => l.id === id)?.foto || "";

  const images = programas
    .map(p => ({ src: p.foto || getLocutorFoto(p.locutorId), alt: p.nome }))
    .filter(img => img.src);

  if (programas.length === 0) return null;

  return (
    <section id="programacao" className="py-12">
      <div className="container px-4">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-center">
          Programação
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programas.map((prog, idx) => {
            const isAoVivo = atual?.programa.id === prog.id;
            const foto = prog.foto || getLocutorFoto(prog.locutorId);
            const imgIndex = images.findIndex(img => img.src === foto);

            return (
              <div
                key={prog.id}
                className={`card-glass p-4 flex items-center gap-4 relative overflow-hidden ${isAoVivo ? "ring-2 ring-primary" : ""}`}
              >
                {isAoVivo && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-destructive/90 text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive-foreground" />
                    AO VIVO
                  </div>
                )}

                {foto ? (
                  <img
                    src={foto}
                    alt={prog.nome}
                    className="w-16 h-16 rounded-lg object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => imgIndex >= 0 && setLightboxIndex(imgIndex)}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <Radio className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{prog.nome}</h3>
                  <p className="text-xs text-muted-foreground">{getLocutorNome(prog.locutorId)}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
                    <Clock className="w-3 h-3" />
                    {prog.horaInicio} - {prog.horaFim}
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {prog.diasSemana.sort().map(d => (
                      <span key={d} className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{DIAS[d]}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
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

export default ProgramacaoSection;
