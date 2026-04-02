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
    { label: "Locutores", value: "...", icon: Users },
    { label: "Programas", value: "...", icon: Calendar },
    { label: "Ouvintes On", value: "...", icon: Zap },
    { label: "Streaming", value: "Ativo", icon: Radio },
    { label: "Slides", value: "...", icon: Image },
    { label: "Pedidos", value: "...", icon: Music },
    { label: "Notícias", value: "...", icon: FileText },
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

      const { error: errorPedidos, count: pedidosCount } = await supabase.from("pedidos").select("*", { count: 'exact', head: true });
      if (errorPedidos) console.error("Erro ao buscar pedidos:", errorPedidos);

      const { error: errorNoticias, count: noticiasCount } = await supabase.from("noticias").select("*", { count: 'exact', head: true });
      if (errorNoticias) console.error("Erro ao buscar noticias:", errorNoticias);
      
      setOtherStats({
        locutores: String(locs.length),
        programas: String(progs.length),
        slides: String(slides.length),
        pedidos: String(pedidosCount ?? 0),
        noticias: String(noticiasCount ?? 0),
      });
    };
    fetchOtherStats();
  }, []);

  useEffect(() => {
    setStats([
        { label: "Locutores", value: otherStats.locutores || "...", icon: Users },
        { label: "Programas", value: otherStats.programas || "...", icon: Calendar },
        { label: "Ouvindo Agora", value: String(activeListeners), icon: Music },
        { label: "Hits Site (On)", value: String(onlineListeners), icon: Zap },
        { label: "Seu Login", value: loginTime, icon: Clock },
        { label: "Sinal", value: "Ativo", icon: Radio },
        { label: "Pedidos", value: otherStats.pedidos || "...", icon: Music },
      ]);
  }, [onlineListeners, activeListeners, otherStats, loginTime]);

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
           <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
           <p className="text-sm text-muted-foreground font-medium">Controle central da Impacto FM</p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 bg-card text-card-foreground rounded-lg border border-border flex flex-col items-end">
              <span className="text-[10px] uppercase text-muted-foreground font-semibold">Sinal Stream</span>
              <span className="text-sm font-bold text-primary flex items-center gap-1.5 mt-0.5">
                 <div className="w-2 h-2 bg-primary rounded-full animate-pulse" /> ONLINE
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {stats.map((s, idx) => (
          <Card key={s.label} className="group rounded-xl border border-border shadow-none hover:shadow-sm transition-all bg-card text-card-foreground">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <div className="p-2 rounded-lg bg-primary/5 text-primary">
                <s.icon className="w-4 h-4" />
              </div>
              <div className="space-y-0 text-center">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary/5 rounded-xl p-6 relative overflow-hidden flex flex-col justify-center border border-primary/10">
           <div className="relative z-10 space-y-2">
              <h3 className="text-lg font-bold text-primary">Otimize o Layout</h3>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">Ajuste as páginas do portal e crie a identidade de sua rádio.</p>
           </div>
           <Button asChild className="relative z-10 bg-primary text-primary-foreground h-9 w-max px-5 rounded-md text-xs font-semibold mt-4">
              <Link to="/admin/aparencia">Personalizar</Link>
           </Button>
        </div>

        <div className="bg-secondary/10 rounded-xl p-6 relative overflow-hidden flex flex-col justify-center border border-secondary/20">
           <div className="relative z-10 space-y-2">
              <h3 className="text-lg font-bold text-secondary-foreground">Mural de Pedidos</h3>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">Ouça as músicas que seus ouvintes estão pedindo e interaja.</p>
           </div>
           <Button asChild className="relative z-10 bg-secondary text-secondary-foreground h-9 w-max px-5 rounded-md text-xs font-semibold mt-4 shadow-sm hover:brightness-105">
              <Link to="/admin/pedidos">Atender Pedidos</Link>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
         <Link to="/admin/noticias?tab=nova" className="p-4 bg-card text-card-foreground border border-border rounded-xl hover:border-primary/30 transition-colors flex flex-col items-center gap-2 text-center">
            <Plus className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-semibold">Nova Notícia</span>
         </Link>
         <Link to="/admin/media" className="p-4 bg-card text-card-foreground border border-border rounded-xl hover:border-primary/30 transition-colors flex flex-col items-center gap-2 text-center">
            <HardDrive className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-semibold">Biblioteca</span>
         </Link>
         <Link to="/admin/programacao" className="p-4 bg-card text-card-foreground border border-border rounded-xl hover:border-primary/30 transition-colors flex flex-col items-center gap-2 text-center">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-semibold">Agenda</span>
         </Link>
         <Link to="/admin/streaming?tab=sinal" className="p-4 bg-card text-card-foreground border border-border rounded-xl hover:border-primary/30 transition-colors flex flex-col items-center gap-2 text-center">
            <Radio className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-semibold">Sinal On</span>
         </Link>
         <Link to="/admin/estatisticas" className="p-4 bg-card text-card-foreground border border-border rounded-xl hover:border-primary/30 transition-colors flex flex-col items-center gap-2 text-center">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-semibold">Estatísticas</span>
         </Link>
         <Link to="/admin/usuarios" className="p-4 bg-card text-card-foreground border border-border rounded-xl hover:border-primary/30 transition-colors flex flex-col items-center gap-2 text-center">
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-semibold">Equipe</span>
         </Link>

         {!isMainAdmin && (
           <a 
             href="https://wa.me/5533999837414" 
             target="_blank" 
             rel="noopener noreferrer" 
             className="col-span-2 lg:col-span-6 p-3 bg-primary/5 text-primary border border-primary/10 rounded-xl hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
           >
              <LifeBuoy className="w-4 h-4" />
              <span className="text-xs font-semibold">Suporte (33) 99983-7414</span>
           </a>
         )}
      </div>

      { (isMainAdmin || hasPermission('danger_zone')) && (
        <div className="pt-6">
           <div className="bg-card p-5 rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                 <h3 className="text-sm font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                    <LifeBuoy className="w-4 h-4 text-muted-foreground" /> Configurações de Dados
                 </h3>
                 <p className="text-xs text-muted-foreground">Área para manutenção e limpeza do banco.</p>
              </div>
              <Button asChild variant="outline" className="h-9 px-6 rounded-md text-xs w-full sm:w-auto hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                 <Link to="/admin/danger-zone">Gerenciar Sistema</Link>
              </Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
