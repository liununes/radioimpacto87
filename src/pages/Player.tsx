import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import { getSiteConfig, getProgramaAtual, getRedesSociais, type Programa, type Locutor, type RedeSocial } from "@/lib/radioStore";
import { toast } from "sonner";

const PlayerPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const [programaAtual, setProgramaAtual] = useState<{ programa: Programa; locutor: Locutor } | null>(null);
  const [redes, setRedes] = useState<RedeSocial[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const loadData = async () => {
    const site = (await getSiteConfig("site")) || {};
    const streaming = (await getSiteConfig("streaming")) || {};
    setSiteConfig({ ...site, ...streaming });
    setRedes(await getRedesSociais());
    setProgramaAtual(await getProgramaAtual());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      setProgramaAtual(await getProgramaAtual());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (audioRef.current && siteConfig.streamUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        let url = siteConfig.streamUrl;
        if (!url.endsWith(';') && !url.includes('?')) {
          url += ';';
        }
        
        audioRef.current.src = url;
        audioRef.current.load();
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
             console.error("Erro ao tocar áudio:", err);
             if (audioRef.current) {
               audioRef.current.src = siteConfig.streamUrl;
               audioRef.current.load();
               audioRef.current.play().catch(e => console.error(e));
             }
          });
        }
      }
      setIsPlaying(!isPlaying);
    } else if (!siteConfig.streamUrl) {
       toast.error("URL de streaming não configurada!");
    }
  };

  return (
    <div className="min-h-screen bg-[#002e5d] text-white flex flex-col items-center justify-center p-8 font-sans">
      <audio ref={audioRef} src={siteConfig.streamUrl} />
      
      {/* Header / Logo */}
      <div className="mb-10 text-center">
         <div className="w-24 h-24 bg-white rounded-3xl p-4 mx-auto mb-4 shadow-2xl flex items-center justify-center">
            <img src={siteConfig.logo} alt="Logo" className="w-full h-full object-contain" />
         </div>
         <h1 className="text-2xl font-black uppercase tracking-tighter italic" style={{ color: 'var(--text-title)' }}>{siteConfig.radioName || "Impacto FM"}</h1>
         <span className="font-black text-xl italic" style={{ color: 'var(--text-detail)' }}>{siteConfig.radioFreq || "87.9"} FM</span>
      </div>

      {/* Programa Atual / Disco rando */}
      <div className="relative mb-12">
         {/* Aro ao Vivo Animado */}
         <div className={`absolute -inset-6 border-4 border-secondary rounded-full ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''} opacity-20`} />
         <div className={`absolute -inset-10 border-2 border-white/10 rounded-full ${isPlaying ? 'animate-[spin_15s_linear_infinite_reverse]' : ''}`} />
         
         <div className="w-64 h-64 rounded-full bg-primary overflow-hidden border-8 border-white/5 relative shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            {programaAtual?.programa?.foto ? (
              <img src={programaAtual.programa.foto} alt={programaAtual.programa.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#001d3d] flex items-center justify-center">
                 <Play className="w-20 h-20 text-white/10" />
              </div>
            )}
            
            {/* Overlay with play button */}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
               <button onClick={togglePlay} className="w-20 h-20 rounded-full bg-secondary text-primary flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                  {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
               </button>
            </div>
         </div>
      </div>

      {/* Info do Programa */}
      <div className="text-center mb-10 space-y-2">
         <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Ao Vivo Agora</span>
         </div>
         <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none" style={{ color: 'var(--text-title)' }}>
            {programaAtual?.programa?.nome || "Impacto Musical"}
         </h2>
         <p className="font-bold uppercase tracking-widest text-xs italic" style={{ color: 'var(--text-detail)' }}>
            Com {programaAtual?.locutor?.nome || "Equipe Impacto"}
         </p>
      </div>

      {/* Controles de Volume */}
      <div className="w-full max-w-xs flex items-center gap-4 mb-12 px-6 py-4 bg-white/5 rounded-3xl border border-white/5">
         <Volume2 className="w-5 h-5 text-white/40" />
         <input 
           type="range" 
           className="flex-1 accent-secondary h-1.5"
           onChange={(e) => { if(audioRef.current) audioRef.current.volume = parseInt(e.target.value)/100 }}
           defaultValue={100}
         />
      </div>

      {/* Redes Sociais */}
      <div className="flex gap-4">
         {redes.map(r => {
            const Icon = r.nome.toLowerCase().includes('insta') ? Instagram : 
                        r.nome.toLowerCase().includes('face') ? Facebook :
                        r.nome.toLowerCase().includes('yout') ? Youtube : 
                        r.nome.toLowerCase().includes('whats') ? MessageCircle : MessageCircle;
            return (
               <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all">
                  <span className="sr-only">{r.nome}</span>
                  {/* Fallback to simple icon if dynamic not working */}
                  <div className="w-5 h-5 flex items-center justify-center font-black">
                     {r.nome.substring(0,1).toUpperCase()}
                  </div>
               </a>
            )
         })}
      </div>
    </div>
  );
};

export default PlayerPage;
