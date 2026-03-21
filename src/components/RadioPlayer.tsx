import { useState, useRef, useEffect } from "react";
import { Play, Pause, ChevronDown, MapPin, Radio, Clock, ExternalLink } from "lucide-react";
import { getSiteConfig, getStreamingConfig, getProgramaAtual } from "@/lib/radioStore";

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume] = useState(0.8);
  const [currentProgram, setCurrentProgram] = useState<any>(null);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadConfigs = async () => {
      const site = await getSiteConfig("site");
      const streaming = await getStreamingConfig();
      const now = await getProgramaAtual();
      
      if (site) setSiteConfig(site);
      if (now) setCurrentProgram(now);
    };

    loadConfigs();
    const interval = setInterval(loadConfigs, 60000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bottom-player-clube px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 h-auto md:h-16">
      <audio ref={audioRef} src={siteConfig.streamUrl} preload="none" />
      
      {/* Left: Location / Region */}
      <div className="flex items-center gap-3 text-black/60 font-black text-[10px] uppercase tracking-widest shrink-0">
        <MapPin className="w-3.5 h-3.5 text-accent" />
        <span>Você está em:</span>
        <div className="flex items-center gap-2 px-6 py-2 border border-black/10 rounded-full text-black hover:border-black/30 transition-colors cursor-pointer group">
          <span className="font-bold">Brasília</span>
          <ChevronDown className="w-4 h-4 text-accent transition-transform group-hover:translate-y-0.5" />
        </div>
      </div>

      {/* Center: Play and Live Info */}
      <div className="flex items-center gap-6 md:absolute md:left-1/2 md:-translate-x-1/2">
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-accent flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20 border-4 border-white relative -mt-1 md:-mt-8"
        >
          {isPlaying ? 
            <Pause className="w-8 h-8 fill-white text-white" /> : 
            <Play className="w-8 h-8 fill-white text-white ml-1" />
          }
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">AO VIVO</span>
          </div>
          <span className="text-sm font-black text-primary leading-none">
            {siteConfig.radioFreq || "105.5"} FM
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 py-2 shrink-0">
        <button className="px-8 py-2.5 bg-none border border-black/10 text-primary font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-black/5 transition-all">
          Ver Programação
        </button>
        <button className="clube-btn-yellow flex items-center gap-2 shadow-lg shadow-[var(--clube-yellow)]/20 px-8 py-2.5">
          <ExternalLink className="w-4 h-4" />
          Abrir Player
        </button>
      </div>
    </div>
  );
};

export default RadioPlayer;
