import { useState, useEffect } from "react";
import { Save, RotateCcw, Palette, Upload, Image as ImageIcon } from "lucide-react";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getThemeConfig, applyTheme, DEFAULT_THEME, type ThemeConfig } from "@/lib/themeStore";
import { getSiteConfig, saveSiteConfig } from "@/lib/radioStore";
import { toast } from "sonner";

function hslToHex(hsl: string): string {
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return "#3b82f6";
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface ColorFieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (val: string) => void;
  gradientValue?: string;
  onGradientChange?: (val: string) => void;
}

const ColorField = ({ label, description, value, onChange, gradientValue, onGradientChange }: ColorFieldProps) => (
  <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
    <div className="flex items-center justify-between">
      <Label className="text-sm font-bold">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hslToHex(value)}
          onChange={e => onChange(hexToHsl(e.target.value))}
          className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent overflow-hidden"
        />
      </div>
    </div>
    <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
    
    {onGradientChange && (
      <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
        <Label className="text-[10px] uppercase tracking-wider font-bold opacity-70">Efeito Degradê (Opcional)</Label>
        <Input 
          placeholder="Ex: linear-gradient(135deg, #000 0%, #fff 100%)"
          value={gradientValue || ""}
          onChange={e => onGradientChange(e.target.value)}
          className="text-[10px] h-8 font-mono bg-background"
        />
      </div>
    )}
  </div>
);

const PRESETS: { name: string; theme: Partial<ThemeConfig> }[] = [
  { name: "Azul Impacto", theme: { ...DEFAULT_THEME } },
  {
    name: "Clube FM Style",
    theme: {
      background: "220 20% 10%", foreground: "0 0% 100%", card: "220 20% 15%",
      primary: "217 91% 60%", primaryForeground: "0 0% 100%",
      secondary: "45 93% 58%", secondaryForeground: "220 20% 10%",
      muted: "220 15% 20%", mutedForeground: "220 10% 60%",
      border: "220 15% 20%", headerBg: "220 20% 8%", navBg: "220 15% 15%",
      headerGradient: "linear-gradient(180deg, #1a1f2c 0%, #0d0f14 100%)",
      primaryGradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      secondaryGradient: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
    },
  },
  {
    name: "Vermelho Energia",
    theme: {
      background: "0 10% 12%", foreground: "0 0% 98%", card: "0 10% 16%",
      primary: "0 80% 55%", primaryForeground: "0 0% 100%",
      secondary: "35 90% 55%", secondaryForeground: "0 10% 10%",
      muted: "0 8% 22%", mutedForeground: "0 5% 55%",
      border: "0 8% 22%", headerBg: "0 10% 8%", navBg: "0 8% 18%",
      primaryGradient: "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)",
    },
  },
];

