import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { getProgramaAtual } from "@/lib/radioStore";
import { getSiteConfig } from "@/lib/siteConfig";

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [liveInfo, setLiveInfo] = useState<{ programa: string; locutor: string; foto: string } | null>(null);
  const config = getSiteConfig();

  useEffect(() => {
    const check = () => {
      const atual = getProgramaAtual();
      if (atual) {
        setLiveInfo({ programa: atual.programa.nome, locutor: atual.locutor.nome, foto: atual.locutor.foto });
      } else {
        setLiveInfo(null);
      }
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

  return (
    <header className="sticky top-0 z-50 border-b border-border/20" style={{ backgroundColor: config.colorHeaderBg }}>
      <div className="container flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-secondary flex items-center justify-center"
            style={{ backgroundColor: config.colorPrimary + '33' }}>
            <div className="w-3 h-3 rounded-full bg-secondary" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-foreground" style={{ fontFamily: `'${config.fontHeading}', sans-serif` }}>
              {config.radioName}
            </h1>
            <span className="text-xs font-semibold text-secondary">{config.radioFreq} FM</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-4">
          {/* Live info */}
          {liveInfo && (
            <div className="hidden md:flex items-center gap-3">
              {liveInfo.foto && (
                <img src={liveInfo.foto} alt={liveInfo.locutor} className="w-9 h-9 rounded-full object-cover border-2 border-secondary" />
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-secondary leading-tight">{liveInfo.programa}</p>
                <p className="text-xs text-muted-foreground leading-tight">{liveInfo.locutor}</p>
              </div>
            </div>
          )}

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:brightness-110 transition-all shadow-lg"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-secondary-foreground" />
            ) : (
              <Play className="w-5 h-5 text-secondary-foreground ml-0.5" />
            )}
          </button>

          {/* Equalizer */}
          <div className="hidden sm:flex items-end gap-0.5 h-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-1 rounded-full bg-secondary transition-all duration-150 ${isPlaying ? "animate-pulse" : ""}`}
                style={{ height: isPlaying ? `${Math.random() * 16 + 4}px` : "4px", animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange}
              className="w-20 h-1 accent-secondary cursor-pointer" />
          </div>
        </div>

        {/* Status */}
        <div className="hidden md:flex items-center gap-2">
          {isPlaying && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          <span className="text-sm text-muted-foreground">{isPlaying ? "AO VIVO" : "Pausado"}</span>
        </div>
      </div>

      <audio ref={audioRef} src={config.streamUrl} preload="none" />
    </header>
  );
};

export default RadioPlayer;
