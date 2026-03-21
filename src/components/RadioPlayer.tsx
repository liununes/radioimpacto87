import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, MessageCircle, Instagram, Facebook, Youtube, Twitter, Globe } from "lucide-react";
import { getProgramaAtual, getRedesSociais, getWhatsApp, type RedeSocial, getSiteConfig as getRadioSiteConfig } from "@/lib/radioStore";
import { getSiteConfig, getThemeConfig, type ThemeConfig } from "@/lib/themeStore";
import WeatherWidget from "./WeatherWidget";

const iconMap: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  whatsapp: MessageCircle,
  twitter: Twitter,
  tiktok: Globe,
  other: Globe,
};

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [liveInfo, setLiveInfo] = useState<{ programa: string; locutor: string; foto: string } | null>(null);
  const [redes, setRedes] = useState<RedeSocial[]>([]);
  const [whatsapp, setWhatsappNum] = useState("");
  const [siteConfig, setSiteConfig] = useState(getSiteConfig());
  const [theme, setTheme] = useState<ThemeConfig>(getThemeConfig());

  useEffect(() => {
    const check = async () => {
      const [atual, redesData, config, whatsappNum] = await Promise.all([
        getProgramaAtual(),
        getRedesSociais(),
        getRadioSiteConfig("streaming"),
        getWhatsApp()
      ]);
      if (atual) {
        setLiveInfo({ programa: atual.programa.nome, locutor: atual.locutor.nome, foto: atual.locutor.foto });
      } else {
        setLiveInfo(null);
      }
      setRedes(redesData);
      if (config) {
        setSiteConfig(prev => ({ ...prev, ...config }));
      }
      
      const themeData = await getRadioSiteConfig("theme");
      if (themeData) {
        setTheme(themeData);
      }
      
      setWhatsappNum(whatsappNum);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Quero fazer um pedido musical 🎵")}`
    : "";

  return (
    <header className="sticky top-0 z-50 bg-[var(--header-gradient)] border-b border-white/10 backdrop-blur-xl shadow-lg">
      <div className="container flex items-center justify-between h-20 px-4 gap-4">
        {/* Logo and Station Info */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative group">
            {siteConfig.logo ? (
              <img 
                src={siteConfig.logo} 
                alt={siteConfig.radioName} 
                className="w-12 h-12 rounded-2xl object-contain bg-white/5 p-1 border border-white/10 group-hover:scale-105 transition-transform shadow-inner" 
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border-2 border-primary flex items-center justify-center animate-pulse-ring">
                <div className="w-4 h-4 rounded-full bg-primary" />
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black font-display tracking-tight text-white m-0 leading-none">{siteConfig.radioName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold py-0.5 px-2 bg-secondary text-secondary-foreground rounded-full shadow-sm">{siteConfig.radioFreq}</span>
              {theme.showWeather && (
                <div className="scale-75 origin-left opacity-80">
                  <WeatherWidget showWeather={theme.showWeather} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player Controls - Main Focus */}
        <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl px-4 py-2 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-sm">
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-2xl bg-[var(--primary-gradient)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_hsl(var(--primary)/0.3)] group shrink-0"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? 
              <Pause className="w-6 h-6 text-primary-foreground fill-current" /> : 
              <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
            }
          </button>
          
          <div className="hidden md:flex flex-col flex-1 min-w-0">
            {liveInfo ? (
              <div className="flex items-center gap-3 overflow-hidden">
                {liveInfo.foto && (
                  <img src={liveInfo.foto} alt={liveInfo.locutor} className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-md shrink-0" />
                )}
                <div className="text-left truncate">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-none mb-1">No Ar Agora</p>
                  <p className="text-sm font-bold text-white leading-tight truncate">{liveInfo.programa}</p>
                  <p className="text-xs text-secondary/80 font-medium truncate">{liveInfo.locutor}</p>
                </div>
              </div>
            ) : (
              <div className="text-left truncate">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">Impacto FM</p>
                <p className="text-sm font-bold text-white leading-tight">Música e Informação</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden lg:flex items-end gap-1 h-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-secondary/80 transition-all duration-300 ${isPlaying ? "animate-bounce" : ""}`}
                  style={{ 
                    height: isPlaying ? `${Math.random() * 20 + 8}px` : "4px", 
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.5 + Math.random()}s`
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 bg-black/30 px-3 py-1.5 rounded-2xl">
              <button 
                onClick={toggleMute} 
                className="text-white/70 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange} 
                className="w-16 h-1 accent-secondary cursor-pointer bg-white/10 rounded-full" 
              />
            </div>
          </div>
        </div>

        {/* Social and Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {whatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white p-3 md:px-5 md:py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg hover:shadow-[#25D366]/20 active:scale-95 group"
              title="Faça seu pedido musical"
            >
              <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="hidden lg:inline">Pedir Música</span>
            </a>
          )}

          <div className="hidden xl:flex items-center gap-1.5 ml-2">
            {redes.slice(0, 4).map(rede => {
              const Icon = iconMap[rede.icone] || Globe;
              return (
                <a
                  key={rede.id}
                  href={rede.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 hover:-translate-y-0.5"
                  title={rede.nome}
                >
                  <Icon className="w-4 h-4 text-white/70" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={siteConfig.streamUrl} preload="none" />
    </header>
  );
};

export default RadioPlayer;
