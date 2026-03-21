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
import { getThemeConfig, saveThemeConfig, DEFAULT_THEME, type ThemeConfig } from "@/lib/themeStore";
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
        setTheme(prev => ({ ...prev, ...savedTheme }));
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

  const handleSave = async () => {
    setLoading(true);
    
    // Use a temporary object instead of just passing `theme` as it may have different structure now
    const themeToSave = { ...theme };
    
    const [themeRes, streamingRes] = await Promise.all([
      saveSiteConfig("theme", themeToSave),
      getSiteConfig("streaming").then(config => 
        saveSiteConfig("streaming", { ...(config || {}), logo, favicon })
      )
    ]);
    
    if (!themeRes.error) {
      saveThemeConfig(themeToSave);
      toast.success("Configurações salvas com sucesso!");
    } else {
      toast.error("Erro ao salvar configurações.");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setTheme({ ...DEFAULT_THEME });
    saveThemeConfig({ ...DEFAULT_THEME });
    toast.info("Cores restauradas para o padrão.");
  };

  const applyPreset = (preset: Partial<ThemeConfig>) => {
    const updated = { ...DEFAULT_THEME, ...preset } as ThemeConfig;
    setTheme(updated);
    saveThemeConfig(updated);
    toast.success("Tema aplicado!");
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Personalização Visual</h2>
          <p className="text-sm text-muted-foreground">Ajuste as cores, degradês e identidade da sua rádio</p>
        </div>
        <Button onClick={handleSave} className="gap-2 px-6 h-12 rounded-xl font-bold font-display" disabled={loading}>
          <Save className="w-5 h-5" /> {loading ? "Salvando..." : "Aplicar Mudanças"}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-6">
          <Card className="rounded-2xl overflow-hidden border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/50"><CardTitle className="text-lg flex items-center gap-2 font-black"><ImageIcon className="w-5 h-5 text-primary" /> Logotipos</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-70">Logo Principal</Label>
                <div className="flex flex-col gap-4">
                  {logo && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-slate-100 p-4">
                      <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl cursor-pointer hover:opacity-90 transition-all font-bold text-sm">
                      <Upload className="w-4 h-4" /> {logo ? "Trocar" : "Enviar Logo"}
                      <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setLogo(await fileToBase64(f)); }} />
                    </label>
                    {logo && (
                      <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl text-destructive hover:bg-destructive/10" onClick={() => setLogo("")}>Remover</Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border/50">
                <Label className="text-xs font-bold uppercase tracking-widest opacity-70">Favicon (Ícone)</Label>
                <div className="flex items-center gap-4">
                  {favicon && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-border bg-slate-100 p-2">
                      <img src={favicon} alt="Favicon" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 transition-all font-bold text-sm h-12">
                    <Upload className="w-4 h-4" /> Enviar Ícone
                    <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setFavicon(await fileToBase64(f)); }} />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl overflow-hidden border-border/50">
            <CardHeader className="bg-muted/50"><CardTitle className="text-lg flex items-center gap-2 font-black"><Palette className="w-5 h-5 text-primary" /> Temas Prontos</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.theme)}
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all text-left flex items-center justify-between group"
                  >
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{preset.name}</span>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full border-2 border-background" style={{ background: `hsl(${preset.theme.primary})` }} />
                      <div className="w-6 h-6 rounded-full border-2 border-background" style={{ background: `hsl(${preset.theme.secondary})` }} />
                      <div className="w-6 h-6 rounded-full border-2 border-background" style={{ background: `hsl(${preset.theme.background})` }} />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-8 space-y-6">
          <Card className="rounded-2xl overflow-hidden border-border/50">
            <CardHeader className="bg-muted/50"><CardTitle className="text-lg font-black">Cores e Degradês Customizados</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorField 
                  label="Cor de Destaque (Principal)" 
                  description="Usada no player, botões de ação e elementos principais de interatividade."
                  value={theme.primary} 
                  onChange={v => updateField("primary", v)}
                  gradientValue={theme.primaryGradient}
                  onGradientChange={v => updateField("primaryGradient", v)}
                />
                <ColorField 
                  label="Cor Secundária" 
                  description="Usada para detalhes, etiquetas (tags) e elementos de apoio visual."
                  value={theme.secondary} 
                  onChange={v => updateField("secondary", v)}
                  gradientValue={theme.secondaryGradient}
                  onGradientChange={v => updateField("secondaryGradient", v)}
                />
                <ColorField 
                  label="Fundo do Player (Header)" 
                  description="Define a cor da barra fixa do player no topo do site."
                  value={theme.headerBg} 
                  onChange={v => updateField("headerBg", v)}
                  gradientValue={theme.headerGradient}
                  onGradientChange={v => updateField("headerGradient", v)}
                />
                <ColorField 
                  label="Fundo Geral (Background)" 
                  description="Cor de fundo de toda a página. Recomendado cores escuras para o estilo moderno."
                  value={theme.background} 
                  onChange={v => updateField("background", v)}
                  gradientValue={theme.backgroundGradient}
                  onGradientChange={v => updateField("backgroundGradient", v)}
                />
                <ColorField 
                  label="Fundo dos Cards" 
                  description="Cor interna dos cartões de notícias e seções do site."
                  value={theme.card} 
                  onChange={v => updateField("card", v)} 
                />
                <ColorField 
                  label="Fundo da Navegação" 
                  description="Cor de fundo do menu lateral ou barras de navegação."
                  value={theme.navBg} 
                  onChange={v => updateField("navBg", v)} 
                />
                <ColorField 
                  label="Texto Principal" 
                  description="A cor que será usada na maioria das fontes do site."
                  value={theme.foreground} 
                  onChange={v => updateField("foreground", v)} 
                />
                <ColorField 
                  label="Cor das Bordas" 
                  description="Linhas divisórias e contornos de campos e cards."
                  value={theme.border} 
                  onChange={v => updateField("border", v)} 
                />
              </div>

              <div className="flex gap-4 pt-8 mt-8 border-t border-border/50">
                <Button variant="outline" onClick={handleReset} className="gap-2 rounded-xl text-xs font-bold">
                  <RotateCcw className="w-4 h-4" /> Restaurar Padrão de Fábrica
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Distribuição do Layout</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Posição do Top 3 Músicas (Vertical)</Label>
            <select
              value={theme.topSongsPosition}
              onChange={e => updateField("topSongsPosition", e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="hero">Abaixo do Banner (Hero)</option>
              <option value="gallery">Abaixo da Galeria</option>
              <option value="news">Abaixo das Notícias</option>
              <option value="contact">Abaixo do Contato</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Alinhamento do Top 3 Músicas (Horizontal)</Label>
            <select
              value={theme.topSongsAlignment || 'center'}
              onChange={e => updateField("topSongsAlignment", e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Posição do Pedido Musical</Label>
            <select
              value={theme.pedidoPosition}
              onChange={e => updateField("pedidoPosition", e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Posição do Player</Label>
            <select
              value={theme.playerPosition}
              onChange={e => updateField("playerPosition", e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Posição dos Patrocinadores</Label>
            <select
              value={theme.sponsorsPosition}
              onChange={e => updateField("sponsorsPosition", e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Posição da Previsão do Tempo</Label>
            <select
              value={theme.weatherPosition || 'left'}
              onChange={e => updateField("weatherPosition", e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Visibilidade das Seções</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showTopSongs">Top 3 Músicas</Label>
            <Switch
              id="showTopSongs"
              checked={theme.showTopSongs}
              onCheckedChange={v => updateField("showTopSongs", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showGallery">Galeria de Fotos</Label>
            <Switch
              id="showGallery"
              checked={theme.showGallery}
              onCheckedChange={v => updateField("showGallery", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showNews">Notícias</Label>
            <Switch
              id="showNews"
              checked={theme.showNews}
              onCheckedChange={v => updateField("showNews", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showAbout">Sobre Nós</Label>
            <Switch
              id="showAbout"
              checked={theme.showAbout}
              onCheckedChange={v => updateField("showAbout", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showWeather">Previsão do Tempo</Label>
            <Switch
              id="showWeather"
              checked={theme.showWeather}
              onCheckedChange={v => updateField("showWeather", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showSponsors">Patrocinadores</Label>
            <Switch
              id="showSponsors"
              checked={theme.showSponsors}
              onCheckedChange={v => updateField("showSponsors", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showBackToTop">Voltar ao Topo</Label>
            <Switch
              id="showBackToTop"
              checked={theme.showBackToTop}
              onCheckedChange={v => updateField("showBackToTop", v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Configurações Adicionais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cidades Sugeridas</Label>
              <div className="flex flex-wrap gap-2">
                {["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Fortaleza", "Salvador", "Brasília", "Porto Alegre"].map(city => (
                  <Button
                    key={city}
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7"
                    onClick={() => updateField("weatherCity", city)}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weatherCity">Cidade Personalizada</Label>
              <Input
                id="weatherCity"
                value={theme.weatherCity}
                onChange={e => updateField("weatherCity", e.target.value)}
                placeholder="Digite o nome da cidade"
              />
              <p className="text-[10px] text-muted-foreground italic">Dica: Digite o nome da cidade corretamente para evitar erros na previsão.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAparencia;
