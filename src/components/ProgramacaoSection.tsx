import { getProgramas, getLocutores } from "@/lib/radioStore";
import { getSiteConfig } from "@/lib/siteConfig";
import { Clock } from "lucide-react";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const ProgramacaoSection = () => {
  const programas = getProgramas();
  const locutores = getLocutores();
  const config = getSiteConfig();

  const getLocutorNome = (id: string) => locutores.find(l => l.id === id)?.nome || "";
  const getLocutorFoto = (id: string) => locutores.find(l => l.id === id)?.foto || "";

  if (programas.length === 0) return null;

  return (
    <section id="programacao" className="py-12 border-t border-border/20">
      <div className="container px-4">
        <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: `'${config.fontHeading}', sans-serif` }}>
          <span style={{ color: config.colorSecondary }}>Programação</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programas.map((prog) => (
            <div key={prog.id} className="rounded-lg overflow-hidden border border-border/30 hover:border-primary/40 transition-all group"
              style={{ backgroundColor: config.colorCardBg }}>
              {/* Program image or color header */}
              {prog.foto ? (
                <img src={prog.foto} alt={prog.nome} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-24" style={{ background: `linear-gradient(135deg, ${config.colorPrimary}, ${config.colorPrimary}88)` }} />
              )}
              <div className="p-4">
                <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{prog.nome}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {getLocutorFoto(prog.locutorId) && (
                    <img src={getLocutorFoto(prog.locutorId)} alt="" className="w-7 h-7 rounded-full object-cover" />
                  )}
                  <span className="text-sm text-muted-foreground">{getLocutorNome(prog.locutorId)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{prog.horaInicio} - {prog.horaFim}</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {prog.diasSemana.sort().map(d => (
                    <span key={d} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: config.colorPrimary + '33', color: config.colorPrimary }}>
                      {DIAS[d]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramacaoSection;
