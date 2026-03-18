import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Radio, Clock } from "lucide-react";
import { getProgramas, getLocutores, getProgramaAtual, type Programa, type Locutor } from "@/lib/radioStore";
import PhotoLightbox from "./PhotoLightbox";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const ProgramacaoSection = () => {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [locutores, setLocutores] = useState<Locutor[]>([]);
  const [atual, setAtual] = useState<{ programa: Programa; locutor: Locutor } | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [progs, locs, current] = await Promise.all([
        getProgramas(),
        getLocutores(),
        getProgramaAtual()
      ]);
      setProgramas(progs);
      setLocutores(locs);
      setAtual(current);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getLocutorNome = (id: string) => locutores.find(l => l.id === id)?.nome || "—";
  const getLocutorFoto = (id: string) => locutores.find(l => l.id === id)?.foto || "";

  const images = programas
    .map(p => ({ src: p.foto || getLocutorFoto(p.locutorId), alt: p.nome }))
    .filter(img => img.src);

  if (programas.length === 0) return null;

  // Show only first 6 on homepage
  const displayed = programas.slice(0, 6);

  return (
    <section id="programacao" className="py-12">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Programação
          </h2>
          <Link to="/programacao" className="text-sm text-primary hover:underline font-medium">
            Ver completa →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayed.map((prog) => {
            const isAoVivo = atual?.programa.id === prog.id;
            const foto = prog.foto || getLocutorFoto(prog.locutorId);
            const imgIndex = images.findIndex(img => img.src === foto);

            return (
              <div
                key={prog.id}
                className={`group relative aspect-square rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 shadow-md ${isAoVivo ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
              >
                {foto ? (
                  <img
                    src={foto}
                    alt={prog.nome}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onClick={() => imgIndex >= 0 && setLightboxIndex(imgIndex)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <Radio className="w-10 h-10 text-muted-foreground opacity-20" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90" />

                <div className="absolute inset-0 p-3 flex flex-col justify-end">
                  {isAoVivo && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-destructive text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      AO VIVO
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <h3 className="font-bold text-white text-xs leading-tight group-hover:text-primary transition-colors line-clamp-1">{prog.nome}</h3>
                    <p className="text-[10px] text-white/60 line-clamp-1">{getLocutorNome(prog.locutorId)}</p>
                    <div className="flex items-center gap-1 text-[10px] text-secondary font-bold">
                      <Clock className="w-3 h-3" />
                      {prog.horaInicio}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {programas.length > 6 && (
          <div className="text-center mt-6">
            <Link to="/programacao" className="text-sm text-primary hover:underline font-medium">
              Ver todos os {programas.length} programas →
            </Link>
          </div>
        )}
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
