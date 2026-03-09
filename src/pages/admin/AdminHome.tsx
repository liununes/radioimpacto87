import { Users, Calendar, Radio, Image, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getLocutores, getProgramas } from "@/lib/radioStore";

const stats = () => {
  const locutores = getLocutores();
  const programas = getProgramas();
  return [
    { label: "Locutores", value: locutores.length, icon: Users, color: "text-primary" },
    { label: "Programas", value: programas.length, icon: Calendar, color: "text-secondary" },
    { label: "Streaming", value: "Ativo", icon: Radio, color: "text-green-400" },
    { label: "Slides", value: "3", icon: Image, color: "text-purple-400" },
    { label: "Pedidos", value: "0", icon: Music, color: "text-pink-400" },
  ];
};

const AdminHome = () => {
  const data = stats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Painel Geral</h2>
        <p className="text-sm text-muted-foreground">Resumo do sistema Impacto FM 87.9</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {data.map((s) => (
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
