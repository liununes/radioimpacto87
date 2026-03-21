import { useState, useEffect } from "react";
import { Users, Calendar, Radio, Image, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getLocutores, getProgramas, getSlides } from "@/lib/radioStore";
import { supabase } from "@/integrations/supabase/client";

const AdminHome = () => {
  const [stats, setStats] = useState([
    { label: "Locutores", value: "...", icon: Users, color: "text-primary" },
    { label: "Programas", value: "...", icon: Calendar, color: "text-secondary" },
    { label: "Streaming", value: "Ativo", icon: Radio, color: "text-green-400" },
    { label: "Slides", value: "...", icon: Image, color: "text-purple-400" },
    { label: "Pedidos", value: "...", icon: Music, color: "text-pink-400" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const [locs, progs, slides] = await Promise.all([
        getLocutores(),
        getProgramas(),
        getSlides()
      ]);

      const { count: pedidosCount } = await supabase.from("pedidos").select("*", { count: 'exact', head: true });

      setStats([
        { label: "Locutores", value: String(locs.length), icon: Users, color: "text-primary" },
        { label: "Programas", value: String(progs.length), icon: Calendar, color: "text-secondary" },
        { label: "Streaming", value: "Ativo", icon: Radio, color: "text-green-400" },
        { label: "Slides", value: String(slides.length), icon: Image, color: "text-purple-400" },
        { label: "Pedidos", value: String(pedidosCount || 0), icon: Music, color: "text-pink-400" },
      ]);
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">Acesso Autorizado</div>
           <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase italic leading-none">Dashboard <span className="text-secondary italic">Impacto</span></h2>
           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Controle total da sua estação de rádio</p>
        </div>
        <div className="flex gap-3">
           <div className="px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Status Stream</span>
              <span className="text-sm font-black text-green-500 uppercase flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> ONLINE
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <Card key={s.label} className="group overflow-hidden rounded-[2rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 cursor-default bg-white">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-4xl font-black text-primary tracking-tighter transition-all group-hover:scale-110 origin-left">{s.value}</p>
              </div>
              <div className={`p-4 rounded-3xl ${idx % 2 === 0 ? 'bg-primary/5' : 'bg-accent/5'} group-hover:rotate-12 transition-all duration-500`}>
                <s.icon className={`w-10 h-10 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-primary rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
               <h3 className="text-3xl font-black uppercase italic tracking-tighter">Otimize sua Experiência</h3>
               <p className="opacity-60 text-sm font-medium max-w-xl leading-relaxed">Personalize a identidade da sua rádio, gerencie locutores e acompanhe os relatórios de audiência diretamente no menu lateral.</p>
            </div>
            <button className="bg-white text-primary h-16 px-10 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0">
               Ir para Aparência
            </button>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      </div>
    </div>
  );
};

export default AdminHome;
