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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nossos Patrocinadores</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Gerencie os logotipos dos parceiros exibidos no site.</p>
        </div>
        <Button onClick={handleSave} className="rounded-lg font-semibold text-sm h-11 px-8 bg-primary text-primary-foreground shadow-sm w-full sm:w-auto" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <Card className="rounded-xl border border-border shadow-sm bg-card overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white flex flex-col sm:flex-row items-center sm:justify-start gap-4">
           <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
              <Heart className="w-8 h-8 fill-white" />
           </div>
           <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold">Grade de Parceiros</h3>
              <p className="text-white/80 text-sm font-medium mt-1">Estes logotipos aparecerão no carrossel de patrocinadores do site.</p>
           </div>
        </div>
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(theme.sponsors || []).map((s, idx) => (
              <div key={s.id || idx} className="relative group bg-muted/40 rounded-xl p-5 border border-border flex flex-col gap-5 transition-shadow hover:shadow-md hover:bg-muted/60">
                <div className="w-full aspect-square bg-background rounded-lg flex items-center justify-center p-4 border border-border shadow-sm relative overflow-hidden group-hover:border-primary/40 transition-colors">
                  {s.logo ? (
                    <img src={s.logo} alt={s.nome} className="max-h-full object-contain transition-transform group-hover:scale-105 duration-500" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                  )}
                  <label className="absolute inset-0 cursor-pointer bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Upload className="text-foreground w-6 h-6" />
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
                
                <div className="w-full space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground ml-1">Nome do Parceiro</Label>
                    <Input 
                      value={s.nome} 
                      onChange={e => {
                        const newSponsors = [...(theme.sponsors || [])];
                        newSponsors[idx].nome = e.target.value;
                        updateSponsors(newSponsors);
                      }}
                      placeholder="Ex: Supermercado"
                      className="h-10 rounded-lg text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground ml-1">Link do Site (Opcional)</Label>
                    <Input 
                      value={s.url || ""} 
                      onChange={e => {
                        const newSponsors = [...(theme.sponsors || [])];
                        newSponsors[idx].url = e.target.value;
                        updateSponsors(newSponsors);
                      }}
                      placeholder="https://..."
                      className="h-10 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                  onClick={() => {
                    const newSponsors = (theme.sponsors || []).filter((_, i) => i !== idx);
                    updateSponsors(newSponsors);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <button 
              onClick={() => {
                const newSponsors = [...(theme.sponsors || []), { id: crypto.randomUUID(), nome: "Novo Parceiro", logo: "", url: "" }];
                updateSponsors(newSponsors);
              }}
              className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary min-h-[250px] group"
            >
              <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold">Adicionar Parceiro</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSponsors;
