import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-header border-b border-border/30 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center animate-pulse-ring">
            <div className="w-3 h-3 rounded-full bg-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold font-display leading-tight text-foreground">Impacto FM</h1>
            <span className="text-xs text-secondary font-semibold">87.9 FM</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-all glow-effect"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            )}
          </button>

          {/* Equalizer animation */}
          <div className="hidden sm:flex items-end gap-0.5 h-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-1 rounded-full bg-primary transition-all duration-150 ${
                  isPlaying ? "animate-pulse" : ""
                }`}
                style={{
                  height: isPlaying ? `${Math.random() * 16 + 4}px` : "4px",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Status */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isPlaying ? "No Ar" : "Pausado"}
          </span>
          {isPlaying && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
        </div>
      </div>

      <audio
        ref={audioRef}
        src="https://stream.zeno.fm/yn65fsaurfhvv"
        preload="none"
      />
    </header>
  );
};

export default RadioPlayer;