const AdminAparencia = () => {
  const [theme, setTheme] = useState<ThemeConfig>(getThemeConfig());
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const savedTheme = await getSiteConfig("theme");
      const radioConfig = await getSiteConfig("streaming");

      if (savedTheme) {
        setTheme(prev => ({ 
          ...prev, 
          ...savedTheme,
          labels: { ...prev.labels, ...(savedTheme.labels || {}) }
        }));
      }

      if (radioConfig) {
        setLogo(radioConfig.logo || "");
        setFavicon(radioConfig.favicon || "");
      }
    };
    fetchData();
  }, []);

  const updateField = (field: keyof ThemeConfig, value: any) => {
    setTheme(prev => ({ ...prev, [field]: value }));
  };

  const updateLabel = (key: keyof ThemeConfig['labels'], value: string) => {
    setTheme(prev => ({
      ...prev,
      labels: { ...prev.labels, [key]: value }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const themeToSave = { ...theme };
    
    // Convert current primary/secondary (HSL) to also match hex if they were changed via hex picker
    // But for now let's just save the theme as is
    
    const [themeRes] = await Promise.all([
      saveSiteConfig("theme", themeToSave),
      getSiteConfig("streaming").then(config => 
        saveSiteConfig("streaming", { ...(config || {}), logo, favicon })
      )
    ]);
    
    if (!themeRes.error) {
      applyTheme(themeToSave);
      toast.success("Configurações salvas com sucesso!");
    } else {
      toast.error("Erro ao salvar configurações.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 pb-40">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border bg-white shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tight uppercase italic">Gestão Total Front-End</h2>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Configure cores, textos e a identidade visual completa</p>
        </div>
        <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-white gap-2 px-8 h-12 rounded-xl font-black uppercase tracking-widest text-xs" disabled={loading}>
          <Save className="w-5 h-5" /> {loading ? "Salvando..." : "Publicar no Site"}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Sidebar: Logos and Presets */}
        <div className="xl:col-span-4 space-y-8">
          <Card className="rounded-[2rem] overflow-hidden border-none shadow-xl bg-white">
            <CardHeader className="bg-primary p-8">
              <CardTitle className="text-white flex items-center gap-3 font-black uppercase tracking-tighter italic">
                <ImageIcon className="w-6 h-6 text-yellow-400" /> Identidade
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Logo da Rádio</Label>
                <div className="flex flex-col gap-4">
                  {logo && (
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-gray-50 bg-gray-50 p-6 flex items-center justify-center">
                      <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <label className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-primary rounded-2xl cursor-pointer hover:bg-gray-200 transition-all font-black text-[10px] uppercase tracking-widest">
                    <Upload className="w-4 h-4" /> {logo ? "Alterar Logotipo" : "Enviar Logotipo"}
                    <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setLogo(await fileToBase64(f)); }} />
                  </label>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-gray-100">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Favicon (Tab do Navegador)</Label>
                <div className="flex items-center gap-4">
                  {favicon && (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-gray-50 bg-gray-50 p-3 flex items-center justify-center shrink-0">
                      <img src={favicon} alt="Favicon" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-primary rounded-2xl cursor-pointer hover:bg-gray-200 transition-all font-black text-[10px] uppercase tracking-widest h-20 text-center">
                    <Upload className="w-4 h-4" /> Enviar
                    <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setFavicon(await fileToBase64(f)); }} />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] overflow-hidden border-none shadow-xl bg-white">
            <CardHeader className="bg-gray-100 p-8"><CardTitle className="text-primary flex items-center gap-3 font-black uppercase tracking-tighter italic"><Palette className="w-6 h-6 text-accent" /> Estilo das Seções</CardTitle></CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-50">Cidade do Clima</Label>
                  <Input value={theme.weatherCity} onChange={e => updateField("weatherCity", e.target.value)} className="rounded-xl border-gray-100 bg-gray-50 font-bold" />
               </div>
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                 <Label className="text-[11px] font-black uppercase">Exibir Notícias</Label>
                 <Switch checked={theme.showNews} onCheckedChange={v => updateField("showNews", v)} />
               </div>
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                 <Label className="text-[11px] font-black uppercase">Exibir Galeria</Label>
                 <Switch checked={theme.showGallery} onCheckedChange={v => updateField("showGallery", v)} />
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Colors and Texts */}
        <div className="xl:col-span-8 space-y-8">
          <Card className="rounded-[2rem] overflow-hidden border-none shadow-xl bg-white">
            <CardHeader className="bg-primary p-8">
              <CardTitle className="text-white font-black uppercase tracking-tighter italic">Cores do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Cor Principal (Azul)</Label>
                   <input type="color" value={theme.clubeBlue} onChange={e => updateField("clubeBlue", e.target.value)} className="w-20 h-20 rounded-full cursor-pointer border-8 border-white shadow-xl" />
                   <div className="text-[10px] font-mono text-gray-400 mt-2">{theme.clubeBlue}</div>
                </div>
                <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Cor Alerta (Vermelho)</Label>
                   <input type="color" value={theme.clubeRed} onChange={e => updateField("clubeRed", e.target.value)} className="w-20 h-20 rounded-full cursor-pointer border-8 border-white shadow-xl" />
                   <div className="text-[10px] font-mono text-gray-400 mt-2">{theme.clubeRed}</div>
                </div>
                <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Cor Detalhe (Amarelo)</Label>
                   <input type="color" value={theme.clubeYellow} onChange={e => updateField("clubeYellow", e.target.value)} className="w-20 h-20 rounded-full cursor-pointer border-8 border-white shadow-xl" />
                   <div className="text-[10px] font-mono text-gray-400 mt-2">{theme.clubeYellow}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] overflow-hidden border-none shadow-xl bg-white">
            <CardHeader className="bg-accent p-8">
              <CardTitle className="text-white font-black uppercase tracking-tighter italic">Textos e Rótulos do Site</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hero Labels */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-primary uppercase border-b-2 border-accent w-fit pb-1">Banner Principal</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Botão "Ler Notícia"</Label>
                       <Input value={theme.labels.heroReadMore} onChange={e => updateLabel("heroReadMore", e.target.value)} className="rounded-xl border-gray-100" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Botão "Mais Notícias"</Label>
                       <Input value={theme.labels.heroMoreNews} onChange={e => updateLabel("heroMoreNews", e.target.value)} className="rounded-xl border-gray-100" />
                    </div>
                  </div>
                </div>

                {/* Player Labels */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-primary uppercase border-b-2 border-accent w-fit pb-1">Player de Rádio</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Rótulo Localização</Label>
                       <Input value={theme.labels.playerLocation} onChange={e => updateLabel("playerLocation", e.target.value)} className="rounded-xl border-gray-100" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Etiqueta Ao Vivo</Label>
                       <Input value={theme.labels.playerLive} onChange={e => updateLabel("playerLive", e.target.value)} className="rounded-xl border-gray-100" />
                    </div>
                  </div>
                </div>

                {/* Section Titles */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-primary uppercase border-b-2 border-accent w-fit pb-1">Títulos de Notícias</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Principal</Label>
                       <Input value={theme.labels.newsTitle} onChange={e => updateLabel("newsTitle", e.target.value)} className="rounded-xl border-gray-100" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Complemento</Label>
                       <Input value={theme.labels.newsSubtitle} onChange={e => updateLabel("newsSubtitle", e.target.value)} className="rounded-xl border-gray-100" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black text-primary uppercase border-b-2 border-accent w-fit pb-1">Títulos de Sucessos</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Principal</Label>
                       <Input value={theme.labels.topSongsTitle} onChange={e => updateLabel("topSongsTitle", e.target.value)} className="rounded-xl border-gray-100" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Complemento</Label>
                       <Input value={theme.labels.topSongsSubtitle} onChange={e => updateLabel("topSongsSubtitle", e.target.value)} className="rounded-xl border-gray-100" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAparencia;
