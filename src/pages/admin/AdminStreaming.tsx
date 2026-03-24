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

const AdminStreaming = () => {
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
        // Caso não exista config no banco, já pré-carrega o padrão solicitado com HTTPS
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
;

  return (    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
             <CardHeader className="bg-primary/5 p-8 border-b border-gray-100/50">
               <CardTitle className="text-lg font-black uppercase tracking-tight text-primary flex items-center gap-3">
                 <Radio className="w-5 h-5 text-secondary" /> Transmissão Principal
               </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">URL do Fluxo (Stream URL)</Label>
                 <Input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="https://streaming.liurecord.com.br/radio/8005/stream" className="h-14 rounded-none border-gray-100 bg-gray-50 font-bold text-primary" />
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

                <div className="pt-6 border-t border-gray-50 p-6 bg-secondary/5 rounded-none space-y-6">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-none bg-secondary flex items-center justify-center shadow-lg shadow-yellow-400/20">
                           <MessageCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                           <h4 className="text-xs font-black text-primary uppercase leading-none">Canal do Ouvinte</h4>
                           <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">WhatsApp para sorteios e pedidos</p>
                        </div>
                     </div>
                     <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="55..." className="max-w-[180px] h-12 rounded-none border-gray-100 font-black text-center" />
                   </div>
                   
                   <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Texto Padrão para Pedidos (Auto-preenchimento)</Label>
                     <Input 
                        value={whatsappMessage} 
                        onChange={e => setWhatsappMessage(e.target.value)} 
                        placeholder="Ex: Olá Impacto! Gostaria de pedir a música..." 
                        className="h-12 rounded-none border-gray-100 bg-white text-slate-900" 
                     />
                   </div>
                </div>
             </CardContent>
           </Card>

           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
             <CardHeader className="p-8 pb-4">
               <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">Redes Sociais</CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-4 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Plataforma</Label>
                   <Input value={novaRedeNome} onChange={e => setNovaRedeNome(e.target.value)} placeholder="Ex: Instagram" className="h-12 rounded-none border-gray-100" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Endereço (Link)</Label>
                   <Input value={novaRedeUrl} onChange={e => setNovaRedeUrl(e.target.value)} placeholder="https://..." className="h-12 rounded-none border-gray-100" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ícone</Label>
                   <select value={novaRedeIcone} onChange={e => setNovaRedeIcone(e.target.value)}
                     className="flex h-12 w-full rounded-none border border-gray-100 bg-background px-4 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                     {ICONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                   </select>
                 </div>
               </div>
               
               <div className="flex gap-4">
                 <Button onClick={handleSaveRede} className="h-12 px-10 rounded-none bg-gray-100 text-primary hover:bg-primary hover:text-white font-black uppercase text-[10px] tracking-widest transition-all">
                   {editIdRede ? "Salvar Alteração" : "Adicionar Nova Rede"}
                 </Button>
                 {editIdRede && (
                   <Button variant="ghost" onClick={resetRedeForm} className="h-12 px-6 rounded-none font-bold uppercase text-[10px]">Cancelar</Button>
                 )}
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 mt-6 border-t border-gray-50">
                 {redes.map(rede => (
                   <div key={rede.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-none border border-gray-100 group hover:bg-white text-slate-900 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-none bg-white text-slate-900 border border-gray-100 flex items-center justify-center text-primary">
                               {rede.icone === 'instagram' && <Instagram className="w-5 h-5" />}
                               {rede.icone === 'facebook' && <Facebook className="w-5 h-5" />}
                               {rede.icone === 'youtube' && <Youtube className="w-5 h-5" />}
                               {rede.icone === 'twitter' && <Twitter className="w-5 h-5" />}
                               {rede.icone === 'tiktok' && <Music2 className="w-5 h-5" />}
                               {rede.icone === 'other' && <Globe className="w-5 h-5" />}
                               {!['instagram', 'facebook', 'youtube', 'twitter', 'tiktok', 'other'].includes(rede.icone) && <Globe className="w-5 h-5" />}
                            </div>
                            <div>
                               <h5 className="text-[11px] font-black text-primary uppercase leading-none">{rede.nome}</h5>
                               <p className="text-[9px] font-bold text-gray-300 uppercase mt-1 truncate max-w-[120px]">{rede.url}</p>
                            </div>
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none" onClick={() => handleEditRede(rede)}><Edit2 className="w-3.5 h-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none text-red-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteRede(rede.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                         </div>
                      </div>
                 ))}
               </div>
             </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <Card className="rounded-none border-none shadow-xl bg-[#002e5d] text-white p-8 relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                 <h3 className="text-xl font-black uppercase tracking-tight italic">Identidade Visual</h3>
                 <p className="text-xs text-white/50 font-medium leading-relaxed">As logos e favicons agora são gerenciados na central de Personalização.</p>
                 <Button asChild className="w-full h-12 rounded-none bg-[#ffed32] text-[#002e5d] font-black uppercase text-[10px] tracking-widest hover:bg-white text-slate-900 transition-all shadow-lg shadow-yellow-400/10">
                    <a href="/admin/aparencia">Ir para Personalização</a>
                 </Button>
              </div>
           </Card>

           <div className="p-8 bg-gray-50 rounded-none border border-gray-100 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-none bg-white text-slate-900 border border-gray-100 flex items-center justify-center shadow-sm">
                 <Info className="w-8 h-8 text-primary/20" />
              </div>
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Dica do Admin</h4>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed px-4">Utilize URLs seguras (HTTPS) para garantir que o player funcione em todos os navegadores modernos.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStreaming;
