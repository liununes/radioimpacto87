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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estatísticas</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Visão geral do tráfego e interações no site da rádio.</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg text-primary text-sm font-semibold">
            <Activity className="w-4 h-4 animate-pulse" />
            Em Tempo Real
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl border border-border shadow-sm bg-primary text-primary-foreground overflow-hidden p-6 relative">
           <div className="relative z-10">
              <p className="text-sm font-semibold opacity-80 mb-1">Últimas 24 Horas</p>
              <h3 className="text-4xl font-bold">{loading ? "..." : inLast24h}</h3>
              <p className="text-xs font-medium opacity-70 mt-3">Acessos únicos</p>
           </div>
           <Clock className="absolute top-6 right-6 w-12 h-12 opacity-10" />
        </Card>

        <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground p-6">
           <p className="text-sm font-semibold text-muted-foreground mb-1">Pico (1h / 12h)</p>
           <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold">{loading ? "..." : inLast1h}</h3>
              <span className="text-xl font-medium text-muted-foreground">/ {inLast12h}</span>
           </div>
           <p className="text-xs font-medium text-muted-foreground mt-3">Visitantes ativos hoje</p>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground p-6">
           <p className="text-sm font-semibold text-muted-foreground mb-1 capitalize">{format(now, "MMMM", { locale: ptBR })}</p>
           <h3 className="text-4xl font-bold">{loading ? "..." : inMonth}</h3>
           <p className="text-xs font-medium text-muted-foreground mt-3">Acessos registrados</p>
        </Card>

        <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden p-6 relative">
           <div className="relative z-10">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Ano Atual</p>
              <h3 className="text-4xl font-bold">{loading ? "..." : inYear}</h3>
              <p className="text-xs font-medium text-muted-foreground mt-3">Visitantes acumulados</p>
           </div>
           <Users className="absolute top-6 right-6 w-12 h-12 text-muted-foreground/10" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden">
          <CardHeader className="p-6 pb-2 border-b border-border/50">
            <CardTitle className="text-lg font-bold">Fluxo de Acesso (24H)</CardTitle>
            <CardDescription className="text-sm">Oscilação de audiência por hora</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                   <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAcessos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" fontSize={12} fontWeight="500" tickLine={false} axisLine={false} tick={{fill: 'var(--muted-foreground)'}} />
                    <YAxis fontSize={12} fontWeight="500" tickLine={false} axisLine={false} tick={{fill: 'var(--muted-foreground)'}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '0.5rem', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                      itemStyle={{ color: 'var(--foreground)', fontWeight: '600', fontSize: '14px' }}
                    />
                    <Area type="monotone" dataKey="acessos" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAcessos)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden flex flex-col justify-between">
          <CardHeader className="p-6 border-b border-border/50">
            <CardTitle className="text-lg font-bold">Consulta Histórica</CardTitle>
            <CardDescription className="text-sm">Consulte tráfego de datas específicas</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col gap-6">
            <div className="w-full">
              <Input 
                type="date" 
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="h-11 rounded-lg bg-background text-foreground font-semibold shadow-sm w-full"
              />
            </div>
            <div className="text-center bg-muted/30 border border-border rounded-xl p-8 flex-1 flex flex-col items-center justify-center">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Acessos no dia</p>
              <h3 className="text-5xl font-bold text-primary">{customDateAccesses}</h3>
              <div className="mt-4">
                 <div className="px-3 py-1 bg-secondary/10 rounded-md border border-secondary/20">
                    <span className="text-xs font-semibold text-secondary">Registros Verificados</span>
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
