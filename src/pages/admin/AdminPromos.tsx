import { useState, useEffect } from "react";
import { Save, Upload, Gift, Trash2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getThemeConfig, applyTheme, type ThemeConfig, type Promo } from "@/lib/themeStore";
import { getSiteConfig, saveSiteConfig } from "@/lib/radioStore";
import { toast } from "sonner";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const AdminPromos = () => {
  const [theme, setTheme] = useState<ThemeConfig>(getThemeConfig());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      const savedTheme = await getSiteConfig("theme");
      if (savedTheme) {
        setTheme(prev => ({ ...prev, ...savedTheme }));
      }
    };
    fetchTheme();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await saveSiteConfig("theme", theme);
    if (!error) {
      applyTheme(theme);
      toast.success("Promoções atualizadas com sucesso!");
    } else {
      toast.error("Erro ao salvar promoções.");
    }
    setLoading(false);
  };

  const updatePromos = (newPromos: Promo[]) => {
    setTheme(prev => ({ ...prev, promos: newPromos }));
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Central de Promoções</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Crie e gerencie os sorteios dinâmicos exibidos no site.</p>
        </div>
        <Button onClick={handleSave} className="rounded-lg font-semibold text-sm h-11 px-8 bg-pink-500 text-white hover:bg-pink-600 transition-all shadow-sm w-full sm:w-auto" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden">
        <div className="bg-pink-500/10 p-6 border-b border-border/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-pink-500 text-white rounded-xl shadow-sm">
                <Gift className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-pink-600 dark:text-pink-500">Banners Ativos</h3>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">As promoções ativas ganham destaque na rádio.</p>
             </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {(theme.promos || []).map((p, idx) => (
              <div key={p.id || idx} className="relative group bg-card border border-border rounded-xl p-6 flex flex-col gap-6 transition-all hover:shadow-md" style={{ opacity: p.ativa ? 1 : 0.6 }}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-8">
                  <div className="sm:col-span-4 space-y-4">
                    <div className="aspect-[4/5] bg-muted rounded-xl flex items-center justify-center p-1 border border-border shadow-inner relative overflow-hidden group-hover:border-pink-300 transition-all">
                      {p.imagem ? (
                        <img src={p.imagem} alt={p.titulo} className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105 duration-500" />
                      ) : (
                        <Gift className="w-12 h-12 text-muted-foreground/30" />
                      )}
                      <label className="absolute inset-0 cursor-pointer bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg backdrop-blur-sm">
                        <Upload className="text-white w-8 h-8" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async e => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const newPromos = [...(theme.promos || [])];
                              newPromos[idx].imagem = await fileToBase64(f);
                              updatePromos(newPromos);
                            }
                          }} 
                        />
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between bg-background p-3 rounded-lg border border-border shadow-sm">
                      <div className="flex flex-col ml-1">
                        <span className="text-xs font-bold text-foreground">Status</span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">{p.ativa ? "Ativa" : "Inativa"}</span>
                      </div>
                      <Switch 
                        checked={p.ativa} 
                        onCheckedChange={v => {
                          const newPromos = [...(theme.promos || [])];
                          newPromos[idx].ativa = v;
                          updatePromos(newPromos);
                        }} 
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-8 flex flex-col justify-center space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Título Chamativo da Promoção</Label>
                      <Input 
                        value={p.titulo} 
                        onChange={e => {
                          const newPromos = [...(theme.promos || [])];
                          newPromos[idx].titulo = e.target.value;
                          updatePromos(newPromos);
                        }}
                        placeholder="Ex: Sorteio de Ingressos"
                        className="h-11 rounded-lg text-base font-semibold"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Link p/ Participar (ou WhatsApp)</Label>
                      <div className="relative">
                        <Input 
                          value={p.link || ""} 
                          onChange={e => {
                            const newPromos = [...(theme.promos || [])];
                            newPromos[idx].link = e.target.value;
                            updatePromos(newPromos);
                          }}
                          placeholder="https://..."
                          className="h-11 rounded-lg pr-10"
                        />
                        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        variant="ghost" 
                        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive h-11 rounded-lg font-semibold"
                        onClick={() => {
                          if (confirm("Deseja realmente excluir esta promoção?")) {
                            const newPromos = (theme.promos || []).filter((_, i) => i !== idx);
                            updatePromos(newPromos);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover Promoção
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={() => {
                const newPromos = [...(theme.promos || []), { id: crypto.randomUUID(), titulo: "Nova Promoção", imagem: "", link: "", ativa: true }];
                updatePromos(newPromos);
              }}
              className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-12 gap-4 hover:border-pink-300 hover:bg-pink-500/5 transition-all text-muted-foreground hover:text-pink-500 group min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-center">
                <span className="text-base font-bold block">Adicionar Promoção</span>
                <span className="text-xs font-medium opacity-70 mt-1 block">Fazer upload de novo banner de sorteio</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPromos;
