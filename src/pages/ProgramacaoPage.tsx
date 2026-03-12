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
          <div className="space-y-8">
            {Object.entries(programasPorDia).map(([dia, progs]) => (
              <div key={dia}>
                <h2 className="text-lg font-display font-bold text-secondary mb-4 border-b border-border/30 pb-2">
                  {DIAS_COMPLETOS[Number(dia)]}
                </h2>
                <div className="space-y-3">
                  {progs.map(prog => {
                    const isAoVivo = atual?.programa.id === prog.id;
                    const foto = prog.foto || getLocutorFoto(prog.locutorId);
                    const imgIndex = images.findIndex(img => img.src === foto);
                    const bio = getLocutorBio(prog.locutorId);

                    return (
                      <div
                        key={`${dia}-${prog.id}`}
                        className={`card-glass p-5 flex items-start gap-5 relative overflow-hidden ${isAoVivo ? "ring-2 ring-primary" : ""}`}
                      >
                        {isAoVivo && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-destructive/90 text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-destructive-foreground" />
                            AO VIVO
                          </div>
                        )}

                        {foto ? (
                          <img
                            src={foto}
                            alt={prog.nome}
                            className="w-24 h-24 rounded-xl object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                            onClick={() => imgIndex >= 0 && setLightboxIndex(imgIndex)}
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center shrink-0">
                            <Radio className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-lg">{prog.nome}</h3>
                          <p className="text-sm text-muted-foreground">{getLocutorNome(prog.locutorId)}</p>
                          <div className="flex items-center gap-1.5 mt-2 text-sm text-secondary font-medium">
                            <Clock className="w-4 h-4" />
                            {prog.horaInicio} - {prog.horaFim}
                          </div>
                          {bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{bio}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
