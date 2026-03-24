import { useState, useEffect } from "react";
import { Save, Upload, Palette, Image as ImageIcon, Layout, Type, Smartphone, Globe, Radio, ExternalLink, MapPin, CheckCircle2, Settings, Eye, Heart, Gift, Trash2, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getThemeConfig, applyTheme, DEFAULT_THEME, type ThemeConfig, type Sponsor, type Promo } from "@/lib/themeStore";
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
      {/* Premium Header - SQUARED */}
      <div className="relative overflow-hidden rounded-none bg-[var(--admin-blue)] p-12 text-white shadow-2xl" style={{ backgroundColor: 'var(--admin-blue)' }}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-slate-900/10 rounded-none text-[10px] font-black tracking-widest uppercase mb-4">
              <CheckCircle2 className="w-3 h-3 text-[var(--admin-yellow)]" style={{ color: 'var(--admin-yellow)' }} /> Sistema de Design Ativo
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              Controle <span className="text-[var(--admin-yellow)]" style={{ color: 'var(--admin-yellow)' }}>Geral do Site</span>
            </h2>
            <p className="text-white/60 font-bold uppercase tracking-widest text-[11px]">Personalize os dados da rádio, cores e textos</p>
          </div>
          <Button onClick={handleSave} className="bg-[var(--admin-yellow)] hover:opacity-90 text-[var(--admin-blue)] gap-3 px-10 h-16 rounded-none font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 active:scale-95" disabled={loading} style={{ backgroundColor: 'var(--admin-yellow)', color: 'var(--admin-blue)' }}>
            <Save className="w-5 h-5" /> {loading ? "Processando..." : "Publicar Mudanças"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="visual" className="space-y-8" onValueChange={setActiveTab}>
        <div className="flex flex-col items-center gap-6">
          <TabsList className="bg-white text-slate-900 p-1.5 h-auto rounded-none border border-gray-100 shadow-xl gap-1 flex-wrap justify-center text-slate-400 max-w-7xl">
            <TabsTrigger value="visual" className="rounded-none px-6 py-4 data-[state=active]:bg-[var(--admin-blue)] data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest transition-all">
              <Palette className="w-4 h-4 mr-2" /> Identidade Visual
            </TabsTrigger>
            <TabsTrigger value="textos" className="rounded-none px-6 py-4 data-[state=active]:bg-[var(--admin-blue)] data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest transition-all">
              <Type className="w-4 h-4 mr-2" /> Texto & Cores
            </TabsTrigger>
            <TabsTrigger value="menus" className="rounded-none px-6 py-4 data-[state=active]:bg-[var(--admin-blue)] data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest transition-all">
              <ExternalLink className="w-4 h-4 mr-2" /> Menu do Site
            </TabsTrigger>
            <TabsTrigger value="layout" className="rounded-none px-6 py-4 data-[state=active]:bg-[var(--admin-blue)] data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest transition-all">
              <Layout className="w-4 h-4 mr-2" /> Design do Site
            </TabsTrigger>
            <TabsTrigger value="visibilidade" className="rounded-none px-6 py-4 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest transition-all">
              <Eye className="w-4 h-4 mr-2" /> Visibilidade
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="whitelabel" className="rounded-none px-6 py-4 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest transition-all">
                <Settings className="w-4 h-4 mr-2" /> White Label
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* --- IDENTIDADE VISUAL TAB --- */}
        <TabsContent value="visual" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* SEÇÃO: ARQUIVOS DE LOGO */}
              <Card className="rounded-none border-none shadow-xl overflow-hidden bg-white text-slate-900 border border-gray-100">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black uppercase text-primary tracking-tight">Arquivos de Identidade</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-700">Upload de logotipo e favicon</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <div className="flex flex-col gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 block">Logotipo do Site</Label>
                      <div className="relative group">
                        <div className="h-48 bg-gray-50 rounded-none flex items-center justify-center p-6 border-2 border-dashed border-gray-100 group-hover:border-primary/20 transition-all overflow-hidden">
                          {logo ? <img src={logo} alt="Logo" className="max-h-full object-contain" /> : <ImageIcon className="w-8 h-8 text-gray-200" />}
                        </div>
                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Upload className="text-white w-6 h-6" />
                           <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setLogo(await fileToBase64(f)); }} />
                        </label>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold text-center">Recomendado: 500×500px · PNG Transparente</p>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 block">Favicon (Ícone de Aba)</Label>
                      <div className="relative group">
                        <div className="h-40 bg-gray-50 rounded-none flex items-center justify-center p-6 border-2 border-dashed border-gray-100 group-hover:border-primary/20 transition-all">
                          {favicon ? <img src={favicon} alt="Fav" className="w-10 h-10 object-contain" /> : <Globe className="w-8 h-8 text-gray-200" />}
                        </div>
                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Upload className="text-white w-5 h-5" />
                           <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setFavicon(await fileToBase64(f)); }} />
                        </label>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold text-center">64×64px · ICO ou PNG</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* OUTRAS CORES VISUAIS */}
              <div className="space-y-8">
                 <Card className="rounded-none border-none shadow-xl overflow-hidden bg-white text-slate-900 border border-gray-100">
                    <CardHeader className="bg-orange-600 p-8 text-white">
                      <CardTitle className="text-lg font-black uppercase tracking-tight">Botão Play (Ao Vivo)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fundo</Label>
                          <input type="color" value={theme.playerLiveBg} onChange={e => updateField("playerLiveBg", e.target.value)} className="w-full h-12 rounded-none cursor-pointer border-4 border-gray-50" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ícone</Label>
                          <input type="color" value={theme.playerLiveText} onChange={e => updateField("playerLiveText", e.target.value)} className="w-full h-12 rounded-none cursor-pointer border-4 border-gray-50" />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                         <Label className="text-[10px] font-black uppercase">Exibir Borda?</Label>
                         <Switch checked={theme.showPlayerLiveBorder} onCheckedChange={v => updateField("showPlayerLiveBorder", v)} />
                      </div>
                    </CardContent>
                 </Card>

                 <Card className="rounded-none border-none shadow-xl overflow-hidden bg-white text-slate-900 border border-gray-100">
                    <CardHeader className="bg-emerald-600 p-8 text-white">
                      <CardTitle className="text-lg font-black uppercase tracking-tight">Navegação (Tabs)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Texto Base</Label>
                          <input type="color" value={theme.navItemColor} onChange={e => updateField("navItemColor", e.target.value)} className="w-full h-10 rounded-none cursor-pointer border-2" />
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Texto Ativo</Label>
                          <input type="color" value={theme.navItemActiveTextColor} onChange={e => updateField("navItemActiveTextColor", e.target.value)} className="w-full h-10 rounded-none cursor-pointer border-2" />
                       </div>
                    </CardContent>
                 </Card>
              </div>
           </div>
        </TabsContent>

        {/* --- TEXTO & CORES TAB --- */}
        <TabsContent value="textos" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden border border-gray-100">
              <CardHeader className="bg-primary/5 p-8 border-b border-gray-100/50">
                <CardTitle className="text-xl font-black uppercase tracking-tight text-primary flex items-center gap-3 italic">
                  <Palette className="w-6 h-6 text-accent" /> Cores de Texto & Descrição
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Títulos Gerais</Label>
                    <div className="flex items-center gap-4">
                      <input type="color" value={theme.textTitle} onChange={e => updateField("textTitle", e.target.value)} className="w-16 h-16 rounded-none cursor-pointer border-4 border-gray-50 shadow-inner" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Títulos de Seções</p>
                        <p className="text-[10px] text-gray-400 italic">Body: Index, Sobre, Notícias</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Conteúdo e Mensagens</Label>
                    <div className="flex items-center gap-4">
                      <input type="color" value={theme.textContent} onChange={e => updateField("textContent", e.target.value)} className="w-16 h-16 rounded-none cursor-pointer border-4 border-gray-50 shadow-inner" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Notícias e Descrição</p>
                        <p className="text-[10px] text-gray-400 italic">Parágrafos e resumos</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rótulos e Detalhes</Label>
                    <div className="flex items-center gap-4">
                      <input type="color" value={theme.textDetail} onChange={e => updateField("textDetail", e.target.value)} className="w-16 h-16 rounded-none cursor-pointer border-4 border-gray-50 shadow-inner" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Pequenos Textos</p>
                        <p className="text-[10px] text-gray-400 italic">Destaques: 'PARCEIROS', 'TOP 3', etc.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 bg-gray-50 p-6 rounded-none border border-gray-100">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-black flex items-center gap-2">
                       <Info className="w-4 h-4" /> Sobre a Rádio (Conteúdo Home/Footer)
                    </Label>
                    <textarea 
                      value={theme.labels.footerAbout} 
                      onChange={e => updateLabel("footerAbout", e.target.value)} 
                      placeholder="Conte um pouco sobre a história da sua rádio..."
                      className="w-full h-48 rounded-none border-gray-100 bg-white p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider text-center italic">Este texto alimenta a biografia da rádio em todo o site.</p>
                </div>
              </CardContent>
            </Card>

            {/* SEÇÃO DE LABELS DINÂMICOS */}
            <Card className="rounded-none border-none shadow-xl overflow-hidden bg-white text-slate-900 border border-gray-100">
               <CardContent className="p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-none text-[9px] font-black uppercase tracking-widest">Interface Geral</div>
                       <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Input Busca</Label> <Input value={theme.labels.searchPlaceholder} onChange={e => updateLabel("searchPlaceholder", e.target.value)} className="rounded-none border-gray-100 h-12" /> </div>
                          <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Botão Carregar +</Label> <Input value={theme.labels.btnMore} onChange={e => updateLabel("btnMore", e.target.value)} className="rounded-none border-gray-100 h-12" /> </div>
                          <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Label No Ar</Label> <Input value={theme.labels.labelOnAir} onChange={e => updateLabel("labelOnAir", e.target.value)} className="rounded-none border-gray-100 h-12" /> </div>
                          <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Direitos Reservados</Label> <Input value={theme.labels.footerRights} onChange={e => updateLabel("footerRights", e.target.value)} className="rounded-none border-gray-100 h-12" /> </div>
                       </div>
                    </div>
                    <div className="space-y-8">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-none text-[9px] font-black uppercase tracking-widest">Títulos de Seções</div>
                       <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Notícias 1</Label> <Input value={theme.labels.newsTitle} onChange={e => updateLabel("newsTitle", e.target.value)} className="rounded-none border-gray-100 h-12" /> </div>
                            <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Notícias 2</Label> <Input value={theme.labels.newsSubtitle} onChange={e => updateLabel("newsSubtitle", e.target.value)} className="rounded-none border-gray-100 h-12" /> </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Top 1</Label> <Input value={theme.labels.topSongsTitle} onChange={e => updateLabel("topSongsTitle", e.target.value)} className="rounded-none border-gray-100 h-12" /> </div>
                             <div className="space-y-1.5"> <Label className="text-[10px] font-bold text-slate-700 uppercase">Top 2</Label> <Input value={theme.labels.topSongsSubtitle} onChange={e => updateLabel("topSongsSubtitle", e.target.value)} className="rounded-none border-gray-100 h-12" /> </div>
                          </div>
                       </div>
                    </div>
                 </div>
               </CardContent>
            </Card>
        </TabsContent>

        {/* --- MENU DO SITE TAB --- */}
        <TabsContent value="menus" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <Card className="rounded-none border-none shadow-xl overflow-hidden bg-white text-slate-900 border border-gray-100">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black uppercase tracking-tight text-[#002e5d]">Links de Navegação</CardTitle>
              <CardDescription className="text-xs">Personalize o menu principal superior</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-4">
                {(theme.navMenus || []).map((menu, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50 p-6 rounded-none border border-gray-100 hover:bg-white transition-all">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-[9px] font-black uppercase text-gray-400">Rótulo</Label>
                      <Input 
                        value={menu.label} 
                        onChange={e => {
                          const newMenus = [...(theme.navMenus || [])];
                          newMenus[idx].label = e.target.value;
                          setTheme(prev => ({ ...prev, navMenus: newMenus }));
                        }}
                        className="h-12 rounded-none bg-white border-gray-100"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-[9px] font-black uppercase text-gray-400">Link / Destino</Label>
                      <Input 
                        value={menu.href}
                        onChange={e => {
                          const newMenus = [...(theme.navMenus || [])];
                          newMenus[idx].href = e.target.value;
                          setTheme(prev => ({ ...prev, navMenus: newMenus }));
                        }}
                        className="h-12 rounded-none bg-white border-gray-100"
                      />
                    </div>
                    <Button 
                      variant="destructive" 
                      className="mt-6 h-12 w-12 rounded-none p-0"
                      onClick={() => {
                        const newMenus = (theme.navMenus || []).filter((_, i) => i !== idx);
                        setTheme(prev => ({ ...prev, navMenus: newMenus }));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => {
                  const newMenus = [...(theme.navMenus || []), { label: "Novo Link", href: "#" }];
                  setTheme(prev => ({ ...prev, navMenus: newMenus }));
                }}
                className="w-full h-14 rounded-none border-2 border-dashed border-gray-200 text-slate-700 hover:text-primary hover:border-primary/50 bg-transparent gap-2 font-bold uppercase text-[10px] tracking-widest"
              >
                <Plus className="w-4 h-4" /> Adicionar Novo Item
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- DESIGN DO SITE TAB --- */}
        <TabsContent value="layout" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 border border-gray-100">
                 <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Cidade Padrão</CardTitle>
                    <CardDescription className="text-xs">Define a localização base exibida no site</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-0">
                    <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-none border border-gray-100 text-[#002e5d]">
                       <MapPin className="w-6 h-6 text-red-500" />
                       <Input value={theme.weatherCity} onChange={e => updateField("weatherCity", e.target.value)} className="rounded-none border-none bg-transparent font-black uppercase text-lg h-auto p-0 focus-visible:ring-0" placeholder="Ex: São Paulo" />
                    </div>
                 </CardContent>
              </Card>

              <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 border border-gray-100">
                 <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Cores do Plantão</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 pt-0 grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fundo Plantão</Label>
                       <input type="color" value={theme.plantaoCardBg} onChange={e => updateField("plantaoCardBg", e.target.value)} className="w-full h-10 rounded-none cursor-pointer border-2" />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Texto Plantão</Label>
                       <input type="color" value={theme.plantaoCardTextColor} onChange={e => updateField("plantaoCardTextColor", e.target.value)} className="w-full h-10 rounded-none cursor-pointer border-2" />
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        {/* --- VISIBILIDADE TAB --- */}
        <TabsContent value="visibilidade" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden border border-gray-100">
              <div className="bg-emerald-600 p-8 text-white">
                 <h3 className="text-xl font-black uppercase italic tracking-tighter">Modularidade do Site</h3>
                 <p className="text-white/60 text-xs font-medium mt-1 uppercase tracking-widest">Ative ou oculte seções completas do site</p>
              </div>
              <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { l: "Notícias", f: "showNews", p: "vis_noticias" },
                   { l: "Galeria", f: "showGallery", p: "vis_galeria" },
                   { l: "Top Songs", f: "showTopSongs", p: "vis_top3" },
                   { l: "Sobre", f: "showAbout", p: "vis_sobre" },
                   { l: "Promoções", f: "showPromos", p: "vis_promos" },
                   { l: "Programas", f: "showProgramas", p: "vis_programas" },
                   { l: "Locutores", f: "showLocutores", p: "vis_locutores" },
                   { l: "Slides", f: "showSlides", p: "vis_slides" },
                   { l: "Pedidos", f: "showPedidos", p: "vis_pedidos" },
                   { l: "Clima", f: "showWeather", p: "vis_clima" },
                   { l: "Patrocinadores", f: "showSponsors", p: "vis_sponsors" },
                   { l: "Voltar ao Topo", f: "showBackToTop", p: "vis_topo" },
                   { l: "Entretenimento", f: "showEntretenimento", p: "vis_news" },
                   { l: "Redes Sociais", f: "showSocial", p: "aparencia" }
                 ].map(item => {
                   const canChange = hasPermission("*") || hasPermission("aparencia") || hasPermission(item.p);
                   if (!canChange) return null;

                   return (
                     <div key={item.f} className="flex items-center justify-between p-6 bg-gray-50 rounded-none border border-gray-100 hover:border-emerald-200 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{item.l}</span>
                        <Switch checked={(theme as any)[item.f]} onCheckedChange={v => updateField(item.f as any, v)} />
                     </div>
                   );
                 })}
              </CardContent>
           </Card>
        </TabsContent>

        {/* --- WHITE LABEL TAB --- */}
        {isSuperAdmin && (
          <TabsContent value="whitelabel" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden border border-gray-100">
               <div className="bg-purple-600 p-8 text-white">
                 <h3 className="text-xl font-black uppercase italic tracking-tighter">Personalização de Marca (Painel)</h3>
                 <p className="text-white/60 text-xs font-medium mt-1">Configure as cores do ambiente administrativo</p>
               </div>
               <CardContent className="p-8 space-y-12">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                     <div className="space-y-4">
                        <Label className="text-[9px] font-black uppercase text-gray-400 text-center block">Fundo Sidebar</Label>
                        <input type="color" value={theme.adminBlue} onChange={e => updateField("adminBlue", e.target.value)} className="w-full h-16 rounded-none cursor-pointer border-4 border-gray-50" />
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[9px] font-black uppercase text-gray-400 text-center block">Destaque</Label>
                        <input type="color" value={theme.adminYellow} onChange={e => updateField("adminYellow", e.target.value)} className="w-full h-16 rounded-none cursor-pointer border-4 border-gray-50" />
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[9px] font-black uppercase text-gray-400 text-center block">Texto Ativo</Label>
                        <input type="color" value={theme.adminText} onChange={e => updateField("adminText", e.target.value)} className="w-full h-16 rounded-none cursor-pointer border-4 border-gray-50" />
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[9px] font-black uppercase text-gray-400 text-center block">Degradê Início</Label>
                        <input type="color" value={theme.adminHeaderGradStart} onChange={e => updateField("adminHeaderGradStart", e.target.value)} className="w-full h-16 rounded-none cursor-pointer border-4 border-gray-50" />
                     </div>
                  </div>
                  
                  <div className="pt-8 border-t border-gray-50 text-center">
                     <Button 
                       variant="ghost" 
                       onClick={() => {
                        updateField("adminBlue", "#002e5d");
                        updateField("adminYellow", "#ffed32");
                        updateField("adminText", "#ffffff");
                        toast.success("Restaurado para o padrão!");
                       }}
                       className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                     >
                       Restaurar Cores de Fábrica
                     </Button>
                  </div>
               </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminAparencia;
