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
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Central de <span className="text-pink-500 italic">Promoções</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Crie e gerencie os sorteios dinâmicos da rádio</p>
        </div>
        <Button onClick={handleSave} className="rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-pink-500 text-white hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/10" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
        <div className="bg-pink-500 p-10 text-white">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/20 rounded-none backdrop-blur-md">
                <Gift className="w-8 h-8 fill-white" />
             </div>
             <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Banners Ativos</h3>
                <p className="text-white/60 text-xs font-medium">As promoções ativas aparecem na seção central da página inicial.</p>
             </div>
          </div>
        </div>
        <CardContent className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {(theme.promos || []).map((p, idx) => (
              <div key={p.id || idx} className="relative group bg-gray-50 rounded-none p-10 border border-gray-100 flex flex-col gap-8 transition-all hover:shadow-xl hover:bg-white" style={{ opacity: p.ativa ? 1 : 0.6 }}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-5 space-y-6">
                    <div className="aspect-[4/5] bg-white rounded-none flex items-center justify-center p-2 border border-gray-50 shadow-sm relative overflow-hidden group-hover:border-pink-200 transition-all">
                      {p.imagem ? (
                        <img src={p.imagem} alt={p.titulo} className="w-full h-full object-cover rounded-none transition-transform group-hover:scale-110 duration-1000" />
                      ) : (
                        <Gift className="w-16 h-16 text-gray-100" />
                      )}
                      <label className="absolute inset-0 cursor-pointer bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-none">
                        <Upload className="text-white w-10 h-10" />
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
                    
                    <div className="flex items-center justify-between bg-white p-4 rounded-none border border-pink-50 shadow-sm">
                      <div className="flex flex-col ml-2">
                        <span className="text-[10px] font-black uppercase text-pink-500">Status</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.ativa ? "Ativa no Site" : "Inativa"}</span>
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

                  <div className="lg:col-span-7 space-y-8 flex flex-col justify-center">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Título Chamativo da Promoção</Label>
                      <Input 
                        value={p.titulo} 
                        onChange={e => {
                          const newPromos = [...(theme.promos || [])];
                          newPromos[idx].titulo = e.target.value;
                          updatePromos(newPromos);
                        }}
                        placeholder="Ex: Iphone 15 Pro Max"
                        className="h-14 rounded-none bg-white font-black text-lg text-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Link p/ Participar (ou WhatsApp)</Label>
                      <div className="relative">
                        <Input 
                          value={p.link || ""} 
                          onChange={e => {
                            const newPromos = [...(theme.promos || [])];
                            newPromos[idx].link = e.target.value;
                            updatePromos(newPromos);
                          }}
                          placeholder="https://wa.me/..."
                          className="h-14 rounded-none bg-white text-sm"
                        />
                        <ExternalLink className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      </div>
                    </div>

                    <Button 
                      variant="destructive" 
                      className="w-full h-14 rounded-none font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-500/10 transition-all hover:scale-105 active:scale-95"
                      onClick={() => {
                        if (confirm("Deseja realmente excluir esta promoção?")) {
                          const newPromos = (theme.promos || []).filter((_, i) => i !== idx);
                          updatePromos(newPromos);
                        }
                      }}
                    >
                      Remover Promoção
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={() => {
                const newPromos = [...(theme.promos || []), { id: crypto.randomUUID(), titulo: "Nova Promoção", imagem: "", link: "", ativa: true }];
                updatePromos(newPromos);
              }}
              className="border-4 border-dashed border-gray-100 rounded-none flex flex-col items-center justify-center p-12 gap-6 hover:border-pink-200 hover:bg-pink-50/50 transition-all text-gray-300 hover:text-pink-400 group min-h-[400px]"
            >
              <div className="w-24 h-24 rounded-none border-4 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-12 h-12" />
              </div>
              <div className="text-center">
                <span className="text-lg font-black uppercase tracking-widest block">Lançar Nova Promo</span>
                <span className="text-[10px] font-bold opacity-50 mt-2 block">Upload de Banner e Link de Ação</span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPromos;
