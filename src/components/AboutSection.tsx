import { MapPin, Phone, Mail, Info, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { getSiteConfig } from "@/lib/radioStore";
import { useTheme } from "@/hooks/useTheme";
import { Link } from "react-router-dom";

const AboutSection = () => {
  const [data, setData] = useState<any>({
    titulo: "Rede Clube",
    descricao: "A sua rádio favorita, levando música e informação de qualidade para toda a região.",
    endereco: "",
    telefone: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

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
    <section id="sobre" className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.5em] mb-4 block underline decoration-[var(--clube-yellow)]">NOSSA RÁDIO</span>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9]" style={{ color: 'var(--text-title)' }}>
                {theme.labels.aboutTitle} <span className="text-accent underline decoration-[var(--clube-yellow)]">{theme.labels.aboutSubtitle}</span>
              </h2>
            </div>
            
            <p className="text-xl font-medium leading-relaxed whitespace-pre-wrap max-w-xl" style={{ color: 'var(--text-content)' }}>
              {theme.labels.footerAbout || data.descricao}
            </p>

            <div className="flex flex-wrap gap-4">
               <Link to="/player" className="clube-btn-yellow shadow-lg shadow-yellow-400/20 flex items-center justify-center">Saiba Mais</Link>
               <Link to="/programacao" className="px-10 py-3 rounded-full border-2 border-primary text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all flex items-center justify-center">Programação</Link>
            </div>
          </div>

          <div id="contato" className="bg-gray-50 p-12 space-y-10 rounded-[3rem] border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
              <Info className="w-48 h-48 text-primary shadow-2xl" />
            </div>
            
            <h3 className="text-2xl font-black tracking-tighter flex items-center gap-4 relative z-10" style={{ color: 'var(--text-title)' }}>
              Central de Contato
            </h3>
            
            <div className="grid grid-cols-1 gap-10 relative z-10">
              {data.endereco && (
                <div className="flex items-start gap-6 group/item">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shrink-0 group-hover/item:border-accent group-hover/item:shadow-lg transition-all">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase mb-1 underline decoration-yellow-400" style={{ color: 'var(--text-detail)' }}>Localização</p>
                    <p className="text-lg font-bold truncate max-w-xs" style={{ color: 'var(--text-title)' }}>{data.endereco}</p>
                  </div>
                </div>
              )}

              {data.telefone && (
                <div className="flex items-start gap-6 group/item">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shrink-0 group-hover/item:border-accent group-hover/item:shadow-lg transition-all">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase mb-1 underline decoration-yellow-400" style={{ color: 'var(--text-detail)' }}>Atendimento Ouvinte</p>
                    <p className="text-3xl font-black leading-none mt-1" style={{ color: 'var(--text-title)' }}>{data.telefone}</p>
                  </div>
                </div>
              )}

              {data.email && (
                <div className="flex items-start gap-6 group/item">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shrink-0 group-hover/item:border-accent group-hover/item:shadow-lg transition-all">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase mb-1 underline decoration-yellow-400" style={{ color: 'var(--text-detail)' }}>E-mail Comercial</p>
                    <p className="text-lg font-bold truncate max-w-xs lowercase" style={{ color: 'var(--text-title)' }}>{data.email}</p>
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
