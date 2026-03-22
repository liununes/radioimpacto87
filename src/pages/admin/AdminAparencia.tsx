import { useState, useEffect } from "react";
import { Save, Upload, Palette, Image as ImageIcon, Layout, Type, Smartphone, Globe, Radio, ExternalLink, MapPin, CheckCircle2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getThemeConfig, applyTheme, DEFAULT_THEME, type ThemeConfig } from "@/lib/themeStore";
import { getSiteConfig, saveSiteConfig } from "@/lib/radioStore";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const AdminAparencia = () => {
  const [theme, setTheme] = useState<ThemeConfig>(getThemeConfig());
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("visual");
  const { user, hasPermission } = useAuth();
  const isSuperAdmin = hasPermission("*");

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
    
    const [themeRes] = await Promise.all([
      saveSiteConfig("theme", themeToSave),
      getSiteConfig("streaming").then(config => 
        saveSiteConfig("streaming", { ...(config || {}), logo, favicon, radioFreq: theme.radioFreq })
      )
    ]);
    
    if (!themeRes.error) {
      applyTheme(themeToSave);
      toast.success("Design e Configurações atualizados com sucesso!");
    } else {
      toast.error("Erro ao salvar configurações.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--admin-blue)] p-12 text-white shadow-2xl" style={{ backgroundColor: 'var(--admin-blue)' }}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
              <CheckCircle2 className="w-3 h-3 text-[var(--admin-yellow)]" style={{ color: 'var(--admin-yellow)' }} /> Sistema de Design Ativo
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              Controle <span className="text-[var(--admin-yellow)]" style={{ color: 'var(--admin-yellow)' }}>Geral do Site</span>
            </h2>
            <p className="text-white/60 font-bold uppercase tracking-widest text-[11px]">Personalize os dados da rádio, cores e textos</p>
          </div>
          <Button onClick={handleSave} className="bg-[var(--admin-yellow)] hover:opacity-90 text-[var(--admin-blue)] gap-3 px-10 h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 active:scale-95" disabled={loading} style={{ backgroundColor: 'var(--admin-yellow)', color: 'var(--admin-blue)' }}>
            <Save className="w-5 h-5" /> {loading ? "Processando..." : "Publicar Mudanças"}
          </Button>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      </div>

      <Tabs defaultValue="visual" className="space-y-8" onValueChange={setActiveTab}>
        <div className="flex justify-center">
          <TabsList className="bg-white p-1.5 h-auto rounded-3xl border border-gray-100 shadow-xl gap-2 flex-wrap justify-center">
            <TabsTrigger value="visual" className="rounded-2xl px-6 py-4 data-[state=active]:bg-[var(--admin-blue)] data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
              <Palette className="w-4 h-4 mr-2" /> Identidade Visual
            </TabsTrigger>
            <TabsTrigger value="textos" className="rounded-2xl px-6 py-4 data-[state=active]:bg-[var(--admin-blue)] data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
              <Type className="w-4 h-4 mr-2" /> Textos e Rótulos
            </TabsTrigger>
            <TabsTrigger value="layout" className="rounded-2xl px-6 py-4 data-[state=active]:bg-[var(--admin-blue)] data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
              <Layout className="w-4 h-4 mr-2" /> Estrutura
            </TabsTrigger>
            <TabsTrigger value="radio" className="rounded-2xl px-6 py-4 data-[state=active]:bg-[var(--admin-blue)] data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
              <Radio className="w-4 h-4 mr-2" /> Rádio & Frequência
            </TabsTrigger>
            <TabsTrigger value="menus" className="rounded-2xl px-6 py-4 data-[state=active]:bg-[var(--admin-blue)] data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
              <ExternalLink className="w-4 h-4 mr-2" /> Menus do Site
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="whitelabel" className="rounded-2xl px-6 py-4 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                <Settings className="w-4 h-4 mr-2" /> White Label (Painel)
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* --- MENUS TAB --- */}
        <TabsContent value="menus" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black uppercase tracking-tight text-[#002e5d]">Gerenciar Links de Navegação</CardTitle>
              <CardDescription>Crie e organize os itens do menu superior do seu site.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-6">
              <div className="space-y-4">
                {(theme.navMenus || []).map((menu, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px] font-bold uppercase" style={{ color: 'var(--admin-card-text)' }}>Texto do Link</Label>
                      <Input 
                        value={menu.label} 
                        onChange={e => {
                          const newMenus = [...(theme.navMenus || [])];
                          newMenus[idx].label = e.target.value;
                          setTheme(prev => ({ ...prev, navMenus: newMenus }));
                        }}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px] font-bold uppercase" style={{ color: 'var(--admin-card-text)' }}>Endereço (Link ou ID #)</Label>
                      <Input 
                        value={menu.href}
                        onChange={e => {
                          const newMenus = [...(theme.navMenus || [])];
                          newMenus[idx].href = e.target.value;
                          setTheme(prev => ({ ...prev, navMenus: newMenus }));
                        }}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <Button 
                      variant="destructive" 
                      className="mt-6 h-12 w-12 rounded-xl p-0"
                      onClick={() => {
                        const newMenus = (theme.navMenus || []).filter((_, i) => i !== idx);
                        setTheme(prev => ({ ...prev, navMenus: newMenus }));
                      }}
                    >
                      X
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => {
                  const newMenus = [...(theme.navMenus || []), { label: "Novo Link", href: "#" }];
                  setTheme(prev => ({ ...prev, navMenus: newMenus }));
                }}
                className="w-full h-14 rounded-2xl border-2 border-dashed border-gray-200 text-slate-700 hover:text-primary hover:border-primary/50 bg-transparent gap-2"
              >
                + Adicionar Novo Item ao Menu
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- VISUAL TAB --- */}
        <TabsContent value="visual" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase text-primary tracking-tight">Cores da Marca</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-700">Defina os tons que darão vida ao site da sua rádio</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-slate-700 tracking-widest border-b pb-2">Paleta Institucional</h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Fundo Navbar</Label>
                      <input type="color" value={theme.clubeBlue} onChange={e => updateField("clubeBlue", e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-gray-50 shadow-inner" />
                      <span className="text-[9px] font-mono text-slate-700">{theme.clubeBlue}</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Destaques</Label>
                      <input type="color" value={theme.clubeYellow} onChange={e => updateField("clubeYellow", e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-gray-50 shadow-inner" />
                      <span className="text-[9px] font-mono text-slate-700">{theme.clubeYellow}</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Botão Play</Label>
                      <input type="color" value={theme.clubeRed} onChange={e => updateField("clubeRed", e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-gray-50 shadow-inner" />
                      <span className="text-[9px] font-mono text-slate-700">{theme.clubeRed}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6">
                  <h4 className="text-[10px] font-black uppercase text-slate-700 tracking-widest border-b pb-2">Cores de Texto</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Texto Principal</Label>
                      <input type="color" value={theme.textPrimary} onChange={e => updateField("textPrimary", e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-4 border-gray-50 shadow-inner" />
                      <span className="text-[9px] font-mono text-slate-700">{theme.textPrimary}</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Texto Destaque</Label>
                      <input type="color" value={theme.textSecondary} onChange={e => updateField("textSecondary", e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-4 border-gray-50 shadow-inner" />
                      <span className="text-[9px] font-mono text-slate-700">{theme.textSecondary}</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Texto Suave</Label>
                      <input type="color" value={theme.textMuted} onChange={e => updateField("textMuted", e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-4 border-gray-50 shadow-inner" />
                      <span className="text-[9px] font-mono text-slate-700">{theme.textMuted}</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Texto Alerta</Label>
                      <input type="color" value={theme.textAccent} onChange={e => updateField("textAccent", e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-4 border-gray-50 shadow-inner" />
                      <span className="text-[9px] font-mono text-slate-700">{theme.textAccent}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase text-primary tracking-tight">Logotipos</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-700">Identidade visual em todos os dispositivos</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="flex gap-6">
                  <div className="flex-1 space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 block">Logotipo do Site</Label>
                    <div className="relative group">
                      <div className="h-28 bg-gray-50 rounded-2xl flex items-center justify-center p-6 border-2 border-dashed border-gray-100 group-hover:border-primary/20 transition-all overflow-hidden">
                        {logo ? <img src={logo} alt="Logo" className="max-h-full object-contain" /> : <ImageIcon className="w-8 h-8 text-gray-200" />}
                      </div>
                      <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                         <Upload className="text-white w-6 h-6" />
                         <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setLogo(await fileToBase64(f)); }} />
                      </label>
                    </div>
                  </div>
                  <div className="w-40 space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 block">Favicon</Label>
                    <div className="relative group">
                      <div className="h-28 bg-gray-50 rounded-2xl flex items-center justify-center p-6 border-2 border-dashed border-gray-100 group-hover:border-primary/20 transition-all">
                        {favicon ? <img src={favicon} alt="Fav" className="w-10 h-10 object-contain" /> : <Globe className="w-8 h-8 text-gray-200" />}
                      </div>
                      <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                         <Upload className="text-white w-5 h-5" />
                         <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setFavicon(await fileToBase64(f)); }} />
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- TEXTOS TAB --- */}
        <TabsContent value="textos" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
              <CardContent className="p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Interface Geral</div>
                    <div className="space-y-4">
                      <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Input Busca</Label> <Input value={theme.labels.searchPlaceholder} onChange={e => updateLabel("searchPlaceholder", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                      <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Botão Carregar +</Label> <Input value={theme.labels.btnMore} onChange={e => updateLabel("btnMore", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                      <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Botão Enviar Pedido</Label> <Input value={theme.labels.btnSend} onChange={e => updateLabel("btnSend", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                      <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Label No Ar</Label> <Input value={theme.labels.labelOnAir} onChange={e => updateLabel("labelOnAir", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                    </div>

                    <div className="pt-8 space-y-8">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Rodapé (Footer)</div>
                       <div className="space-y-4">
                         <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Descrição Sobre</Label> <textarea value={theme.labels.footerAbout} onChange={e => updateLabel("footerAbout", e.target.value)} className="w-full rounded-xl border-gray-100 p-3 text-sm min-h-[100px]" /> </div>
                         <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Direitos Reservados</Label> <Input value={theme.labels.footerRights} onChange={e => updateLabel("footerRights", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                       </div>
                    </div>
                  </div> 

                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Player e Hero</div>
                    <div className="space-y-4">
                      <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Botão Hero (Ler)</Label> <Input value={theme.labels.heroReadMore} onChange={e => updateLabel("heroReadMore", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                      <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Botão Hero (Mais)</Label> <Input value={theme.labels.heroMoreNews} onChange={e => updateLabel("heroMoreNews", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                      <div className="space-y-1.5 pt-4"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Localização Player</Label> <Input value={theme.labels.playerLocation} onChange={e => updateLabel("playerLocation", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                      <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Ao Vivo Label</Label> <Input value={theme.labels.playerLive} onChange={e => updateLabel("playerLive", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                      <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Ver Programação</Label> <Input value={theme.labels.playerSchedule} onChange={e => updateLabel("playerSchedule", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                      <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Abrir Player</Label> <Input value={theme.labels.playerOpen} onChange={e => updateLabel("playerOpen", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Títulos de Seções</div>
                    <div className="space-y-8">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Notícias 1</Label> <Input value={theme.labels.newsTitle} onChange={e => updateLabel("newsTitle", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                         <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Notícias 2</Label> <Input value={theme.labels.newsSubtitle} onChange={e => updateLabel("newsSubtitle", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Top 1</Label> <Input value={theme.labels.topSongsTitle} onChange={e => updateLabel("topSongsTitle", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                         <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Top 2</Label> <Input value={theme.labels.topSongsSubtitle} onChange={e => updateLabel("topSongsSubtitle", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Galeria 1</Label> <Input value={theme.labels.galleryTitle} onChange={e => updateLabel("galleryTitle", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                         <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Galeria 2</Label> <Input value={theme.labels.gallerySubtitle} onChange={e => updateLabel("gallerySubtitle", e.target.value)} className="rounded-xl border-gray-100 h-12" /> </div>
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
           </Card>
        </TabsContent>

        {/* --- ESTRUTURA TAB --- */}
        <TabsContent value="layout" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white">
                 <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Cidade Padrão</CardTitle>
                    <CardDescription className="text-xs">Define a cidade exibida na barra do player ("Você está em:")</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-0">
                    <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 text-[#002e5d]">
                       <MapPin className="w-6 h-6 text-red-500" />
                       <Input value={theme.weatherCity} onChange={e => updateField("weatherCity", e.target.value)} className="rounded-xl border-none bg-transparent font-black uppercase text-lg h-auto p-0 focus-visible:ring-0" placeholder="Ex: São Paulo" />
                    </div>
                 </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white">
                  <CardHeader className="p-8">
                     <CardTitle className="text-xl font-black uppercase tracking-tight">Visibilidade Front-end</CardTitle>
                     <CardDescription className="text-xs">Ative ou oculte as funções externas do site.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[
                       { l: "Notícias", f: "showNews", p: "vis_noticias" },
                       { l: "Galeria", f: "showGallery", p: "vis_galeria" },
                       { l: "Top Songs", f: "showTopSongs", p: "vis_top3" },
                       { l: "Sobre", f: "showAbout", p: "vis_sobre" },
                       { l: "Programas", f: "showProgramas", p: "vis_programas" },
                       { l: "Locutores", f: "showLocutores", p: "vis_locutores" },
                       { l: "Slides", f: "showSlides", p: "vis_slides" },
                       { l: "Pedidos", f: "showPedidos", p: "vis_pedidos" },
                       { l: "Clima", f: "showWeather", p: "vis_clima" }
                     ].map(item => {
                       // Super Admin can change anything. 
                       // 'aparencia' manager can change all. 
                       // Restricted users can ONLY change what has their specific 'vis_' ID.
                       const canChange = hasPermission("*") || hasPermission("aparencia") || hasPermission(item.p);
                       if (!canChange) return null;

                       return (
                         <div key={item.f} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <span className="text-[10px] font-black uppercase" style={{ color: 'var(--admin-card-text)' }}>{item.l}</span>
                            <Switch checked={(theme as any)[item.f]} onCheckedChange={v => updateField(item.f as any, v)} />
                         </div>
                       );
                     })}
                  </CardContent>
               </Card>
           </div>
        </TabsContent>

        {/* --- RADIO TAB --- */}
        <TabsContent value="radio" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <Card className="rounded-[2.5rem] border-none shadow-xl bg-white">
              <CardHeader className="p-10 pb-4">
                 <CardTitle className="text-2xl font-black uppercase tracking-tight text-[#002e5d]">Sintonização e Link</CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-4 space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                       <Label className="text-xs font-black uppercase tracking-widest text-slate-700">Frequência da Rádio (Ex: 87.9)</Label>
                       <div className="relative">
                          <Input value={theme.radioFreq} onChange={e => updateField("radioFreq", e.target.value)} className="rounded-2xl border-gray-100 h-20 pl-8 pr-20 text-3xl font-black text-[#002e5d]" />
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black text-gray-300 tracking-widest">FM</div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <Label className="text-xs font-black uppercase tracking-widest text-slate-700">Link Externo (Abrir Player)</Label>
                       <Input value={theme.playerOpenUrl} onChange={e => updateField("playerOpenUrl", e.target.value)} className="rounded-2xl border-gray-100 h-20 px-8 text-sm font-bold text-[#002e5d]" />
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
        {/* --- WHITE LABEL TAB --- */}
        {isSuperAdmin && (
          <TabsContent value="whitelabel" className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-purple-600">Logo do Painel</CardTitle>
                  <CardDescription>Esta logo aparece no topo da barra lateral do Admin.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="relative group h-40 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center p-8 overflow-hidden">
                    {theme.adminLogo ? (
                      <img src={theme.adminLogo} alt="Admin Logo" className="max-h-full object-contain" />
                    ) : (
                      <Radio className="w-10 h-10 text-gray-200" />
                    )}
                    <label className="absolute inset-0 cursor-pointer bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="text-white w-8 h-8" />
                      <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) updateField("adminLogo", await fileToBase64(f)); }} />
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-purple-600">Cores do Painel (White Label)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: 'var(--admin-card-text)' }}>Fundo Sidebar</Label>
                      <input type="color" value={theme.adminBlue} onChange={e => updateField("adminBlue", e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner" />
                      <span className="text-[9px] font-mono" style={{ color: 'var(--admin-card-text)' }}>{theme.adminBlue}</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: 'var(--admin-card-text)' }}>Destaque Sidebar</Label>
                      <input type="color" value={theme.adminYellow} onChange={e => updateField("adminYellow", e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner" />
                      <span className="text-[9px] font-mono" style={{ color: 'var(--admin-card-text)' }}>{theme.adminYellow}</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: 'var(--admin-card-text)' }}>Cor de Texto</Label>
                      <input type="color" value={theme.adminText} onChange={e => updateField("adminText", e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner" />
                      <span className="text-[9px] font-mono" style={{ color: 'var(--admin-card-text)' }}>{theme.adminText}</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: 'var(--admin-card-text)' }}>Texto Inativo Sidebar</Label>
                      <input type="color" value={theme.adminSidebarText} onChange={e => updateField("adminSidebarText", e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner" />
                      <span className="text-[9px] font-mono" style={{ color: 'var(--admin-card-text)' }}>{theme.adminSidebarText}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                    <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: 'var(--admin-card-text)' }}>Títulos Admin (Header)</Label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={theme.adminContentTitle || "#002e5d"} onChange={e => updateField("adminContentTitle", e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner" />
                    <span className="text-[9px] font-mono" style={{ color: 'var(--admin-card-text)' }}>{theme.adminContentTitle}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: 'var(--admin-card-text)' }}>Texto de Rótulos (Cards)</Label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={theme.adminCardText || "#475569"} onChange={e => updateField("adminCardText", e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner" />
                    <span className="text-[9px] font-mono" style={{ color: 'var(--admin-card-text)' }}>{theme.adminCardText}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: 'var(--admin-card-text)' }}>Degradê Superior (Início)</Label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={theme.adminHeaderGradStart || "#ffffff"} onChange={e => updateField("adminHeaderGradStart", e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner" />
                    <span className="text-[9px] font-mono" style={{ color: 'var(--admin-card-text)' }}>{theme.adminHeaderGradStart}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: 'var(--admin-card-text)' }}>Degradê Superior (Fim)</Label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={theme.adminHeaderGradEnd || "#f8fafc"} onChange={e => updateField("adminHeaderGradEnd", e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner" />
                    <span className="text-[9px] font-mono" style={{ color: 'var(--admin-card-text)' }}>{theme.adminHeaderGradEnd}</span>
                  </div>
                </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminAparencia;
