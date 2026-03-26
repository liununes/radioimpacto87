import { Radio, Hammer, Clock, Phone, Mail } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const Maintenance = () => {
  const theme = useTheme();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 text-white overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, var(--header-grad-start), var(--header-grad-end))`
      }}
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-2xl w-full text-center space-y-12 relative z-10">
        {/* Logo container */}
        <div className="inline-flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-1000">
          <div 
            className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white p-6 shadow-2xl flex items-center justify-center rotate-3 hover:rotate-0 transition-all duration-700"
          >
            {theme.logo ? (
              <img src={theme.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Radio className="w-16 h-16 text-primary" />
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              {theme.radioName || "IMPACTO"} <span className="text-accent">{theme.radioFreq || "87.9"} FM</span>
            </h1>
          </div>
        </div>

        {/* Maintenance Message */}
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-black uppercase tracking-[0.3em]">
             <Hammer className="w-4 h-4 text-accent" /> Modo Manutenção
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-tight">
            Voltaremos em <span className="text-accent underline decoration-white/20">breve!</span>
          </h2>
          <p className="text-lg text-white/70 font-medium leading-relaxed max-w-lg mx-auto">
            {theme.maintenanceMessage}
          </p>
        </div>

        {/* Footer/Contact Info */}
        <div className="pt-12 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-1000 delay-700">
           <div className="flex items-center justify-center gap-4 text-white/50 hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                 <Clock className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Previsão</p>
                 <p className="text-sm font-bold">Em alguns instantes</p>
              </div>
           </div>
           <div className="flex items-center justify-center gap-4 text-white/50 hover:text-white transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                 <Phone className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Contato</p>
                 <p className="text-sm font-bold">(87) 9 9999-9999</p>
              </div>
           </div>
        </div>

        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] pt-12">
          &copy; {new Date().getFullYear()} {theme.radioName} - Todos os direitos reservados
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
