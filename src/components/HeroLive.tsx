import { useEffect, useState } from "react";
import { getProgramaAtual, getProgramas, getLocutores } from "@/lib/radioStore";
import { getSiteConfig } from "@/lib/siteConfig";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const HeroLive = () => {
  const [liveInfo, setLiveInfo] = useState<{ programa: string; locutor: string; fotoLocutor: string; fotoProg: string } | null>(null);
  const [nextPrograms, setNextPrograms] = useState<{ nome: string; hora: string; foto: string }[]>([]);
  const config = getSiteConfig();

  useEffect(() => {
    const check = () => {
      const atual = getProgramaAtual();
      if (atual) {
        setLiveInfo({
          programa: atual.programa.nome,
          locutor: atual.locutor.nome,
          fotoLocutor: atual.locutor.foto,
          fotoProg: atual.programa.foto,
        });
      } else {
        setLiveInfo(null);
      }

      // Get next programs
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      const hora = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
      const dia = now.getDay();
      const programas = getProgramas();
      const locutores = getLocutores();
      const upcoming = programas
        .filter(p => p.diasSemana.includes(dia) && p.horaInicio > hora)
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
        .slice(0, 3)
        .map(p => {
          const loc = locutores.find(l => l.id === p.locutorId);
          return { nome: p.nome, hora: p.horaInicio, foto: loc?.foto || p.foto || "" };
        });
      setNextPrograms(upcoming);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="ao-vivo"
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${config.colorPrimary}, ${config.colorPrimary}dd, ${config.colorPrimary}99)`,
        minHeight: "360px",
      }}
    >
      {/* Background image if available */}
      {liveInfo?.fotoProg && (
        <div className="absolute inset-0">
          <img src={liveInfo.fotoProg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${config.colorPrimary}ee, ${config.colorPrimary}cc)` }} />
        </div>
      )}

      <div className="relative container px-4 py-16 flex flex-col justify-end min-h-[360px]">
        {/* AO VIVO Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-bold text-foreground/90 tracking-wider uppercase">Ao Vivo</span>
        </div>

        {/* Program name */}
        <h2
          className="text-4xl md:text-6xl font-bold text-foreground mb-6"
          style={{ fontFamily: `'${config.fontHeading}', sans-serif` }}
        >
          {liveInfo?.programa || `${config.radioName} ${config.radioFreq}`}
        </h2>

        {liveInfo && (
          <div className="flex items-center gap-3 mb-8">
            {liveInfo.fotoLocutor && (
              <img src={liveInfo.fotoLocutor} alt={liveInfo.locutor} className="w-10 h-10 rounded-full object-cover border-2 border-secondary" />
            )}
            <span className="text-lg text-foreground/80">com {liveInfo.locutor}</span>
          </div>
        )}

        {/* Button OUVIR */}
        <button
          className="w-fit px-8 py-3 rounded-md font-bold text-lg transition-all hover:brightness-110 shadow-lg mb-8"
          style={{ backgroundColor: config.colorSecondary, color: config.colorBackground }}
          onClick={() => {
            const audio = document.querySelector("audio") as HTMLAudioElement;
            if (audio) { audio.play().catch(() => {}); }
          }}
        >
          OUVIR
        </button>

        {/* A seguir */}
        {nextPrograms.length > 0 && (
          <div>
            <p className="text-sm text-foreground/60 mb-3 uppercase tracking-wider">A seguir</p>
            <div className="flex flex-wrap gap-6">
              {nextPrograms.map((prog, i) => (
                <div key={i} className="flex items-center gap-3">
                  {prog.foto && (
                    <img src={prog.foto} alt={prog.nome} className="w-12 h-12 rounded-full object-cover border border-foreground/20" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-secondary">{prog.hora}</p>
                    <p className="text-sm text-foreground/80">{prog.nome}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroLive;
