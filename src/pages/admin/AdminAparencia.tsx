import { useState, useEffect } from "react";
import { Save, RotateCcw, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  value: string;
  onChange: (val: string) => void;
}

const ColorField = ({ label, value, onChange }: ColorFieldProps) => (
  <div className="flex items-center gap-3">
    <input
      type="color"
      value={hslToHex(value)}
      onChange={e => onChange(hexToHsl(e.target.value))}
      className="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent"
    />
    <div className="flex-1">
      <Label className="text-xs">{label}</Label>
      <p className="text-[10px] text-muted-foreground font-mono">{value}</p>
    </div>
  </div>
);

const PRESETS: { name: string; theme: Partial<ThemeConfig> }[] = [
  { name: "Azul Padrão", theme: { ...DEFAULT_THEME } },
  {
    name: "Vermelho Energia",
    theme: {
      background: "0 10% 12%", foreground: "0 0% 98%", card: "0 10% 16%",
      primary: "0 80% 55%", primaryForeground: "0 0% 100%",
      secondary: "35 90% 55%", secondaryForeground: "0 10% 10%",
      muted: "0 8% 22%", mutedForeground: "0 5% 55%",
      border: "0 8% 22%", headerBg: "0 10% 8%", navBg: "0 8% 18%",
    },
  },
  {
    name: "Verde Natural",
    theme: {
      background: "150 15% 12%", foreground: "0 0% 98%", card: "150 15% 16%",
      primary: "142 70% 45%", primaryForeground: "0 0% 100%",
      secondary: "45 90% 55%", secondaryForeground: "150 15% 10%",
      muted: "150 10% 22%", mutedForeground: "150 5% 55%",
      border: "150 10% 22%", headerBg: "150 15% 8%", navBg: "150 10% 18%",
    },
  },
  {
    name: "Roxo Moderno",
    theme: {
      background: "270 15% 12%", foreground: "0 0% 98%", card: "270 15% 16%",
      primary: "265 85% 60%", primaryForeground: "0 0% 100%",
      secondary: "45 90% 60%", secondaryForeground: "270 15% 10%",
      muted: "270 10% 22%", mutedForeground: "270 5% 55%",
      border: "270 10% 22%", headerBg: "270 15% 8%", navBg: "270 10% 18%",
    },
  },
  {
    name: "Laranja Quente",
    theme: {
      background: "25 15% 12%", foreground: "0 0% 98%", card: "25 15% 16%",
      primary: "25 95% 55%", primaryForeground: "0 0% 100%",
      secondary: "45 90% 55%", secondaryForeground: "25 15% 10%",
      muted: "25 10% 22%", mutedForeground: "25 5% 55%",
      border: "25 10% 22%", headerBg: "25 15% 8%", navBg: "25 10% 18%",
    },
  },
];

const AdminAparencia = () => {
  const [theme, setTheme] = useState<ThemeConfig>(getThemeConfig());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      const saved = await getSiteConfig("theme");
      if (saved) {
        setTheme(saved);
        saveThemeConfig(saved);
      }
    };
    fetchTheme();
  }, []);

  const updateField = (field: keyof ThemeConfig, value: string | boolean) => {
    const updated = { ...theme, [field]: value };
    setTheme(updated);
    saveThemeConfig(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await saveSiteConfig("theme", theme);
    if (error) {
      toast.error("Erro ao salvar tema no servidor.");
    } else {
      toast.success("Tema salvo com sucesso!");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setTheme({ ...DEFAULT_THEME });
    saveThemeConfig({ ...DEFAULT_THEME });
  };

  const applyPreset = (preset: Partial<ThemeConfig>) => {
    const updated = { ...DEFAULT_THEME, ...preset } as ThemeConfig;
    setTheme(updated);
    saveThemeConfig(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Aparência / Cores</h2>
        <Button onClick={handleSave} className="gap-2" disabled={loading}>
          <Save className="w-4 h-4" /> {loading ? "Salvando..." : "Salvar Tema"}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Temas Prontos</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.theme)}
                className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all text-left group"
              >
                <div className="flex gap-1 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${preset.theme.primary})` }} />
                  <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${preset.theme.secondary})` }} />
                  <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${preset.theme.background})` }} />
                </div>
                <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{preset.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cores Personalizadas</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ColorField label="Cor Principal (Primary)" value={theme.primary} onChange={v => updateField("primary", v)} />
            <ColorField label="Cor Secundária" value={theme.secondary} onChange={v => updateField("secondary", v)} />
            <ColorField label="Fundo da Página" value={theme.background} onChange={v => updateField("background", v)} />
            <ColorField label="Texto Principal" value={theme.foreground} onChange={v => updateField("foreground", v)} />
            <ColorField label="Fundo dos Cards" value={theme.card} onChange={v => updateField("card", v)} />
            <ColorField label="Texto Primário" value={theme.primaryForeground} onChange={v => updateField("primaryForeground", v)} />
            <ColorField label="Texto Secundário" value={theme.secondaryForeground} onChange={v => updateField("secondaryForeground", v)} />
            <ColorField label="Fundo Muted" value={theme.muted} onChange={v => updateField("muted", v)} />
            <ColorField label="Bordas" value={theme.border} onChange={v => updateField("border", v)} />
            <ColorField label="Fundo do Header" value={theme.headerBg} onChange={v => updateField("headerBg", v)} />
            <ColorField label="Fundo da Navegação" value={theme.navBg} onChange={v => updateField("navBg", v)} />
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Restaurar Padrão
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Distribuição do Layout</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Posição do Top 3 Músicas</Label>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Visibilidade das Seções</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Top 3 Músicas</Label>
            <input
              type="checkbox"
              checked={theme.showTopSongs}
              onChange={e => updateField("showTopSongs", e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Galeria de Fotos</Label>
            <input
              type="checkbox"
              checked={theme.showGallery}
              onChange={e => updateField("showGallery", e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Notícias</Label>
            <input
              type="checkbox"
              checked={theme.showNews}
              onChange={e => updateField("showNews", e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Sobre Nós</Label>
            <input
              type="checkbox"
              checked={theme.showAbout}
              onChange={e => updateField("showAbout", e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Previsão do Tempo</Label>
            <input
              type="checkbox"
              checked={theme.showWeather}
              onChange={e => updateField("showWeather", e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Patrocinadores</Label>
            <input
              type="checkbox"
              checked={theme.showSponsors}
              onChange={e => updateField("showSponsors", e.target.checked)}
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Voltar ao Topo</Label>
            <input
              type="checkbox"
              checked={theme.showBackToTop}
              onChange={e => updateField("showBackToTop", e.target.checked)}
              className="w-4 h-4"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Configurações Adicionais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cidade para Previsão do Tempo</Label>
            <Input
              value={theme.weatherCity}
              onChange={e => updateField("weatherCity", e.target.value)}
              placeholder="Nome da cidade"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAparencia;
