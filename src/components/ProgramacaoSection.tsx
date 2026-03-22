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

        <div className="flex w-full overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar scroll-smooth">
          {displayed.map((prog) => {
            const isAoVivo = atual?.programa.id === prog.id;
            const foto = prog.foto || getLocutorFoto(prog.locutorId);
            const imgIndex = images.findIndex(img => img.src === foto);

            return (
              <div
                key={prog.id}
                className={`flex-none w-[200px] md:w-[240px] snap-center group relative aspect-[3/4] rounded-3xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 shadow-xl ${isAoVivo ? "ring-4 ring-primary ring-offset-4 ring-offset-background" : ""}`}
              >
                {foto ? (
                  <img
                    src={foto}
                    alt={prog.nome}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onClick={() => imgIndex >= 0 && setLightboxIndex(imgIndex)}
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <Radio className="w-12 h-12 text-muted-foreground opacity-20" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90" />

                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  {isAoVivo && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-accent text-white text-[9px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      AO VIVO
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-black text-white text-base md:text-lg leading-tight group-hover:text-accent transition-colors line-clamp-2 uppercase italic tracking-tighter">{prog.nome}</h3>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{getLocutorNome(prog.locutorId)}</p>
                    <div className="flex items-center gap-2 text-accent font-black text-[11px] mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      {prog.horaInicio} - {prog.horaFim}
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
