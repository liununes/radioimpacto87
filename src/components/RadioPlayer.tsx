import { useState, useRef, useEffect } from "react";
import { Play, Pause, ChevronDown, MapPin, ExternalLink, Volume2, Info } from "lucide-react";
import { getSiteConfig, getProgramaAtual, type Programa, type Locutor } from "@/lib/radioStore";
import { useTheme } from "@/hooks/useTheme";

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const [programaAtual, setProgramaAtual] = useState<{ programa: Programa; locutor: Locutor } | null>(null);
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
    <div className="bottom-player-universal flex items-center justify-between px-12 gap-8">
      <audio ref={audioRef} src={siteConfig.streamUrl} style={{ display: 'none' }} />
      
      {/* Informações da Cidade/Localização */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
           <MapPin className="w-4 h-4 text-accent fill-accent/20" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{theme.labels.playerLocation}</span>
        </div>
        <div className="flex items-center gap-4 px-6 py-2.5 border border-primary/20 rounded-full text-primary hover:border-primary/40 transition-all cursor-pointer bg-white group shadow-sm">
          <span className="text-[11px] font-black uppercase tracking-wider">{theme.weatherCity || siteConfig.cidade || "Impacto FM"}</span>
          <ChevronDown className="w-4 h-4 text-accent group-hover:translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* Main Controls & Programa Atual */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-12 md:-top-16 flex items-center gap-6">
        <div className="flex flex-col items-end pr-4 text-right hidden md:flex">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Ar Agora:</span>
          <span className="text-sm font-black text-primary uppercase leading-tight truncate max-w-[150px]">
            {programaAtual?.programa?.nome || "Música de Qualidade"}
          </span>
          <span className="text-[10px] font-bold text-accent uppercase">{programaAtual?.locutor?.nome || "Impacto 24h"}</span>
        </div>

        <div className="relative">
           {/* Ring de foto do programa se houver */}
           {programaAtual?.programa?.foto && (
              <div className="absolute inset-0 rounded-full border-4 border-accent animate-pulse opacity-20 -m-2" />
           )}
           <button
             onClick={togglePlay}
             className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-accent flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl bg-cover bg-center overflow-hidden border-8 border-white group relative"
             style={{ backgroundImage: isPlaying && programaAtual?.programa?.foto ? `url(${programaAtual.programa.foto})` : 'none' }}
           >
             <div className={`absolute inset-0 bg-accent/60 flex items-center justify-center transition-opacity ${isPlaying && programaAtual?.programa?.foto ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                {isPlaying ? 
                  <Pause className="w-10 h-10 md:w-14 md:h-14 fill-white text-white" /> : 
                  <Play className="w-10 h-10 md:w-14 md:h-14 fill-white text-white ml-2" />
                }
             </div>
           </button>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-accent animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">{theme.labels.playerLive}</span>
          </div>
          <span className="text-2xl font-black text-primary leading-none uppercase tracking-tighter">
            {siteConfig.radioFreq || "87.9"} <span className="text-xs">FM</span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 hidden lg:flex">
           <Volume2 className="w-4 h-4 text-gray-400" />
           <input 
             type="range" 
             className="w-20 accent-accent cursor-pointer h-1.5" 
             onChange={(e) => { if(audioRef.current) audioRef.current.volume = parseInt(e.target.value) / 100 }}
             defaultValue={100}
           />
        </div>
        
        <button 
           onClick={openPlayerPopup}
           className="clube-btn-yellow flex items-center gap-3 px-10 h-12 shadow-[0_10px_20px_rgba(255,237,50,0.2)] rounded-full"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="font-black uppercase text-[11px] tracking-widest">{theme.labels.playerOpen}</span>
        </button>
      </div>
    </div>
  );
};

export default RadioPlayer;
