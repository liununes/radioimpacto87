import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Clock, Calendar, BarChart3, Users, CalendarDays, Activity } from "lucide-react";
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-primary" /> Relatórios de Acesso
        </h2>
        <p className="text-muted-foreground">Monitore o tráfego do site em tempo real pelo sistema de sessão única.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Últimas 24 Horas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{loading ? "..." : inLast24h}</div>
            <p className="text-xs text-muted-foreground mt-1">Acessos únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" /> Últimas 1h / 12h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold">{loading ? "..." : inLast1h}</div>
              <span className="text-xs text-muted-foreground mb-1">/ {inLast12h} acessos</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Visitantes ativos hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-400" /> Neste Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{loading ? "..." : inMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">{format(now, "MMMM", { locale: ptBR })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" /> Neste Ano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{loading ? "..." : inYear}</div>
            <p className="text-xs text-muted-foreground mt-1">Volume total gerado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader>
            <CardTitle>Fluxo de Acesso (24H)</CardTitle>
            <CardDescription>Pico de acessos de ontem para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">Carregando gráfico...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAcessos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Area type="monotone" dataKey="acessos" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorAcessos)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" /> Buscar Data Específica
            </CardTitle>
            <CardDescription>Confira o tráfego exato de um dia que já passou.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-full">
              <Input 
                type="date" 
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full text-lg p-6 bg-muted/50"
              />
            </div>
            <div className="text-center bg-card border rounded-full px-8 py-6 w-full shadow-inner">
              <p className="text-sm text-muted-foreground mb-1">Acessos registrados</p>
              <h3 className="text-5xl font-black text-primary">{customDateAccesses}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEstatisticas;
