import { useState, useEffect } from "react";
import { Users, Calendar, Radio, Image, Music, FileText, BarChart3, Settings, HardDrive, Zap, LifeBuoy, Clock, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLocutores, getProgramas, getSlides } from "@/lib/radioStore";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AdminHome = () => {
  const { user, isAdmin, hasPermission } = useAuth();
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
    const channel = supabase.channel('online_presence', {
      config: { presence: { key: 'admin' } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const allSessions = Object.values(state).map((v: any) => v[0]).filter(s => s.id);
        setOnlineListeners(allSessions.length);
        const activeCount = allSessions.filter(s => s.is_listening === true || s.is_listening === "true").length;
        setActiveListeners(activeCount);
      })
      .subscribe();

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

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div className="space-y-1">
           <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">Acesso Autorizado</div>
           <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Dashboard <span className="text-primary">Impacto</span></h2>
           <p className="text-sm text-muted-foreground font-medium">Controle total da sua estação de rádio</p>
        </div>
        <div className="flex gap-3">
           <div className="px-5 py-3 bg-card text-card-foreground rounded-xl border border-border flex flex-col items-end">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status Stream</span>
              <span className="text-sm font-bold text-emerald-500 flex items-center gap-2 mt-0.5">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> ONLINE
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stats.map((s, idx) => (
          <Card key={s.label} className="group overflow-hidden rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card text-card-foreground">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
              <div className={`p-2.5 rounded-lg ${idx % 2 === 0 ? 'bg-primary/10' : 'bg-secondary/10'} group-hover:scale-110 transition-transform duration-300`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[250px] border border-primary/20">
           <div className="relative z-10 space-y-3">
              <h3 className="text-2xl font-bold tracking-tight">Otimize o Layout</h3>
              <p className="text-primary-foreground/80 text-sm font-medium max-w-sm leading-relaxed">Ajuste cores, logos e visibilidade das seções do portal para criar uma identidade única.</p>
           </div>
           <Button asChild className="relative z-10 bg-white text-slate-900 border border-white h-11 w-full md:w-max px-6 rounded-lg font-semibold shadow-sm hover:scale-105 active:scale-95 transition-transform mt-6">
              <Link to="/admin/aparencia">Personalizar</Link>
           </Button>
           <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="bg-secondary/10 rounded-2xl p-8 text-foreground relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[250px] border border-border">
           <div className="relative z-10 space-y-3">
              <h3 className="text-2xl font-bold tracking-tight">Últimos Pedidos</h3>
              <p className="text-muted-foreground text-sm font-medium max-w-sm leading-relaxed">Veja as músicas que seus ouvintes estão pedindo em tempo real e interaja.</p>
           </div>
           <Button asChild className="relative z-10 bg-primary text-primary-foreground h-11 w-full md:w-max px-6 rounded-lg font-semibold shadow-sm hover:scale-105 active:scale-95 transition-transform mt-6">
              <Link to="/admin/pedidos">Atender Pedidos</Link>
           </Button>
           <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
         <Link to="/admin/noticias?tab=nova" className="p-5 bg-card text-card-foreground border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col items-center gap-3 text-center group">
            <Plus className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Publicar News</span>
         </Link>
         <Link to="/admin/media" className="p-5 bg-card text-card-foreground border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col items-center gap-3 text-center group">
            <HardDrive className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Biblioteca</span>
         </Link>
         <Link to="/admin/programacao" className="p-5 bg-card text-card-foreground border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col items-center gap-3 text-center group">
            <Calendar className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Agenda</span>
         </Link>
         <Link to="/admin/streaming?tab=sinal" className="p-5 bg-card text-card-foreground border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col items-center gap-3 text-center group">
            <Radio className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Sinal On</span>
         </Link>
         <Link to="/admin/estatisticas" className="p-5 bg-card text-card-foreground border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col items-center gap-3 text-center group">
            <BarChart3 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Estatísticas</span>
         </Link>
         <Link to="/admin/usuarios" className="p-5 bg-card text-card-foreground border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col items-center gap-3 text-center group">
            <Settings className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Equipe</span>
         </Link>

         {!isMainAdmin && (
           <a 
             href="https://wa.me/5533999837414" 
             target="_blank" 
             rel="noopener noreferrer" 
             className="col-span-2 md:col-span-3 lg:col-span-6 p-5 py-4 bg-green-50 text-green-700 border border-green-200 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group"
           >
              <LifeBuoy className="w-5 h-5" />
              <span className="text-sm font-semibold">Suporte Técnico — (33) 99983-7414</span>
           </a>
         )}
      </div>

      { (isMainAdmin || hasPermission('danger_zone')) && (
        <div className="pt-10">
           <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-red-50/50 transition-colors">
              <div className="space-y-1 text-center md:text-left">
                 <h3 className="text-lg font-bold text-red-600 flex items-center justify-center md:justify-start gap-2">
                    <LifeBuoy className="w-5 h-5" /> Zona de Perigo
                 </h3>
                 <p className="text-sm font-medium text-red-500">Área restrita. Gerenciamento de dados críticos e sistema.</p>
              </div>
              <Button asChild variant="destructive" className="h-10 px-8 rounded-lg font-semibold shadow-sm hover:bg-red-700 w-full md:w-auto">
                 <Link to="/admin/danger-zone">Acessar</Link>
              </Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
