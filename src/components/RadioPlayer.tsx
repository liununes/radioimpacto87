import { useState, useRef, useEffect } from "react";
import { Play, Pause, ChevronDown, MapPin, ExternalLink } from "lucide-react";
import { getSiteConfig, getProgramaAtual } from "@/lib/radioStore";

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadConfigs = async () => {
      const site = await getSiteConfig("site");
      const streaming = await getSiteConfig("streaming");
      
      if (site) setSiteConfig({ ...site, ...streaming });
    };
    loadConfigs();
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bottom-player-clube flex items-center justify-between px-12 gap-8">
      <audio ref={audioRef} src={siteConfig.streamUrl} preload="none" />
      
      {/* Region Selector */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
           <MapPin className="w-4 h-4 text-accent fill-accent/20" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">VOCÊ ESTÁ EM:</span>
        </div>
        <div className="flex items-center gap-4 px-6 py-2.5 border border-primary/20 rounded-full text-primary hover:border-primary/40 transition-all cursor-pointer bg-white group shadow-sm">
          <span className="text-[11px] font-black uppercase tracking-wider">Brasília</span>
          <ChevronDown className="w-4 h-4 text-accent group-hover:translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* Main Controls Overlayed */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-10 md:-top-12 flex items-center gap-6">
        <button
          onClick={togglePlay}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_15px_35px_rgba(236,32,39,0.3)] border-8 border-white group"
        >
          {isPlaying ? 
            <Pause className="w-8 h-8 md:w-10 md:h-10 fill-white text-white" /> : 
            <Play className="w-8 h-8 md:w-10 md:h-10 fill-white text-white ml-1.5" />
          }
        </button>
        
        <div className="flex flex-col pt-12 md:pt-14">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_#ec2027]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">AO VIVO</span>
          </div>
          <span className="text-xl font-black text-primary leading-none uppercase tracking-tighter">
            {siteConfig.radioFreq || "105.5"} FM
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 shrink-0">
        <button className="clube-btn-white-outline px-8 h-12">
          Ver Programação
        </button>
        <button className="clube-btn-yellow flex items-center gap-3 px-10 h-12">
          <ExternalLink className="w-4 h-4" />
          Abrir Player
        </button>
      </div>
    </div>
  );
};

export default RadioPlayer;
