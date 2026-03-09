import { useState } from "react";
import { Trash2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STORAGE_KEY = "radio_pedidos";

interface Pedido {
  id: string;
  nome: string;
  musica: string;
  mensagem: string;
  data: string;
}

function getPedidos(): Pedido[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>(getPedidos());

  const handleDelete = (id: string) => {
    const updated = pedidos.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPedidos(updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Pedidos Musicais</h2>
      <p className="text-sm text-muted-foreground">Pedidos enviados pelos ouvintes através do site.</p>

      <div className="space-y-3">
        {pedidos.map(pedido => (
          <Card key={pedido.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <Music className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{pedido.musica}</h3>
                <p className="text-sm text-muted-foreground">De: {pedido.nome}</p>
                {pedido.mensagem && <p className="text-xs text-muted-foreground mt-1">{pedido.mensagem}</p>}
                <p className="text-xs text-muted-foreground/60 mt-1">{pedido.data}</p>
              </div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(pedido.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {pedidos.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum pedido musical recebido.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPedidos;
