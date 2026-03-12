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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Painel Geral</h2>
        <p className="text-sm text-muted-foreground">Resumo do sistema Impacto FM 87.9</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
