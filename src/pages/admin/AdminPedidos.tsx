import { useState, useEffect } from "react";
import { Music, Trash2, Clock, User, Heart, Mic2, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Pedido {
  id: string;
  nome: string;
  musica: string;
  artista: string;
  mensagem?: string;
  status?: string;
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
      console.error("Erro ao buscar pedidos:", error);
      toast.error("Erro ao carregar pedidos. Verifique se a tabela 'pedidos' existe.");
    } else {
      setPedidos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPedidos(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este pedido?")) return;
    const { error } = await supabase.from("pedidos").delete().eq("id", id);
    if (!error) {
      toast.success("Pedido removido!");
      fetchPedidos();
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl shadow-sm">
              <Mic2 className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-2xl font-bold tracking-tight">Mural de Pedidos</h2>
              <p className="text-sm font-medium text-muted-foreground mt-1">Acompanhe as solicitações musicais em tempo real.</p>
           </div>
        </div>
        <Button onClick={fetchPedidos} disabled={loading} variant="outline" className="rounded-lg font-semibold text-sm h-11 px-6 w-full sm:w-auto shadow-sm">
           {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />} Atualizar Mural
        </Button>
      </div>

      {pedidos.length === 0 && !loading ? (
        <Card className="rounded-xl border-dashed border-2 border-border p-16 flex flex-col items-center justify-center bg-muted/30">
           <Music className="w-12 h-12 text-muted-foreground/30 mb-4" />
           <p className="font-semibold text-muted-foreground text-sm">Nenhum pedido no momento. O DJ está livre!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {pedidos.map((p) => (
             <Card key={p.id} className="rounded-xl border border-border shadow-sm bg-card text-card-foreground flex flex-col overflow-hidden hover:shadow-md transition-all group">
                <CardHeader className="p-6 pb-4">
                   <div className="flex justify-between items-start mb-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                         <Clock className="w-3.5 h-3.5" /> {new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1" title="Remover pedido">
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                   <CardTitle className="text-lg font-bold text-foreground line-clamp-2">{p.musica}</CardTitle>
                   <CardDescription className="text-sm font-medium text-muted-foreground mt-1">{p.artista || "Autor Desconhecido"}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between">
                   <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-xl text-sm text-foreground/80 relative mt-2 border border-border/50">
                         "{p.mensagem || 'Manda aquela música!'}"
                      </div>
                      <div className="flex items-center gap-3 pt-4">
                         <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                            {p.nome?.[0]?.toUpperCase() || "?"}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-foreground">{p.nome || "Ouvinte Anônimo"}</p>
                            <p className="text-xs font-medium text-muted-foreground mt-0.5">Pediu agora pouco</p>
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>
      )}
    </div>
  );
};

export default AdminPedidos;
