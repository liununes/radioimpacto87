import { useState } from "react";
import { AlertTriangle, Trash2, RotateCcw, ShieldAlert, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { clearAllStationData, cleanupUnusedImages } from "@/lib/radioStore";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const AdminDangerZone = () => {
  const { isAdmin, hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cleaningImages, setCleaningImages] = useState(false);

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

  const handleCleanImages = async () => {
    if (!confirm("Isso removerá da galeria todas as imagens que não estão atualmente em uso. Deseja prosseguir?")) return;
    
    setCleaningImages(true);
    const result = await cleanupUnusedImages();
    if (result.error) {
      toast.error("Erro ao limpar imagens: " + result.error.message);
    } else {
      toast.success(result.count === 0 
        ? "Nenhuma imagem ociosa encontrada. A galeria já está otimizada!" 
        : `${result.count} imagens removidas com sucesso!`);
    }
    setCleaningImages(false);
  };
  if (!isAdmin && !hasPermission('danger_zone')) {
    return <div className="p-12 text-center font-black uppercase text-red-500">Acesso Restrito</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="bg-destructive text-destructive-foreground p-8 rounded-xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
        <div className="relative z-10 flex-1 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-background text-destructive rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5" /> Acesso Master
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            Zona de Perigo
          </h2>
          <p className="font-semibold text-sm opacity-90">Gerenciamento de dados críticos e ações irreversíveis do sistema.</p>
        </div>
        <AlertTriangle className="w-24 h-24 text-background/20 hidden sm:block rotate-12" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="rounded-xl border border-destructive/20 shadow-sm bg-card text-card-foreground overflow-hidden">
          <CardHeader className="p-6 border-b border-border/50 bg-destructive/5">
               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-destructive">
                       <Trash2 className="w-6 h-6" />
                       <CardTitle className="text-xl font-bold">Reset Total do Sistema</CardTitle>
                   </div>
                   <span className="text-xs font-bold text-destructive/70 uppercase tracking-widest px-2.5 py-1 bg-destructive/10 rounded-md">Ação Irreversível</span>
               </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Esta ação removerá permanentemente todos os registros de <strong className="text-foreground">Locutores</strong> e toda a <strong className="text-foreground">Grade de Programação</strong>. 
                Isso é útil para reconfigurar a rádio do zero ou limpar dados de testes iniciais.
            </p>
            
            <div className="bg-muted/50 p-5 rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                     <Zap className="w-5 h-5 text-destructive animate-pulse" />
                     <p className="text-sm font-bold text-destructive">Confirme se você realmente deseja prosseguir</p>
                </div>
                <Button 
                   onClick={handleClearAll} 
                   variant="destructive" 
                   disabled={loading}
                   className="h-11 px-6 rounded-lg font-semibold w-full sm:w-auto shadow-sm"
                >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Limpar Todo o Sistema"}
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-orange-500/20 shadow-sm bg-card text-card-foreground overflow-hidden">
           <CardHeader className="p-6 border-b border-border/50 bg-orange-500/5">
               <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3 text-orange-500">
                       <RotateCcw className="w-6 h-6" />
                       <CardTitle className="text-xl font-bold">Limpar Cache de Imagens</CardTitle>
                   </div>
                   <span className="text-xs font-bold text-orange-500/70 uppercase tracking-widest px-2.5 py-1 bg-orange-500/10 rounded-md">Otimização</span>
               </div>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
               <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                   Esta função removerá imagens não utilizadas do Storage para otimizar o espaço em disco. 
                   Esta ação analisará sua biblioteca de mídia mantendo apenas as imagens que estão vinculadas a algum conteúdo ativo.
               </p>
               
               <div className="bg-muted/50 p-5 rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <p className="text-sm font-bold text-orange-600 dark:text-orange-500">Execução segura: não afeta conteúdos visíveis</p>
                   </div>
                   <Button 
                      onClick={handleCleanImages}
                      disabled={cleaningImages}
                      className="h-11 px-6 rounded-lg font-semibold w-full sm:w-auto bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                   >
                      {cleaningImages ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Iniciar Limpeza"}
                   </Button>
               </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDangerZone;
