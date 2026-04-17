import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, ChevronDown, MapPin, ExternalLink, Volume2, VolumeX, Info, MessageCircle } from "lucide-react";
import { getSiteConfig, getProgramaAtual, type Programa, type Locutor } from "@/lib/radioStore";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";

const RadioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const [programaAtual, setProgramaAtual] = useState<{ programa: Programa; locutor: Locutor } | null>(null);
  const [showPhotoBig, setShowPhotoBig] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const theme = useTheme();
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

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
    
    // Recuperar volume salvo
    const savedVolume = localStorage.getItem('radio-player-volume');
    if (savedVolume) {
      const v = parseFloat(savedVolume);
      setVolume(v);
      if (audioRef.current) audioRef.current.volume = v;
    }

    return () => clearInterval(interval);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    localStorage.setItem('radio-player-volume', value.toString());
    if (value > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const togglePlay = () => {
    if (audioRef.current && siteConfig.streamUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Formatar URL do streaming: Adicionar ';' ao final se necessário para alguns navegadores/servidores
        // Mas APENAS se não for uma URL de proxy do AzuraCast (/radio/ ou /listen/)
        let url = siteConfig.streamUrl;
        const isProxied = url.includes('/radio/') || url.includes('/listen/');
        
        if (!isProxied && !url.endsWith(';') && !url.includes('?')) {
          url += ';';
        }
        
        audioRef.current.src = url;
        audioRef.current.load(); // Forçar carga limpa do streaming
        audioRef.current.volume = isMuted ? 0 : volume;
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
             console.error("Erro ao tocar áudio:", err);
             // Tentar sem o ';' caso falhe
             if (audioRef.current) {
               audioRef.current.src = siteConfig.streamUrl;
               audioRef.current.load();
               audioRef.current.play().catch(e => console.error("Falha total no play:", e));
             }
          });
        }
      }
      setIsPlaying(!isPlaying);
      // Notificar o ThemeLoader para atualizar a presença
      window.dispatchEvent(new CustomEvent('radio-play-state', { detail: { isPlaying: !isPlaying } }));
    } else if (!siteConfig.streamUrl) {
       toast.error("URL de streaming não configurada!");
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
             className="w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] group relative overflow-hidden"
             style={{ 
               backgroundColor: 'var(--player-live-bg)', 
               border: `var(--player-live-border-size) solid var(--player-live-border)`,
               backgroundImage: isPlaying && programaAtual?.programa?.foto ? `url(${programaAtual.programa.foto})` : 'none', 
               backgroundSize: 'cover' 
             }}
           >
             <div 
               className={`absolute inset-0 flex items-center justify-center transition-opacity ${isPlaying && programaAtual?.programa?.foto ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
               style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: 'var(--player-live-text)' }}
             >
                {isPlaying ? 
                  <Pause className="w-6 h-6 md:w-12 md:h-12 fill-current" /> : 
                  <Play className="w-6 h-6 md:w-12 md:h-12 fill-current ml-1 md:ml-2" />
                }
             </div>
           </button>
        </div>
        
        <div className="flex flex-col pt-2 md:pt-16 whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${programaAtual ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${programaAtual ? 'text-red-500' : 'text-gray-400'}`}>
              {programaAtual ? "No Ar Agora" : "Programação Automática"}
            </span>
          </div>
          <span className="text-sm md:text-3xl font-[900] text-primary leading-none tracking-tighter">
            {siteConfig.radioFreq || theme.radioFreq || "87.9"} FM
          </span>
          {/* Programa Atual Subtitle */}
          <div className="flex flex-col mt-0.5">
            <span className="text-[9px] md:text-[11px] font-black text-primary truncate max-w-[120px] md:max-w-none">
               {programaAtual?.programa?.nome || "Música e Informação"}
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
                <h3 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none">{programaAtual.locutor.nome}</h3>
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
        {/* Controle de Volume - Visível em telas maiores */}
        <div className="hidden lg:flex items-center gap-3 mr-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all">
            <button 
              onClick={toggleMute} 
              className="text-primary dark:text-secondary hover:scale-110 transition-transform"
              title={isMuted ? "Ativar Áudio" : "Mudar para Mudo"}
            >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1.5 accent-primary dark:accent-secondary cursor-pointer appearance-none bg-gray-200 dark:bg-gray-700 rounded-lg"
            />
        </div>

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
