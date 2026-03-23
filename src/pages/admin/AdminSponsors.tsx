import { useState, useEffect } from "react";
import { Save, Upload, ImageIcon, Trash2, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getThemeConfig, applyTheme, type ThemeConfig, type Sponsor } from "@/lib/themeStore";
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

const AdminSponsors = () => {
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
      toast.success("Patrocinadores atualizados com sucesso!");
    } else {
      toast.error("Erro ao salvar patrocinadores.");
    }
    setLoading(false);
  };

  const updateSponsors = (newSponsors: Sponsor[]) => {
    setTheme(prev => ({ ...prev, sponsors: newSponsors }));
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Nossos <span className="text-secondary italic">Patrocinadores</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Gerencie os parceiros e logotipos exibidos no site</p>
        </div>
        <Button onClick={handleSave} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-primary text-white hover:bg-primary/90 transition-all shadow-lg" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <Card className="rounded-[3rem] border-none shadow-xl bg-white text-slate-900 overflow-hidden">
        <div className="bg-orange-500 p-10 text-white">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Heart className="w-8 h-8 fill-white" />
             </div>
             <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Grade de Parceiros</h3>
                <p className="text-white/60 text-xs font-medium">Estes logotipos aparecem no carrossel de patrocinadores.</p>
             </div>
          </div>
        </div>
        <CardContent className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(theme.sponsors || []).map((s, idx) => (
              <div key={s.id || idx} className="relative group bg-gray-50 rounded-[2rem] p-8 border border-gray-100 flex flex-col items-center gap-6 transition-all hover:shadow-xl hover:bg-white">
                <div className="w-full aspect-square bg-white rounded-3xl flex items-center justify-center p-6 border border-gray-50 shadow-sm relative overflow-hidden group-hover:border-orange-200 transition-all">
                  {s.logo ? (
                    <img src={s.logo} alt={s.nome} className="max-h-full object-contain transition-transform group-hover:scale-110 duration-500" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-100" />
                  )}
                  <label className="absolute inset-0 cursor-pointer bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="text-white w-8 h-8" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async e => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const newSponsors = [...(theme.sponsors || [])];
                          newSponsors[idx].logo = await fileToBase64(f);
                          updateSponsors(newSponsors);
                        }
                      }} 
                    />
                  </label>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-2">Nome do Parceiro</Label>
                    <Input 
                      value={s.nome} 
                      onChange={e => {
                        const newSponsors = [...(theme.sponsors || [])];
                        newSponsors[idx].nome = e.target.value;
                        updateSponsors(newSponsors);
                      }}
                      placeholder="Ex: Supermercado"
                      className="h-10 rounded-xl bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-2">Link do Site (Opcional)</Label>
                    <Input 
                      value={s.url || ""} 
                      onChange={e => {
                        const newSponsors = [...(theme.sponsors || [])];
                        newSponsors[idx].url = e.target.value;
                        updateSponsors(newSponsors);
                      }}
                      placeholder="https://..."
                      className="h-10 rounded-xl bg-white text-xs"
                    />
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -top-3 -right-3 h-10 w-10 bg-white shadow-xl text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                  onClick={() => {
                    const newSponsors = (theme.sponsors || []).filter((_, i) => i !== idx);
                    updateSponsors(newSponsors);
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}

            <button 
              onClick={() => {
                const newSponsors = [...(theme.sponsors || []), { id: crypto.randomUUID(), nome: "Novo Parceiro", logo: "", url: "" }];
                updateSponsors(newSponsors);
              }}
              className="border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center p-12 gap-4 hover:border-orange-200 hover:bg-orange-50/50 transition-all text-gray-300 hover:text-orange-400 group min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-full border-4 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Adicionar Novo Parceiro</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSponsors;
