import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, ChevronDown, MapPin, ExternalLink, Volume2, Info, MessageCircle } from "lucide-react";
import { getSiteConfig, getProgramaAtual, type Programa, type Locutor } from "@/lib/radioStore";
import { useTheme } from "@/hooks/useTheme";

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const [programaAtual, setProgramaAtual] = useState<{ programa: Programa; locutor: Locutor } | null>(null);
  const [showPhotoBig, setShowPhotoBig] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const theme = useTheme();

  const loadConfigs = async () => {
    const site = (await getSiteConfig("site")) || {};
    const streaming = (await getSiteConfig("streaming")) || {};
    setSiteConfig({ ...site, ...streaming });
  };

  const updatePrograma = async () => {
    const atual = await getProgramaAtual();
    setProgramaAtual(atual);
  };

  useEffect(() => {
    loadConfigs();
    updatePrograma();
    const interval = setInterval(updatePrograma, 60000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Para fixar problema de áudio que não carrega, damos load() se o src mudou ou se estava parado
        if (!audioRef.current.src) {
           audioRef.current.src = siteConfig.streamUrl;
        }
        audioRef.current.play().catch(err => console.error("Erro ao tocar áudio:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const openPlayerPopup = () => {
    const width = 450;
    const height = 750;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    window.open(
      '/player', 
      'PlayerOnline', 
      `width=${width},height=${height},top=${top},left=${left},scrollbars=no,resizable=no`
    );
  };

  return (
    <div className="bottom-player-clube dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between px-6 md:px-12 gap-2 md:gap-8">
      <audio ref={audioRef} src={siteConfig.streamUrl} style={{ display: 'none' }} />
      
      {/* Esquerda: Localização - Hidden on mobile to avoid crowding */}
      <div className="hidden md:flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
           <MapPin className="w-4 h-4 text-accent fill-accent/20" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{theme.labels.playerLocation}</span>
        </div>
        <div className="flex items-center gap-4 px-6 py-2.5 border border-primary/20 rounded-full text-primary hover:border-primary/40 transition-all cursor-pointer bg-white group shadow-sm">
          <span className="text-[11px] font-black uppercase tracking-wider">{theme.weatherCity || siteConfig.cidade || "Impacto FM"}</span>
          <ChevronDown className="w-4 h-4 text-accent group-hover:translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* Centro: Play Button e Info do Ar - Refined for mobile */}
      <div className="flex-1 md:absolute md:left-1/2 md:-translate-x-1/2 md:-top-14 flex items-center gap-3 md:gap-8">
        {/* Foto do Locutor em Destaque */}
        {theme.showLocutores !== false && programaAtual?.locutor?.foto && (
          <div 
            className="hidden md:block relative animate-in slide-in-from-left-4 duration-1000"
            onClick={() => setShowPhotoBig(true)}
          >
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-2xl rotate-3 hover:rotate-0 transition-all cursor-pointer group/loc">
              <img src={programaAtual.locutor.foto} alt={programaAtual.locutor.nome} className="w-full h-full object-cover scale-110 group-hover/loc:scale-100 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/loc:opacity-100 transition-opacity flex items-end justify-center p-3">
                 <span className="text-[10px] font-black text-white uppercase tracking-tighter">Ver Perfil</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white translate-y-0 group-hover/loc:-translate-y-1 transition-transform">
               <Info className="w-5 h-5" />
            </div>
          </div>
        )}

        <div className="relative">
           {/* Ring de foto do programa se houver */}
           {programaAtual?.programa?.foto && (
              <div className="absolute inset-0 rounded-full border-4 border-accent animate-pulse opacity-20 -m-1" />
           )}
           <button
             onClick={togglePlay}
             className="w-16 h-16 md:w-28 md:h-28 rounded-full bg-accent flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,140,0,0.4)] border-4 md:border-8 border-white group relative overflow-hidden"
             style={{ backgroundImage: isPlaying && programaAtual?.programa?.foto ? `url(${programaAtual.programa.foto})` : 'none', backgroundSize: 'cover' }}
           >
             <div className={`absolute inset-0 bg-accent/60 flex items-center justify-center transition-opacity ${isPlaying && programaAtual?.programa?.foto ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                {isPlaying ? 
                  <Pause className="w-6 h-6 md:w-12 md:h-12 fill-white text-white" /> : 
                  <Play className="w-6 h-6 md:w-12 md:h-12 fill-white text-white ml-1 md:ml-2" />
                }
             </div>
           </button>
        </div>
        
        <div className="flex flex-col pt-2 md:pt-16 whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-accent animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-accent">{theme.labels.playerLive}</span>
          </div>
          <span className="text-sm md:text-3xl font-[900] text-primary leading-none uppercase tracking-tighter">
            {siteConfig.radioFreq || theme.radioFreq || "87.9"} FM
          </span>
          {/* Programa Atual Subtitle */}
          <div className="flex flex-col mt-0.5">
            <span className="text-[9px] md:text-[11px] font-black text-primary uppercase truncate max-w-[80px] md:max-w-none">
               {programaAtual?.programa?.nome || "Impacto FM"}
            </span>
          </div>
        </div>
      </div>

      {/* --- ZOOM MODAL DA FOTO --- */}
      {showPhotoBig && programaAtual?.locutor?.foto && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300 cursor-zoom-out"
          onClick={() => setShowPhotoBig(false)}
        >
          <div className="relative max-w-2xl w-full aspect-square md:aspect-[3/4] overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(236,32,39,0.2)] border-8 border-white animate-in zoom-in-95 duration-500">
             <img src={programaAtual.locutor.foto} alt="Locutor" className="w-full h-full object-cover" />
             <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-2">Locutor no Ar</p>
                <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">{programaAtual.locutor.nome}</h3>
                <p className="text-white/60 font-bold uppercase tracking-widest text-[11px] mt-4">{programaAtual.programa.nome}</p>
             </div>
             <button className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all">
                <ChevronDown className="w-6 h-6 rotate-180" />
             </button>
          </div>
        </div>
      )}

      {/* Direita: Botões de Ação - Ultra Compact on mobile */}
      <div className="flex items-center gap-1.5 md:gap-4 shrink-0 pr-2">
        {theme.showPedidos !== false && (
           <a 
            href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappMessage || "Olá! Gostaria de pedir uma música.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg"
           >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
           </a>
        )}
        
        <button 
           onClick={openPlayerPopup}
           className="clube-btn-yellow flex items-center justify-center p-2.5 h-10 md:h-12 rounded-full md:rounded-xl md:px-10"
           title={theme.labels.playerOpen}
        >
          <ExternalLink className="w-4 h-4" />
          <span className="font-black hidden md:inline ml-3">{theme.labels.playerOpen}</span>
        </button>
      </div>
    </div>
  );
};

export default RadioPlayer;
