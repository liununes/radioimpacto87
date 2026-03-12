import { useState, useEffect } from "react";
import { Trash2, Music, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Pedido {
  id: string;
  nome: string | null;
  musica: string;
  artista: string | null;
  status: string | null;
  created_at: string;
}

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast.error("Erro ao buscar pedidos: " + error.message);
    } else {
      setPedidos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPedidos(); }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("pedidos").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar status.");
    } else {
      toast.success(`Pedido marcado como ${newStatus}!`);
      fetchPedidos();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este pedido?")) return;
    const { error } = await supabase.from("pedidos").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir.");
    } else {
      toast.success("Pedido removido!");
      fetchPedidos();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pedidos Musicais</h2>
          <p className="text-sm text-muted-foreground">Pedidos enviados pelos ouvintes através do site.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPedidos}>Atualizar Lista</Button>
      </div>

      <div className="space-y-3">
        {pedidos.map(pedido => (
          <Card key={pedido.id} className={pedido.status === 'tocada' ? 'opacity-60 grayscale' : ''}>
            <CardContent className="p-4 flex items-center gap-4">
              <Music className={`w-8 h-8 shrink-0 ${pedido.status === 'tocada' ? 'text-muted-foreground' : 'text-primary'}`} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{pedido.musica} {pedido.artista && <span className="text-muted-foreground font-normal"> - {pedido.artista}</span>}</h3>
                <p className="text-sm text-muted-foreground">Ouvinte: {pedido.nome || "Anônimo"}</p>
                <div className="flex gap-2 mt-1 items-center">
                  <p className="text-xs text-muted-foreground">{new Date(pedido.created_at).toLocaleString('pt-BR')}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                    pedido.status === 'tocada' ? 'bg-green-500/20 text-green-500' : 
                    pedido.status === 'recusada' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {pedido.status || 'pendente'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                {pedido.status !== 'tocada' && (
                  <Button size="icon" variant="ghost" className="text-green-500" onClick={() => handleUpdateStatus(pedido.id, 'tocada')} title="Marcar como Tocada">
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
                {pedido.status === 'pendente' && (
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleUpdateStatus(pedido.id, 'recusada')} title="Recusar">
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(pedido.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && pedidos.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum pedido musical recebido.</p>
          </div>
        )}
        {loading && <p className="text-center text-muted-foreground py-12">Carregando pedidos...</p>}
      </div>
    </div>
  );
};

export default AdminPedidos;
