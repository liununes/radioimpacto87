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
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Player & <span className="text-secondary italic">Conexões</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Configure o sinal de áudio e seus canais de interação</p>
        </div>
        <div className="flex gap-4">
           <Button onClick={handleSaveConfig} className="rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-blue-900/10" disabled={loading}>
             {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
             Salvar Configurações
           </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="bg-white p-1.5 h-auto rounded-none border border-gray-100 shadow-xl gap-1">
            <TabsTrigger value="sinal" className="rounded-none px-6 py-4 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
              <Radio className="w-4 h-4 mr-2" /> Sinal Online
            </TabsTrigger>
            <TabsTrigger value="redes" className="rounded-none px-6 py-4 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
              <Globe className="w-4 h-4 mr-2" /> Redes Sociais
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="rounded-none px-6 py-4 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sinal" className="animate-in fade-in zoom-in-95 duration-500">
           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
             <CardHeader className="bg-primary/5 p-8 border-b border-gray-100/50">
               <CardTitle className="text-lg font-black uppercase tracking-tight text-primary flex items-center gap-3 italic">
                 <Radio className="w-5 h-5 text-secondary" /> Transmissão Principal
               </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">URL do Fluxo (Stream URL)</Label>
                 <Input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="https://..." className="h-14 rounded-none border-gray-100 bg-gray-50 font-bold text-primary" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Oficial da Estação</Label>
                   <Input value={radioName} onChange={e => setRadioName(e.target.value)} className="h-12 rounded-none border-gray-100" />
                 </div>
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sintonização (Frequência)</Label>
                   <Input value={radioFreq} onChange={e => setRadioFreq(e.target.value)} className="h-12 rounded-none border-gray-100" />
                 </div>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="animate-in fade-in zoom-in-95 duration-500">
           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
             <CardHeader className="bg-emerald-600 p-8 text-white">
                <CardTitle className="text-lg font-black uppercase tracking-tight italic flex items-center gap-3">
                  <MessageCircle className="w-6 h-6" /> WhatsApp & Ouvintes
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between p-8 bg-emerald-50/50 border border-emerald-100">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-600 text-white rounded-none flex items-center justify-center shadow-xl shadow-emerald-900/20">
                         <MessageCircle className="w-8 h-8" />
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-emerald-900 uppercase italic leading-none">Número de Contato</h4>
                         <p className="text-[10px] font-bold text-emerald-600/60 uppercase mt-2">DDI + DDD + NÚMERO (Sem espaços ou traços)</p>
                      </div>
                   </div>
                   <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5511999999999" className="max-w-[240px] h-16 rounded-none border-emerald-100 bg-white font-black text-center text-xl text-emerald-600" />
                </div>
                <div className="space-y-3 bg-gray-50 p-8 border border-gray-100">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Mensagem Padrão (Auto-preenchimento)</Label>
                   <Input 
                      value={whatsappMessage} 
                      onChange={e => setWhatsappMessage(e.target.value)} 
                      placeholder="Ex: Olá Impacto! Gostaria de pedir a música..." 
                      className="h-14 rounded-none border-gray-100 bg-white text-slate-900 font-medium" 
                   />
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">* Esta mensagem aparecerá para o ouvinte ao clicar no botão de WhatsApp.</p>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="redes" className="animate-in fade-in zoom-in-95 duration-500">
           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
              <CardHeader className="p-10 pb-4">
                 <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary italic">Central de Redes Sociais</CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-4 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Nome da Rede</Label>
                    <Input value={novaRedeNome} onChange={e => setNovaRedeNome(e.target.value)} placeholder="Ex: Instagram" className="h-14 rounded-none border-gray-100 bg-gray-50" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Link Completo</Label>
                    <Input value={novaRedeUrl} onChange={e => setNovaRedeUrl(e.target.value)} placeholder="https://..." className="h-14 rounded-none border-gray-100 bg-gray-50" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Escolha o Ícone</Label>
                    <select value={novaRedeIcone} onChange={e => setNovaRedeIcone(e.target.value)}
                      className="flex h-14 w-full rounded-none border border-gray-100 bg-gray-50 px-4 text-sm font-bold text-primary focus-visible:outline-none focus:ring-2 focus:ring-primary">
                      {ICONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
                
                <Button onClick={handleSaveRede} className="h-14 px-12 rounded-none bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl transition-all">
                  {editIdRede ? "Atualizar Rede Social" : "Adicionar à Lista"}
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-gray-50">
                  {redes.map(rede => (
                    <div key={rede.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-none border border-gray-100 group hover:bg-white hover:shadow-2xl transition-all duration-300">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-none bg-white text-slate-900 border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:rotate-6 transition-all">
                                {rede.icone === 'instagram' && <Instagram className="w-6 h-6" />}
                                {rede.icone === 'facebook' && <Facebook className="w-6 h-6" />}
                                {rede.icone === 'youtube' && <Youtube className="w-6 h-6" />}
                                {rede.icone === 'twitter' && <Twitter className="w-6 h-6" />}
                                {rede.icone === 'tiktok' && <Music2 className="w-6 h-6" />}
                                {rede.icone === 'other' && <Globe className="w-6 h-6" />}
                             </div>
                             <div>
                                <h5 className="text-sm font-black text-primary uppercase italic leading-none">{rede.nome}</h5>
                                <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 truncate max-w-[150px]">{rede.url}</p>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <Button size="icon" variant="ghost" className="h-10 w-10 rounded-none bg-white border border-gray-100 shadow-sm" onClick={() => handleEditRede(rede)}><Edit2 className="w-4 h-4" /></Button>
                             <Button size="icon" variant="ghost" className="h-10 w-10 rounded-none bg-red-50 text-red-400 hover:text-red-600 border border-red-100" onClick={() => handleDeleteRede(rede.id)}><Trash2 className="w-4 h-4" /></Button>
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
