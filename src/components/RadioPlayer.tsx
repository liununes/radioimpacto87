import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, MessageSquare, Instagram, Facebook, Youtube, Twitter, Radio, Music, Heart, Globe, MessageCircle } from "lucide-react";
import { getThemeConfig } from "@/lib/themeStore";
import { getSiteConfig, getRedesSociais, getProgramaAtual } from "@/lib/radioStore";
import WeatherWidget from "./WeatherWidget";

const iconMap: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  globe: Globe,
};

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<any>(null);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const [streamingConfig, setStreamingConfig] = useState<any>({});
  const [theme, setTheme] = useState(getThemeConfig());
  const [redes, setRedes] = useState<any[]>([]);
  const [whatsapp, setWhatsapp] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadConfigs = async () => {
      const site = await getSiteConfig("site");
      const streaming = await getSiteConfig("streaming");
      const social = await getRedesSociais();
      const now = await getProgramaAtual();
      
      if (site) setSiteConfig(site);
      if (streaming) {
        setStreamingConfig(streaming);
        if (streaming.whatsapp) setWhatsapp(streaming.whatsapp);
      }
      if (social) setRedes(social);
      if (now) setCurrentProgram(now);
    };

    loadConfigs();
    const interval = setInterval(loadConfigs, 60000);
    
    // Theme sync
    const handleStorage = () => setTheme(getThemeConfig());
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Quero fazer um pedido musical 🎵")}`
    : "";

  return (
    <header className="glass-header shadow-2xl">
      {/* Top Bar - Minimal */}
      <div className="bg-black/40 border-b border-white/5 py-1.5 hidden md:block">
        <div className="container mx-auto px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
          <div className="flex gap-6">
            <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer capitalize">
              <Radio className="w-3 h-3" /> Ao Vivo agora
            </span>
            <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
              <Music className="w-3 h-3" /> Peça sua Música
            </span>
          </div>
          <div className="flex gap-4">
            {redes.slice(0, 4).map((rede, idx) => {
              const Icon = iconMap[rede.icone] || Globe;
              return (
                <a key={idx} href={rede.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo Section */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group overflow-hidden">
              <img 
                src={siteConfig.logo || "https://clube.fm/wp-content/uploads/2021/05/cropped-favicon-clube-192x192.png"} 
                alt="Logo" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl md:text-2xl font-black italic tracking-tighter leading-none text-white">
                {siteConfig.radioName || "RADIO IMPACTO"} <span className="text-primary text-3xl font-black">{siteConfig.radioFreq || "87"}</span>
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">A rádio que toca você</p>
            </div>
          </div>

          {/* Player Main Controls */}
          <div className="flex items-center gap-4 lg:gap-8 flex-1 justify-center max-w-2xl px-4 py-2 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <button
              onClick={togglePlay}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[var(--primary-gradient)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.4)] group shrink-0 relative z-10"
              aria-label={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isPlaying ? 
                <div className="flex gap-1 items-end h-6">
                  <div className="w-1.5 bg-white rounded-full animate-[bounce_0.8s_infinite] h-full" />
                  <div className="w-1.5 bg-white rounded-full animate-[bounce_0.5s_infinite] h-4" />
                  <div className="w-1.5 bg-white rounded-full animate-[bounce_1s_infinite] h-5" />
                </div> : 
                <Play className="w-7 h-7 md:w-8 md:h-8 fill-white text-white translate-x-1" />
              }
            </button>

            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase rounded shadow-lg animate-pulse">No Ar</span>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground/40 truncate">
                  {currentProgram?.programa || "Programação Especial"}
                </p>
              </div>
              <h2 className="text-sm md:text-lg font-black italic tracking-tight truncate leading-tight text-white">
                {currentProgram?.locutor || "Impacto FM 87.9"}
              </h2>
            </div>

            {/* Volume Desktop */}
            <div className="hidden md:flex items-center gap-3 w-32 relative z-10 group/vol">
              <button onClick={toggleMute} className="text-foreground/40 hover:text-primary transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary hover:h-2 transition-all"
              />
            </div>
          </div>

          {/* Actions Desktop */}
          <div className="hidden xl:flex items-center gap-4">
             {whatsapp && (
               <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-premium flex items-center gap-2 group">
                 <MessageCircle className="w-4 h-4 group-hover:rotate-12 transition-all" />
                 <span className="hidden lg:inline">WhatsApp</span>
               </a>
             )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button className="p-3 bg-white/5 rounded-xl border border-white/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>
      </div>
      
      <audio ref={audioRef} src={siteConfig.streamUrl} preload="none" />
    </header>
  );
};

export default RadioPlayer;
