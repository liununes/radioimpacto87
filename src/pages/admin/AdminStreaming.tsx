import { useState, useEffect } from "react";
import { Save, Plus, Trash2, MessageCircle, Upload, Loader2, Edit2, X, Radio, Info, Instagram, Facebook, Youtube, Twitter, Music2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type RedeSocial, getRedesSociais, saveRedeSocial, deleteRedeSocial, getWhatsApp, saveWhatsApp, getSiteConfig as getRadioSiteConfig, saveSiteConfig as saveRadioSiteConfig } from "@/lib/radioStore";
import { toast } from "sonner";

const ICONE_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter / X" },
  { value: "tiktok", label: "TikTok" },
  { value: "other", label: "Outro" },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminStreaming = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "sinal";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [streamUrl, setStreamUrl] = useState("");
  const [radioName, setRadioName] = useState("");
  const [radioFreq, setRadioFreq] = useState("");
  const [logo, setLogo] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [favicon, setFavicon] = useState("");

  const [redes, setRedes] = useState<RedeSocial[]>([]);
  const [novaRedeNome, setNovaRedeNome] = useState("");
  const [novaRedeUrl, setNovaRedeUrl] = useState("");
  const [novaRedeIcone, setNovaRedeIcone] = useState("instagram");
  const [editIdRede, setEditIdRede] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const onTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    const fetchData = async () => {
      const [config, redesData, whatsappNum] = await Promise.all([
        getRadioSiteConfig("streaming"),
        getRedesSociais(),
        getWhatsApp()
      ]);
      if (config) {
        setStreamUrl(config.streamUrl || "https://streaming.liurecord.com.br/radio/8005/stream");
        setRadioName(config.radioName || "Impacto FM");
        setRadioFreq(config.radioFreq || "87.9 FM");
        setLogo(config.logo || "/logo.png");
        setFavicon(config.favicon || "/favicon.ico");
        setWhatsappMessage(config.whatsappMessage || "");
      } else {
        setStreamUrl("https://streaming.liurecord.com.br/radio/8005/stream");
        setRadioName("Impacto FM");
        setRadioFreq("87.9 FM");
        setLogo("/logo.png");
        setFavicon("/favicon.ico");
      }
      setRedes(redesData);
      setWhatsapp(whatsappNum);
    };
    fetchData();
  }, []);

  const handleSaveConfig = async () => {
    setLoading(true);
    const { error: configError } = await saveRadioSiteConfig("streaming", { 
      streamUrl, 
      radioName, 
      radioFreq, 
      logo, 
      favicon,
      whatsapp,
      whatsappMessage 
    });
    if (configError) {
      toast.error("Erro ao salvar: " + configError.message);
    } else {
      toast.success("Configurações salvas!");
    }
    setLoading(false);
  };

  const handleSaveRede = async () => {
    if (!novaRedeNome.trim() || !novaRedeUrl.trim()) return;
    const { error } = await saveRedeSocial({ 
      id: editIdRede || undefined,
      nome: novaRedeNome, 
      url: novaRedeUrl, 
      icone: novaRedeIcone 
    });
    
    if (error) {
      toast.error("Erro ao salvar rede social.");
    } else {
      toast.success(editIdRede ? "Rede social atualizada!" : "Rede social adicionada!");
      setRedes(await getRedesSociais());
      resetRedeForm();
    }
  };

  const handleEditRede = (rede: RedeSocial) => {
    setEditIdRede(rede.id);
    setNovaRedeNome(rede.nome);
    setNovaRedeUrl(rede.url);
    setNovaRedeIcone(rede.icone);
  };

  const handleDeleteRede = async (id: string) => {
    const { error } = await deleteRedeSocial(id);
    if (error) {
      toast.error("Erro ao remover.");
    } else {
      toast.success("Rede social removida!");
      setRedes(await getRedesSociais());
    }
  };

  const resetRedeForm = () => {
    setEditIdRede(null);
    setNovaRedeNome("");
    setNovaRedeUrl("");
    setNovaRedeIcone("instagram");
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Player & Conexões</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Configure o sinal de áudio e os canais de interação da rádio.</p>
        </div>
        <div className="flex gap-4">
           <Button onClick={handleSaveConfig} className="rounded-lg font-semibold text-sm h-11 px-8 bg-primary text-primary-foreground shadow-sm transition-all w-full sm:w-auto" disabled={loading}>
             {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
             Salvar Configurações
           </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-8">
        <div className="flex flex-col items-center sm:items-start gap-4">
          <TabsList className="bg-muted p-1 rounded-xl gap-1 flex-wrap max-w-full justify-start overflow-x-auto">
            <TabsTrigger value="sinal" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-semibold text-sm transition-all whitespace-nowrap">
              <Radio className="w-4 h-4 mr-2" /> Sinal Online
            </TabsTrigger>
            <TabsTrigger value="redes" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-semibold text-sm transition-all whitespace-nowrap">
              <Globe className="w-4 h-4 mr-2" /> Redes Sociais
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-semibold text-sm transition-all whitespace-nowrap">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sinal" className="animate-in fade-in zoom-in-95 duration-500">
           <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden">
             <CardHeader className="p-6 border-b border-border/50">
               <CardTitle className="text-base font-bold flex items-center gap-2">
                 <Radio className="w-5 h-5 text-primary" /> Transmissão Principal
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
               <div className="space-y-2">
                 <Label className="text-sm font-semibold">URL do Fluxo (Stream URL)</Label>
                 <Input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="https://..." className="h-11 rounded-lg text-base" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="text-sm font-semibold">Nome Oficial da Estação</Label>
                   <Input value={radioName} onChange={e => setRadioName(e.target.value)} className="h-11 rounded-lg" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-sm font-semibold">Sintonização (Frequência)</Label>
                   <Input value={radioFreq} onChange={e => setRadioFreq(e.target.value)} className="h-11 rounded-lg" />
                 </div>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="animate-in fade-in zoom-in-95 duration-500">
           <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden">
             <CardHeader className="p-6 border-b border-border/50 bg-emerald-500/10">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-500">
                  <MessageCircle className="w-5 h-5" /> WhatsApp & Ouvintes
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-muted/50 rounded-xl border border-border gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                         <MessageCircle className="w-6 h-6" />
                      </div>
                      <div>
                         <h4 className="text-base font-bold text-foreground">Número de Contato</h4>
                         <p className="text-sm font-medium text-muted-foreground mt-0.5">DDI + DDD + NÚMERO (Sem espaços)</p>
                      </div>
                   </div>
                   <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5511999999999" className="w-full sm:max-w-[240px] h-11 rounded-lg font-bold text-center text-lg" />
                </div>
                <div className="space-y-2 p-6 rounded-xl border border-border bg-card">
                   <Label className="text-sm font-semibold">Mensagem Padrão (Auto-preenchimento)</Label>
                   <p className="text-xs text-muted-foreground font-medium mb-2">* Esta mensagem aparecerá para o ouvinte ao clicar no botão de WhatsApp.</p>
                   <Input 
                      value={whatsappMessage} 
                      onChange={e => setWhatsappMessage(e.target.value)} 
                      placeholder="Ex: Olá Impacto! Gostaria de pedir a música..." 
                      className="h-11 rounded-lg text-sm" 
                   />
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="redes" className="animate-in fade-in zoom-in-95 duration-500">
           <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden">
              <CardHeader className="p-6 border-b border-border/50">
                 <CardTitle className="text-base font-bold">Central de Redes Sociais</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Nome da Rede</Label>
                    <Input value={novaRedeNome} onChange={e => setNovaRedeNome(e.target.value)} placeholder="Ex: Instagram" className="h-11 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Link Completo</Label>
                    <Input value={novaRedeUrl} onChange={e => setNovaRedeUrl(e.target.value)} placeholder="https://..." className="h-11 rounded-lg" />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <Label className="text-sm font-semibold">Escolha o Ícone</Label>
                    <div className="flex gap-2">
                      <select value={novaRedeIcone} onChange={e => setNovaRedeIcone(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        {ICONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <Button onClick={handleSaveRede} className="h-11 rounded-lg bg-primary text-primary-foreground font-semibold shrink-0">
                        {editIdRede ? "Salvar" : "Adicionar"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 mt-4 border-t border-border/50">
                  {redes.map(rede => (
                    <div key={rede.id} className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border group hover:bg-muted/80 hover:shadow-sm transition-all">
                       <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary shadow-sm shrink-0 border border-border/50">
                                {rede.icone === 'instagram' && <Instagram className="w-4 h-4" />}
                                {rede.icone === 'facebook' && <Facebook className="w-4 h-4" />}
                                {rede.icone === 'youtube' && <Youtube className="w-4 h-4" />}
                                {rede.icone === 'twitter' && <Twitter className="w-4 h-4" />}
                                {rede.icone === 'tiktok' && <Music2 className="w-4 h-4" />}
                                {rede.icone === 'other' && <Globe className="w-4 h-4" />}
                             </div>
                             <div className="min-w-0 pr-2">
                                <h5 className="text-sm font-bold text-foreground truncate">{rede.nome}</h5>
                                <p className="text-xs font-medium text-muted-foreground truncate">{rede.url}</p>
                             </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                             <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => handleEditRede(rede)}><Edit2 className="w-4 h-4" /></Button>
                             <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRede(rede.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                       </div>
                  ))}
                </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStreaming;
