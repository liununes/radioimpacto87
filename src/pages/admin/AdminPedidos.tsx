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
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Central de <span className="text-secondary italic">Pedidos</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Músicas e recados enviados pelos ouvintes em tempo real</p>
        </div>
        <Button onClick={fetchPedidos} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-blue-900/10">Atualizar Agora</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pedidos.map(pedido => (
          <Card key={pedido.id} className={`group rounded-[2rem] border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white text-slate-900 overflow-hidden p-8 ${pedido.status === 'tocada' ? 'opacity-60 saturate-50' : ''}`}>
            <CardContent className="p-0 flex flex-col md:flex-row items-center gap-8">
              <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner ${pedido.status === 'tocada' ? 'bg-gray-100' : 'bg-primary/5'}`}>
                 <Music className={`w-8 h-8 ${pedido.status === 'tocada' ? 'text-gray-300' : 'text-primary'}`} />
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                 <h3 className="text-xl font-black text-primary uppercase tracking-tight italic">
                    {pedido.musica} 
                    {pedido.artista && <span className="text-secondary font-bold ml-2">— {pedido.artista}</span>}
                 </h3>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Ouvinte: <span className="text-primary">{pedido.nome || "ANÔNIMO"}</span></span>
                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">•</span>
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-accent animate-pulse" /> {new Date(pedido.created_at).toLocaleTimeString('pt-BR')}
                    </span>
                 </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-3xl border border-gray-100">
                 <span className={`text-[9px] px-4 py-2 rounded-xl font-black uppercase tracking-widest ${
                    pedido.status === 'tocada' ? 'bg-green-100 text-green-600' : 
                    pedido.status === 'recusada' ? 'bg-red-100 text-red-600' : 'bg-secondary text-primary shadow-lg shadow-yellow-400/20'
                 }`}>
                    {pedido.status || 'pendente'}
                 </span>
                 
                 <div className="h-6 w-px bg-gray-200 mx-2" />
                 
                 <div className="flex gap-1">
                    {pedido.status !== 'tocada' && (
                      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-green-500 hover:bg-green-50" onClick={() => handleUpdateStatus(pedido.id, 'tocada')} title="Atender Pedido">
                        <CheckCircle2 className="w-5 h-5" />
                      </Button>
                    )}
                    {pedido.status === 'pendente' && (
                      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-red-400 hover:bg-red-50" onClick={() => handleUpdateStatus(pedido.id, 'recusada')} title="Ignorar">
                        <XCircle className="w-5 h-5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(pedido.id)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!loading && pedidos.length === 0 && (
          <div className="py-32 bg-gray-50 rounded-[4rem] border-4 border-dashed border-white flex flex-col items-center justify-center text-gray-200 space-y-4">
            <Music className="w-20 h-20 opacity-10" />
            <p className="text-[11px] font-black uppercase tracking-[0.5em]">Nenhum pedido recente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPedidos;
