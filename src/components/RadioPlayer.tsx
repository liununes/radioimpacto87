import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, MessageCircle, Instagram, Facebook, Youtube, Twitter, Globe } from "lucide-react";
import { getProgramaAtual, getRedesSociais, getWhatsApp } from "@/lib/radioStore";

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
  const [redes, setRedes] = useState(getRedesSociais());
  const [whatsapp, setWhatsappNum] = useState(getWhatsApp());

  useEffect(() => {
    const check = () => {
      const atual = getProgramaAtual();
      if (atual) {
        setLiveInfo({ programa: atual.programa.nome, locutor: atual.locutor.nome, foto: atual.locutor.foto });
      } else {
        setLiveInfo(null);
      }
      setRedes(getRedesSociais());
      setWhatsappNum(getWhatsApp());
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
    <header className="sticky top-0 z-50 bg-header border-b border-border/30 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16 px-4 gap-2">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center animate-pulse-ring">
            <div className="w-3 h-3 rounded-full bg-primary" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold font-display leading-tight text-foreground">Impacto FM</h1>
            <span className="text-xs text-secondary font-semibold">87.9 FM</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-all glow-effect shrink-0"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
          </button>

          {/* Live program info */}
          {liveInfo && (
            <div className="hidden md:flex items-center gap-3">
              {liveInfo.foto && (
                <img src={liveInfo.foto} alt={liveInfo.locutor} className="w-9 h-9 rounded-full object-cover border-2 border-secondary" />
              )}
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-secondary leading-tight">{liveInfo.programa}</p>
                  <span className="flex items-center gap-1 bg-destructive/90 text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
                    AO VIVO
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-tight">{liveInfo.locutor}</p>
              </div>
            </div>
          )}

          {/* Equalizer */}
          <div className="hidden sm:flex items-end gap-0.5 h-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-1 rounded-full bg-primary transition-all duration-150 ${isPlaying ? "animate-pulse" : ""}`}
                style={{ height: isPlaying ? `${Math.random() * 16 + 4}px` : "4px", animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-16 h-1 accent-primary cursor-pointer" />
          </div>
        </div>

        {/* WhatsApp + Social Links */}
        <div className="flex items-center gap-1.5 shrink-0">
          {whatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              title="Faça seu pedido"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Pedido</span>
            </a>
          )}

          {redes.slice(0, 5).map(rede => {
            const Icon = iconMap[rede.icone] || Globe;
            return (
              <a
                key={rede.id}
                href={rede.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary transition-colors group"
                title={rede.nome}
              >
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground" />
              </a>
            );
          })}

          {/* Status */}
          <div className="hidden md:flex items-center gap-1.5 ml-2">
            <span className="text-xs text-muted-foreground">{isPlaying ? "No Ar" : "Pausado"}</span>
            {isPlaying && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </div>
        </div>
      </div>

      <audio ref={audioRef} src="https://stream.zeno.fm/yn65fsaurfhvv" preload="none" />
    </header>
  );
};

export default RadioPlayer;
