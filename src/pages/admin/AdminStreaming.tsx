import { useState, useEffect } from "react";
import { Save, Plus, Trash2, MessageCircle, Upload, Loader2 } from "lucide-react";
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

  const [favicon, setFavicon] = useState("");

  const [redes, setRedes] = useState<RedeSocial[]>([]);
  const [novaRedeNome, setNovaRedeNome] = useState("");
  const [novaRedeUrl, setNovaRedeUrl] = useState("");
  const [novaRedeIcone, setNovaRedeIcone] = useState("instagram");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [config, redesData, whatsappNum] = await Promise.all([
        getRadioSiteConfig("streaming"),
        getRedesSociais(),
        getWhatsApp()
      ]);
      if (config) {
        setStreamUrl(config.streamUrl || "");
        setRadioName(config.radioName || "Impacto FM");
        setRadioFreq(config.radioFreq || "87.9 FM");
        setLogo(config.logo || "/logo.png");
        setFavicon(config.favicon || "/favicon.ico");
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
      whatsapp 
    });
    if (configError) {
      toast.error("Erro ao salvar: " + configError.message);
    } else {
      toast.success("Configurações salvas!");
    }
    setLoading(false);
  };

  const handleAddRede = async () => {
    if (!novaRedeNome.trim() || !novaRedeUrl.trim()) return;
    const { error } = await saveRedeSocial({ nome: novaRedeNome, url: novaRedeUrl, icone: novaRedeIcone });
    if (error) {
      toast.error("Erro ao adicionar rede social.");
    } else {
      toast.success("Rede social adicionada!");
      setRedes(await getRedesSociais());
      setNovaRedeNome(""); setNovaRedeUrl(""); setNovaRedeIcone("instagram");
    }
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Player / Redes Sociais</h2>

      <Card>
        <CardHeader><CardTitle>Configurações do Player</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL do Stream</Label>
            <Input value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Rádio</Label>
              <Input value={radioName} onChange={e => setRadioName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Input value={radioFreq} onChange={e => setRadioFreq(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Logo da Rádio</Label>
              <div className="flex items-center gap-4">
                {logo && (
                  <img src={logo} alt="Logo" className="w-16 h-16 rounded-lg object-contain border border-border bg-muted p-1" />
                )}
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm h-10">
                    <Upload className="w-4 h-4" /> {logo ? "Trocar" : "Escolher"}
                    <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setLogo(await fileToBase64(f)); }} />
                  </label>
                  {logo && (
                    <Button variant="ghost" size="sm" className="text-destructive h-10" onClick={() => setLogo("")}>Remover</Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ícone do Site (Favicon)</Label>
              <div className="flex items-center gap-4">
                {favicon && (
                  <img src={favicon} alt="Favicon" className="w-10 h-10 rounded-lg object-contain border border-border bg-muted p-1" />
                )}
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm h-10">
                    <Upload className="w-4 h-4" /> {favicon ? "Trocar" : "Escolher"}
                    <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setFavicon(await fileToBase64(f)); }} />
                  </label>
                  {favicon && (
                    <Button variant="ghost" size="sm" className="text-destructive h-10" onClick={() => setFavicon("")}>Remover</Button>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Este é o ícone que aparece na aba do navegador.</p>
            </div>
          </div>

          <Button onClick={handleSaveConfig} className="gap-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-500" /> WhatsApp para Pedidos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Número do WhatsApp (com DDD e código do país)</Label>
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5511999999999" />
          </div>
          <Button onClick={handleSaveConfig} className="gap-2"><Save className="w-4 h-4" /> Salvar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Redes Sociais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={novaRedeNome} onChange={e => setNovaRedeNome(e.target.value)} placeholder="Ex: Instagram" />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={novaRedeUrl} onChange={e => setNovaRedeUrl(e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <select value={novaRedeIcone} onChange={e => setNovaRedeIcone(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {ICONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <Button onClick={handleAddRede} className="gap-2"><Plus className="w-4 h-4" /> Adicionar Rede Social</Button>

          {redes.length > 0 && (
            <div className="space-y-2 mt-4">
              {redes.map(rede => (
                <div key={rede.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div>
                    <span className="text-sm font-medium text-foreground">{rede.nome}</span>
                    <span className="text-xs text-muted-foreground ml-2">({rede.icone})</span>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{rede.url}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteRede(rede.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStreaming;
