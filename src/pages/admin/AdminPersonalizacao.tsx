import { useState, useEffect } from "react";
import { Save, Palette, Type, Globe, Share2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSiteConfig, saveSiteConfig, type SiteConfig } from "@/lib/siteConfig";
import { toast } from "@/hooks/use-toast";

const FONT_OPTIONS = [
  "Inter", "Poppins", "Roboto", "Open Sans", "Montserrat", "Lato", "Oswald",
  "Raleway", "Nunito", "Ubuntu", "Playfair Display", "Bebas Neue", "Righteous",
];

const AdminPersonalizacao = () => {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());

  const update = (key: keyof SiteConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveSiteConfig(config);
    toast({ title: "Salvo!", description: "As personalizações foram aplicadas ao site." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Personalização do Site</h2>
          <p className="text-sm text-muted-foreground">Altere cores, textos, fontes e tudo do seu site</p>
        </div>
        <Button onClick={handleSave} className="gap-2" size="lg">
          <Save className="w-4 h-4" /> Salvar Tudo
        </Button>
      </div>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="bg-muted flex-wrap h-auto p-1">
          <TabsTrigger value="identity" className="gap-2"><Globe className="w-4 h-4" /> Identidade</TabsTrigger>
          <TabsTrigger value="colors" className="gap-2"><Palette className="w-4 h-4" /> Cores</TabsTrigger>
          <TabsTrigger value="fonts" className="gap-2"><Type className="w-4 h-4" /> Fontes</TabsTrigger>
          <TabsTrigger value="social" className="gap-2"><Share2 className="w-4 h-4" /> Redes Sociais</TabsTrigger>
          <TabsTrigger value="about" className="gap-2"><Info className="w-4 h-4" /> Sobre / Contato</TabsTrigger>
        </TabsList>

        {/* === IDENTIDADE === */}
        <TabsContent value="identity">
          <Card>
            <CardHeader><CardTitle>Identidade da Rádio</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Rádio</Label>
                  <Input value={config.radioName} onChange={e => update("radioName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Input value={config.radioFreq} onChange={e => update("radioFreq", e.target.value)} placeholder="87.9" />
                </div>
                <div className="space-y-2">
                  <Label>Slogan</Label>
                  <Input value={config.radioSlogan} onChange={e => update("radioSlogan", e.target.value)} placeholder="A rádio que conecta você!" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL do Stream</Label>
                <Input value={config.streamUrl} onChange={e => update("streamUrl", e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Texto do Rodapé</Label>
                <Input value={config.footerText} onChange={e => update("footerText", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === CORES === */}
        <TabsContent value="colors">
          <Card>
            <CardHeader><CardTitle>Cores do Site</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {([
                  { key: "colorPrimary", label: "Cor Primária" },
                  { key: "colorSecondary", label: "Cor Secundária" },
                  { key: "colorBackground", label: "Fundo do Site" },
                  { key: "colorHeaderBg", label: "Fundo do Header" },
                  { key: "colorNavBg", label: "Fundo da Navegação" },
                  { key: "colorCardBg", label: "Fundo dos Cards" },
                  { key: "colorText", label: "Cor do Texto" },
                  { key: "colorTextMuted", label: "Texto Secundário" },
                ] as { key: keyof SiteConfig; label: string }[]).map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-xs">{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config[key] as string}
                        onChange={e => update(key, e.target.value)}
                        className="w-10 h-10 rounded-md border border-border cursor-pointer"
                      />
                      <Input
                        value={config[key] as string}
                        onChange={e => update(key, e.target.value)}
                        className="flex-1 text-xs font-mono"
                        maxLength={7}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="mt-8 p-6 rounded-lg border border-border" style={{ backgroundColor: config.colorBackground }}>
                <p className="text-xs text-muted-foreground mb-3">Pré-visualização:</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full" style={{ backgroundColor: config.colorPrimary }} />
                  <div className="w-12 h-12 rounded-full" style={{ backgroundColor: config.colorSecondary }} />
                  <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: config.colorHeaderBg }} />
                  <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: config.colorNavBg }} />
                </div>
                <p style={{ color: config.colorText, fontFamily: `'${config.fontHeading}', sans-serif` }} className="text-lg font-bold">
                  {config.radioName} — {config.radioFreq} FM
                </p>
                <p style={{ color: config.colorTextMuted, fontFamily: `'${config.fontBody}', sans-serif` }} className="text-sm">
                  {config.radioSlogan}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === FONTES === */}
        <TabsContent value="fonts">
          <Card>
            <CardHeader><CardTitle>Fontes do Site</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fonte dos Títulos</Label>
                  <select value={config.fontHeading} onChange={e => update("fontHeading", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p className="text-2xl font-bold mt-2" style={{ fontFamily: `'${config.fontHeading}', sans-serif` }}>
                    Exemplo de Título
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Fonte do Corpo</Label>
                  <select value={config.fontBody} onChange={e => update("fontBody", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p className="text-sm mt-2" style={{ fontFamily: `'${config.fontBody}', sans-serif` }}>
                    Este é um exemplo de texto do corpo do site. Observe como a fonte se comporta em parágrafos mais longos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === REDES SOCIAIS === */}
        <TabsContent value="social">
          <Card>
            <CardHeader><CardTitle>Redes Sociais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {([
                { key: "socialInstagram", label: "Instagram", placeholder: "https://instagram.com/suaradio" },
                { key: "socialFacebook", label: "Facebook", placeholder: "https://facebook.com/suaradio" },
                { key: "socialYoutube", label: "YouTube", placeholder: "https://youtube.com/@suaradio" },
                { key: "socialWhatsapp", label: "WhatsApp", placeholder: "https://wa.me/5500000000000" },
                { key: "socialTiktok", label: "TikTok", placeholder: "https://tiktok.com/@suaradio" },
              ] as { key: keyof SiteConfig; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input value={config[key] as string} onChange={e => update(key, e.target.value)} placeholder={placeholder} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === SOBRE === */}
        <TabsContent value="about">
          <Card>
            <CardHeader><CardTitle>Sobre a Rádio / Contato</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sobre a Rádio</Label>
                <Textarea value={config.about} onChange={e => update("about", e.target.value)} rows={4} placeholder="Conte a história da rádio..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input value={config.address} onChange={e => update("address", e.target.value)} placeholder="Rua, cidade..." />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={config.phone} onChange={e => update("phone", e.target.value)} placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={config.email} onChange={e => update("email", e.target.value)} placeholder="contato@radio.com" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPersonalizacao;
