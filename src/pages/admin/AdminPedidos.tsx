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
  mensagem: string;
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
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Music className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex items-center gap-6">
           <div className="w-16 h-16 bg-purple-600 text-white flex items-center justify-center rounded-none shadow-lg">
              <Mic2 className="w-8 h-8" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Mural de <span className="text-secondary italic">Pedidos</span></h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Acompanhe as solicitações musicais em tempo real</p>
           </div>
        </div>
        <Button onClick={fetchPedidos} disabled={loading} variant="outline" className="rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-6 hover:bg-primary/5">
           {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />} Atualizar Mural
        </Button>
      </div>

      {pedidos.length === 0 && !loading ? (
        <Card className="rounded-none border-dashed border-2 border-gray-200 p-20 text-center animate-pulse">
           <Music className="w-16 h-16 text-gray-200 mx-auto mb-4" />
           <p className="font-black uppercase text-gray-400 text-xs tracking-widest">Nenhum pedido no momento. O DJ está livre!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {pedidos.map((p) => (
             <Card key={p.id} className="rounded-none border-none shadow-xl bg-white text-slate-900 group relative overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-500">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-600 group-hover:w-2 transition-all" />
                <CardHeader className="p-8 pb-4">
                   <div className="flex justify-between items-start mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-none text-[9px] font-black uppercase tracking-widest">
                         <Clock className="w-3 h-3" /> {new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                   <CardTitle className="text-xl font-black uppercase tracking-tighter text-primary group-hover:text-purple-600 transition-colors line-clamp-2 italic">{p.musica}</CardTitle>
                   <CardDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest">{p.artista || "Autor Desconhecido"}</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                   <div className="space-y-6">
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-none italic text-sm text-slate-600 relative">
                         <Sparkles className="absolute -top-2 -left-2 w-4 h-4 text-secondary opacity-50" />
                         "{p.mensagem || 'Manda aquela música!'}"
                      </div>
                      <div className="flex items-center gap-4 border-t border-gray-50 pt-6">
                         <div className="w-10 h-10 bg-primary/5 rounded-none flex items-center justify-center text-primary font-black uppercase italic text-xs">
                            {p.nome?.[0] || "?"}
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-primary leading-none">{p.nome || "Ouvinte Anônimo"}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Pediu agora pouco</p>
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
