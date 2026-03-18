import { useState, useEffect } from "react";
import { Radio, Clock, ArrowLeft } from "lucide-react";
import { getProgramas, getLocutores, getProgramaAtual, type Programa, type Locutor } from "@/lib/radioStore";
import PhotoLightbox from "@/components/PhotoLightbox";
import RadioPlayer from "@/components/RadioPlayer";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const DIAS_COMPLETOS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const ProgramacaoPage = () => {
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
  const getLocutorBio = (id: string) => locutores.find(l => l.id === id)?.bio || "";

  const images = programas
    .map(p => ({ src: p.foto || getLocutorFoto(p.locutorId), alt: p.nome }))
    .filter(img => img.src);

  // Group programs by day
  const programasPorDia: Record<number, typeof programas> = {};
  for (let d = 0; d < 7; d++) {
    const progsNoDia = programas.filter(p => p.diasSemana.includes(d));
    if (progsNoDia.length > 0) {
      programasPorDia[d] = progsNoDia.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <RadioPlayer />
      <Navigation />

      <div className="container px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Programação</h1>
        </div>

        {programas.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Nenhum programa cadastrado.</p>
        ) : (
          <div className="space-y-12">
            <div className="flex overflow-x-auto pb-6 gap-6 snap-x no-scrollbar">
              {Object.entries(programasPorDia).map(([dia, progs]) => (
                <div key={dia} className="min-w-[300px] md:min-w-[400px] snap-start">
                  <h2 className="text-xl font-display font-bold text-primary mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-secondary rounded-full" />
                    {DIAS_COMPLETOS[Number(dia)]}
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {progs.map(prog => {
                      const isAoVivo = atual?.programa.id === prog.id;
                      const foto = prog.foto || getLocutorFoto(prog.locutorId);
                      const imgIndex = images.findIndex(img => img.src === foto);

                      return (
                        <div
                          key={`${dia}-${prog.id}`}
                          className={`group relative aspect-square rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 shadow-lg ${isAoVivo ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
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
                              <Radio className="w-12 h-12 text-muted-foreground opacity-20" />
                            </div>
                          )}

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />

                          {/* Content */}
                          <div className="absolute inset-0 p-4 flex flex-col justify-end">
                            {isAoVivo && (
                              <div className="absolute top-3 left-3 flex items-center gap-1 bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                AO VIVO
                              </div>
                            )}

                            <div className="space-y-1">
                              <h3 className="font-bold text-white text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">{prog.nome}</h3>
                              <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider">{getLocutorNome(prog.locutorId)}</p>
                              
                              <div className="flex items-center gap-1.5 pt-1 text-xs text-secondary font-bold">
                                <Clock className="w-3 h-3" />
                                {prog.horaInicio} - {prog.horaFim}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-2">
               {Object.keys(programasPorDia).map((_, i) => (
                 <div key={i} className="w-1.5 h-1.5 rounded-full bg-border" />
               ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {lightboxIndex !== null && (
        <PhotoLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
};

export default ProgramacaoPage;
