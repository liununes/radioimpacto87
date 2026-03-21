import { MapPin, Phone, Mail, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { getSiteConfig } from "@/lib/radioStore";

const AboutSection = () => {
  const [data, setData] = useState<any>({
    titulo: "Impacto FM 87.9",
    descricao: "A sua rádio favorita, levando música e informação de qualidade para toda a região.",
    endereco: "",
    telefone: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSobre = async () => {
      const saved = await getSiteConfig("sobre");
      if (saved) {
        setData(saved);
      }
      setLoading(false);
    };
    fetchSobre();
  }, []);

  if (loading) return null;

  return (
    <section id="sobre" className="py-32 bg-transparent relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-4 block animate-pulse">Nossa História</span>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
                Sobre a <span className="text-primary italic">Rádio</span>
              </h2>
              <div className="w-20 h-2 bg-primary rounded-full" />
            </div>
            
            <p className="text-xl text-foreground/70 leading-relaxed font-medium whitespace-pre-wrap max-w-xl">
              {data.descricao || "A rádio que toca você com a melhor programação, música de qualidade e informação em tempo real para toda a nossa região."}
            </p>

            <div className="flex gap-4">
               <button className="btn-premium">Saiba Mais</button>
               <button className="px-8 py-4 rounded-2xl border border-white/10 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all">Programação</button>
            </div>
          </div>

          <div id="contato" className="card-premium p-12 space-y-10 bg-black/40 border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Info className="w-32 h-32 text-primary" />
            </div>
            
            <h3 className="text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-4 relative z-10">
              <div className="w-8 h-px bg-primary" /> Contato Direto
            </h3>
            
            <div className="grid grid-cols-1 gap-8 relative z-10">
              {data.endereco && (
                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/item:border-primary/50 transition-colors">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Localização</p>
                    <p className="text-lg font-bold text-foreground/80 leading-tight">{data.endereco}</p>
                  </div>
                </div>
              )}

              {data.telefone && (
                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/item:border-primary/50 transition-colors">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Central de Ouvintes</p>
                    <p className="text-2xl font-black text-white">{data.telefone}</p>
                  </div>
                </div>
              )}

              {data.email && (
                <div className="flex items-start gap-6 group/item">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/item:border-primary/50 transition-colors">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Publicidade e SAC</p>
                    <p className="text-lg font-bold text-white lowercase">{data.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
