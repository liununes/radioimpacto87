import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Clock, Calendar, BarChart3, Users, CalendarDays, Activity, Loader2 } from "lucide-react";
import { format, subHours, subDays, startOfMonth, startOfYear, isAfter, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";

const AdminEstatisticas = () => {
  const [accesses, setAccesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customDate, setCustomDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const fetchAccesses = async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('site_accesses')
        .select('created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAccesses(data.map((d: any) => parseISO(d.created_at)));
      }
      setLoading(false);
    };

    fetchAccesses();
  }, []);

  // Calc metrics
  const now = new Date();
  
  const inLast1h = accesses.filter(d => isAfter(d, subHours(now, 1))).length;
  const inLast12h = accesses.filter(d => isAfter(d, subHours(now, 12))).length;
  const inLast24h = accesses.filter(d => isAfter(d, subHours(now, 24))).length;
  const inMonth = accesses.filter(d => isAfter(d, startOfMonth(now))).length;
  const inYear = accesses.filter(d => isAfter(d, startOfYear(now))).length;

  // Custom date
  const selectedDate = new Date(customDate + "T00:00:00");
  const endOfSelectedDate = new Date(customDate + "T23:59:59");
  
  const customDateAccesses = accesses.filter(d => {
    return selectedDate && endOfSelectedDate && isWithinInterval(d, { start: selectedDate, end: endOfSelectedDate });
  }).length;

  // Build Hourly Graph for last 24h
  const hourlyData = Array.from({ length: 24 }).map((_, i) => {
    const h = subHours(now, 23 - i);
    const count = accesses.filter(d => {
      return d.getHours() === h.getHours() && d.getDate() === h.getDate();
    }).length;

    return {
      name: format(h, "HH:00"),
      acessos: count
    };
  });

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Métricas de <span className="text-secondary italic">Audiência</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Monitore o tráfego do site em tempo real</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-none border border-primary/10">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Sistema de Monitoramento Ativo</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="rounded-none border-none shadow-xl bg-primary text-white overflow-hidden p-8 relative">
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Últimas 24 Horas</p>
              <h3 className="text-5xl font-black italic">{loading ? "..." : inLast24h}</h3>
              <p className="text-[9px] font-bold text-white/30 uppercase mt-4">Acessos únicos registrados</p>
           </div>
           <Clock className="absolute top-8 right-8 w-12 h-12 text-white/5" />
        </Card>

        <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden p-8">
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Pico (1h / 12h)</p>
           <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-primary italic">{loading ? "..." : inLast1h}</h3>
              <span className="text-xl font-bold text-gray-200">/ {inLast12h}</span>
           </div>
           <p className="text-[9px] font-bold text-gray-300 uppercase mt-4">Visitantes ativos hoje</p>
        </Card>

        <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden p-8">
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{format(now, "MMMM", { locale: ptBR })}</p>
           <h3 className="text-4xl font-black text-primary italic">{loading ? "..." : inMonth}</h3>
           <p className="text-[9px] font-bold text-gray-300 uppercase mt-4">Total acumulado no mês</p>
        </Card>

        <Card className="rounded-none border-none shadow-xl bg-[#002e5d] text-white overflow-hidden p-8 relative">
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Volume Anual</p>
              <h3 className="text-4xl font-black italic">{loading ? "..." : inYear}</h3>
              <p className="text-[9px] font-bold text-white/20 uppercase mt-4">Métricas de alcance total</p>
           </div>
           <Users className="absolute top-8 right-8 w-12 h-12 text-white/5" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
          <CardHeader className="p-10 pb-0">
            <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">Fluxo de Acesso (24H)</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-300 mt-2">Oscilação de audiência por hora</CardDescription>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[350px] w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center text-gray-200">
                   <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAcessos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#002e5d" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#002e5d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={9} fontWeight="900" tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis fontSize={9} fontWeight="900" tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1.5rem' }}
                      itemStyle={{ color: '#002e5d', fontWeight: '900', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="acessos" stroke="#002e5d" strokeWidth={4} fillOpacity={1} fill="url(#colorAcessos)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 rounded-none border-none shadow-xl bg-gray-50 overflow-hidden flex flex-col justify-between">
          <CardHeader className="p-10">
            <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">Arquivo Histórico</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-300 mt-2">Consulte tráfego de datas específicas</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-0 flex-1 flex flex-col items-center justify-center gap-10">
            <div className="w-full">
              <Input 
                type="date" 
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="h-14 rounded-none border-none bg-white text-slate-900 font-black text-primary text-center shadow-sm"
              />
            </div>
            <div className="text-center bg-white text-slate-900 border border-gray-100 rounded-none px-8 py-10 w-full shadow-lg">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">Acessos no dia</p>
              <h3 className="text-6xl font-black text-primary italic">{customDateAccesses}</h3>
              <div className="mt-6 flex justify-center">
                 <div className="px-4 py-1.5 bg-secondary/10 rounded-none border border-secondary/20">
                    <span className="text-[8px] font-black text-secondary uppercase tracking-[0.2em]">Registros Verificados</span>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEstatisticas;
