import { useState, useEffect } from "react";
import { Users, Calendar, Radio, Image, Music, FileText, BarChart3, Settings, HardDrive, Zap, LifeBuoy, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLocutores, getProgramas, getSlides, clearAllStationData } from "@/lib/radioStore";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const AdminHome = () => {
  const { user, isAdmin } = useAuth();
  const isMainAdmin = isAdmin;
  const [onlineListeners, setOnlineListeners] = useState(0);
  const [activeListeners, setActiveListeners] = useState(0);
  const [loginTime, setLoginTime] = useState<string>("...");
  const [stats, setStats] = useState([
    { label: "Locutores", value: "...", icon: Users, color: "text-primary" },
    { label: "Programas", value: "...", icon: Calendar, color: "text-secondary" },
    { label: "Ouvintes On", value: "...", icon: Zap, color: "text-yellow-400" },
    { label: "Streaming", value: "Ativo", icon: Radio, color: "text-green-400" },
    { label: "Slides", value: "...", icon: Image, color: "text-purple-400" },
    { label: "Pedidos", value: "...", icon: Music, color: "text-pink-400" },
    { label: "Notícias", value: "...", icon: FileText, color: "text-blue-400" },
  ]);

  useEffect(() => {
    // REAL TIME LISTENERS WITH SUPABASE PRESENCE
    const channel = supabase.channel('online_presence', {
      config: { presence: { key: 'admin' } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const allSessions = Object.values(state).flat() as any[];
        
        // Filtrar apenas sessões que possuem um ID (público) e usar Set para contar IDs ÚNICOS
        const audienceSessions = allSessions.filter(s => s.id);
        const uniqueSessions = new Set(audienceSessions.map(s => s.id));
        setOnlineListeners(uniqueSessions.size);

        // Contar ouvintes ativos: busca se ALGUMA presença deste ID está ouvindo
        const listeningIds = new Set(
            audienceSessions
                .filter(s => s.is_listening === true || s.is_listening === "true" || s.is_listening === 1)
                .map(s => s.id)
        );
        setActiveListeners(listeningIds.size);
      })
      .subscribe();

    // Timer de Login
    const loginTimestamp = sessionStorage.getItem('adminLoginTime') || new Date().toISOString();
    if (!sessionStorage.getItem('adminLoginTime')) sessionStorage.setItem('adminLoginTime', loginTimestamp);

    const updateTimer = () => {
        const start = new Date(loginTimestamp);
        const now = new Date();
        const diff = Math.floor((now.getTime() - start.getTime()) / 60000); // minutos
        if (diff < 60) {
            setLoginTime(`${diff}m`);
        } else {
            setLoginTime(`${Math.floor(diff/60)}h ${diff%60}m`);
        }
    };
    updateTimer();
    const timer = setInterval(updateTimer, 60000);

    return () => {
      channel.unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const [otherStats, setOtherStats] = useState<any>({});

  useEffect(() => {
    const fetchOtherStats = async () => {
      const [locs, progs, slides] = await Promise.all([
        getLocutores(),
        getProgramas(),
        getSlides()
      ]);

      const { count: pedidosCount } = await supabase.from("pedidos").select("*", { count: 'exact', head: true });
      const { count: noticiasCount } = await supabase.from("noticias").select("*", { count: 'exact', head: true });
      
      setOtherStats({
        locutores: String(locs.length),
        programas: String(progs.length),
        slides: String(slides.length),
        pedidos: String(pedidosCount || 0),
        noticias: String(noticiasCount || 0),
      });
    };
    fetchOtherStats();
  }, []);

  // Update fixed stats array on demand
  useEffect(() => {
    setStats([
        { label: "Locutores", value: otherStats.locutores || "...", icon: Users, color: "text-primary" },
        { label: "Programas", value: otherStats.programas || "...", icon: Calendar, color: "text-secondary" },
        { label: "Ouvindo Agora", value: String(activeListeners), icon: Music, color: "text-red-500" },
        { label: "Hits Site (On)", value: String(onlineListeners), icon: Zap, color: "text-yellow-400" },
        { label: "Seu Login", value: loginTime, icon: Clock, color: "text-blue-500" },
        { label: "Sinal", value: "Ativo", icon: Radio, color: "text-green-400" },
        { label: "Pedidos", value: otherStats.pedidos || "...", icon: Music, color: "text-pink-400" },
      ]);
  }, [onlineListeners, activeListeners, otherStats, loginTime]);

  const handleClearAll = async () => {
    if (!confirm("🚨 ATENÇÃO: Isso excluirá TODOS os locutores e a grade de programação permanentemente. Você tem certeza?")) return;
    
    const { error } = await clearAllStationData();
    if (error) {
      toast.error("Erro ao limpar dados: " + error.message);
    } else {
      toast.success("Todos os dados de locução e programação foram limpos!");
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-none text-[10px] font-black uppercase tracking-widest">Acesso Autorizado</div>
           <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase italic leading-none">Dashboard <span className="text-secondary italic">Impacto</span></h2>
           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Controle total da sua estação de rádio</p>
        </div>
        <div className="flex gap-3">
           <div className="px-6 py-4 bg-white text-slate-900 rounded-none border border-gray-100 shadow-sm flex flex-col">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Status Stream</span>
              <span className="text-sm font-black text-green-500 uppercase flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-none animate-pulse" /> ONLINE
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stats.map((s, idx) => (
          <Card key={s.label} className="group overflow-hidden rounded-none border-none shadow-xl hover:shadow-2xl transition-all duration-500 cursor-default bg-white text-slate-900">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
              <div className={`p-3 rounded-none ${idx % 2 === 0 ? 'bg-primary/5' : 'bg-accent/5'} group-hover:rotate-12 transition-all duration-500`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">{s.label}</p>
                <p className="text-2xl font-black text-primary tracking-tighter transition-all group-hover:scale-110">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-primary rounded-none p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[300px]">
           <div className="relative z-10 space-y-4">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Otimize o Layout</h3>
              <p className="opacity-60 text-xs font-medium max-w-md leading-relaxed">Ajuste as cores, logos e visibilidade das seções do portal para criar uma identidade única.</p>
           </div>
           <Button asChild className="relative z-10 bg-white text-slate-900 text-primary h-14 w-full md:w-max px-10 rounded-none font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
              <Link to="/admin/aparencia">Personalizar Agora</Link>
           </Button>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-20 -mt-20 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="bg-secondary rounded-none p-10 text-primary relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[300px]">
           <div className="relative z-10 space-y-4">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Últimos Pedidos</h3>
              <p className="opacity-60 text-xs font-medium max-w-md leading-relaxed">Veja as músicas que seus ouvintes estão pedindo em tempo real e interaja pelo WhatsApp.</p>
           </div>
           <Button asChild className="relative z-10 bg-primary text-white h-14 w-full md:w-max px-10 rounded-none font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
              <Link to="/admin/pedidos">Atender Pedidos</Link>
           </Button>
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 -mr-20 -mb-20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
         <Link to="/admin/noticias" className="p-6 bg-white text-slate-900 border border-gray-100 rounded-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center gap-3 text-center group">
            <FileText className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Nova Notícia</span>
         </Link>
         <Link to="/admin/media" className="p-6 bg-white text-slate-900 border border-gray-100 rounded-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center gap-3 text-center group">
            <HardDrive className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Biblioteca</span>
         </Link>
         <Link to="/admin/programacao" className="p-6 bg-white text-slate-900 border border-gray-100 rounded-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center gap-3 text-center group">
            <Calendar className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Agenda</span>
         </Link>
         <Link to="/admin/streaming" className="p-6 bg-white text-slate-900 border border-gray-100 rounded-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center gap-3 text-center group">
            <Radio className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Sinal On</span>
         </Link>
         <Link to="/admin/estatisticas" className="p-6 bg-white text-slate-900 border border-gray-100 rounded-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center gap-3 text-center group">
            <BarChart3 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Histórico</span>
         </Link>
         <Link to="/admin/usuarios" className="p-6 bg-white text-slate-900 border border-gray-100 rounded-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center gap-3 text-center group">
            <Settings className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Equipe</span>
         </Link>

         {!isMainAdmin && (
           <a 
             href="https://wa.me/5533999837414" 
             target="_blank" 
             rel="noopener noreferrer" 
             className="p-6 bg-green-50 text-green-600 border border-green-100 rounded-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center gap-3 text-center group animate-pulse hover:animate-none"
           >
              <LifeBuoy className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest">Suporte Liu Record</span>
                <span className="text-[8px] font-bold opacity-70">(33) 99983-7414</span>
              </div>
           </a>
         )}
      </div>

      {isMainAdmin && (
        <div className="pt-20 border-t border-red-50">
           <div className="bg-red-50 p-10 rounded-none border border-red-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                 <h3 className="text-xl font-black uppercase text-red-600 italic tracking-tighter">Zona de Perigo</h3>
                 <p className="text-xs font-bold text-red-400 uppercase tracking-widest max-w-md leading-relaxed">Limpeza total de dados para reajuste manual. Use com cuidado extremo.</p>
              </div>
              <Button onClick={handleClearAll} variant="destructive" className="h-14 px-10 rounded-none font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-200 hover:scale-105 active:scale-95 transition-all">
                 Limpar Tudo (Locutores & Grade)
              </Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
