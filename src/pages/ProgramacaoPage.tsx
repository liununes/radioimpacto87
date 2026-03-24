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
    <div className="min-h-screen bg-[#f8f9fa] pb-32">
      <Navigation />

      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center gap-6 mb-16">
          <Link to="/" className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-md flex items-center justify-center hover:bg-gray-50 transition-all group">
            <ArrowLeft className="w-6 h-6 text-primary group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <span className="font-black uppercase tracking-[0.5em] text-[10px] mb-2 block" style={{ color: 'var(--text-detail)' }}>HORÁRIOS</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none" style={{ color: 'var(--text-title)' }}>Nossa <span className="underline decoration-yellow-400" style={{ color: 'var(--text-detail)' }}>Programação</span></h1>
          </div>
        </div>

        {programas.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center shadow-xl">
            <Radio className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">Sintonizando a grade...</p>
          </div>
        ) : (
          <div className="space-y-20">
            <div className="grid grid-cols-1 gap-16">
              {Object.entries(programasPorDia).map(([dia, progs]) => (
                <div key={dia} className="animate-in fade-in slide-in-from-bottom duration-700">
                  <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-2xl font-black uppercase tracking-tighter shrink-0" style={{ color: 'var(--text-title)' }}>
                      {DIAS_COMPLETOS[Number(dia)]}
                    </h2>
                    <div className="h-0.5 w-full bg-gray-100" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {progs.map(prog => {
                      const isAoVivo = atual?.programa.id === prog.id;
                      const foto = prog.foto || getLocutorFoto(prog.locutorId);
                      const imgIndex = images.findIndex(img => img.src === foto);

                      return (
                        <div
                          key={`${dia}-${prog.id}`}
                          className={`group relative aspect-square rounded-[2.5rem] overflow-hidden border-4 ${isAoVivo ? "border-accent shadow-2xl shadow-accent/20" : "border-white shadow-xl"} transition-all duration-500 hover:-translate-y-2`}
                        >
                          {foto ? (
                            <img
                              src={foto}
                              alt={prog.nome}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                              onClick={() => imgIndex >= 0 && setLightboxIndex(imgIndex)}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                              <Radio className="w-16 h-16 text-gray-200" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent opacity-90" />

                          <div className="absolute inset-0 p-8 flex flex-col justify-end">
                            {isAoVivo && (
                              <div className="absolute top-6 left-6 flex items-center gap-2 bg-accent text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg">
                                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />
                                NO AR AGORA
                              </div>
                            )}

                            <div className="space-y-2">
                              <span className="text-[9px] font-black text-accent uppercase tracking-widest block">{getLocutorNome(prog.locutorId)}</span>
                              <h3 className="font-black text-white text-xl md:text-2xl leading-tight group-hover:text-accent transition-colors uppercase tracking-tight">{prog.nome}</h3>
                              
                              <div className="flex items-center gap-2 pt-2 text-sm text-[var(--clube-yellow)] font-bold">
                                <Clock className="w-4 h-4" />
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
          </div>
        )}
      </div>

      <Footer />
      <RadioPlayer />

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
