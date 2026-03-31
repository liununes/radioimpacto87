import { useState } from "react";
import { AlertTriangle, Trash2, RotateCcw, ShieldAlert, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { clearAllStationData } from "@/lib/radioStore";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const AdminDangerZone = () => {
  const { isAdmin, hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClearAll = async () => {
    if (!confirm("🚨 ATENÇÃO: Isso excluirá TODOS os locutores e a grade de programação permanentemente. Você tem certeza?")) return;
    
    setLoading(true);
    const { error } = await clearAllStationData();
    if (error) {
      toast.error("Erro ao limpar dados: " + error.message);
    } else {
      toast.success("Todos os dados de locução e programação foram limpos!");
      setTimeout(() => window.location.reload(), 1500);
    }
    setLoading(false);
  };

  if (!isAdmin && !hasPermission('danger_zone')) {
    return <div className="p-12 text-center font-black uppercase text-red-500">Acesso Restrito</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-red-600 p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-red-600 rounded-none text-[10px] font-black tracking-widest uppercase mb-4">
            <ShieldAlert className="w-4 h-4" /> Uso restrito ao Administrador Master
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
            Zona de <span className="text-white">Perigo</span>
          </h2>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[11px]">Gerenciamento de dados críticos e limpeza de sistema</p>
        </div>
        <AlertTriangle className="absolute top-1/2 right-[-20px] transform -translate-y-1/2 w-64 h-64 text-white/10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="rounded-none border-none shadow-xl overflow-hidden bg-white text-slate-900 border-l-4 border-l-red-600">
          <CardHeader className="p-8 pb-4">
               <div className="flex items-center gap-4 text-red-600 mb-2">
                   <Trash2 className="w-8 h-8" />
                   <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Reset Total do Sistema</CardTitle>
               </div>
               <CardDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ação Irreversível</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-8">
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Esta ação removerá permanentemente todos os registros de <strong>Locutores</strong> e toda a <strong>Grade de Programação</strong>. 
                Isso é útil para reconfigurar a rádio do zero ou limpar dados de teste.
            </p>
            
            <div className="bg-red-50 p-6 border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                     <Zap className="w-6 h-6 text-red-500 animate-pulse" />
                     <p className="text-[10px] font-black uppercase text-red-400 tracking-widest">Confirme se você realmente deseja prosseguir</p>
                </div>
                <Button 
                   onClick={handleClearAll} 
                   variant="destructive" 
                   disabled={loading}
                   className="h-16 px-12 rounded-none font-black uppercase text-xs tracking-widest shadow-xl bg-red-600 hover:bg-red-700 transition-all"
                >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Limpar Todo o Sistema"}
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-none shadow-xl overflow-hidden bg-white text-slate-900 border-l-4 border-l-orange-500">
           <CardHeader className="p-8 pb-4">
               <div className="flex items-center gap-4 text-orange-500 mb-2">
                   <RotateCcw className="w-8 h-8" />
                   <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Limpar Cache de Imagens</CardTitle>
               </div>
           </CardHeader>
           <CardContent className="p-8 pt-4 space-y-8">
               <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest">
                   Esta função removerá imagens não utilizadas do Storage para otimizar espaço em disco e banco de dados. 
                   Estará disponível na próxima atualização majoritária do sistema.
               </p>
               
               <div className="bg-orange-50 p-6 border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                        <Zap className="w-6 h-6 text-orange-400" />
                        <p className="text-[10px] font-black uppercase text-orange-400 tracking-widest">Função em desenvolvimento</p>
                   </div>
                   <Button 
                      disabled
                      className="h-16 px-12 rounded-none font-black uppercase text-xs tracking-widest shadow-xl bg-orange-500 hover:bg-orange-600 transition-all opacity-50 cursor-not-allowed"
                   >
                      Em Breve
                   </Button>
               </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDangerZone;
