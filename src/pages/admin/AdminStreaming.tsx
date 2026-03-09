import { useState } from "react";
import { Save, Plus, Trash2, MessageCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type RedeSocial, getRedesSociais, saveRedesSociais, getWhatsApp, saveWhatsApp } from "@/lib/radioStore";
import { getSiteConfig, saveSiteConfig } from "@/lib/themeStore";

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
  const siteConfig = getSiteConfig();
  const [streamUrl, setStreamUrl] = useState(siteConfig.streamUrl);
  const [radioName, setRadioName] = useState(siteConfig.radioName);
  const [radioFreq, setRadioFreq] = useState(siteConfig.radioFreq);
  const [logo, setLogo] = useState(siteConfig.logo);

  const [whatsapp, setWhatsapp] = useState(getWhatsApp());
  const [redes, setRedes] = useState<RedeSocial[]>(getRedesSociais());
  const [novaRedeNome, setNovaRedeNome] = useState("");
  const [novaRedeUrl, setNovaRedeUrl] = useState("");
  const [novaRedeIcone, setNovaRedeIcone] = useState("instagram");

  const handleSave = () => {
    saveSiteConfig({ streamUrl, radioName, radioFreq, logo });
    saveWhatsApp(whatsapp);
    alert("Configurações salvas!");
  };

  const handleAddRede = () => {
    if (!novaRedeNome.trim() || !novaRedeUrl.trim()) return;
    const updated = [...redes, { id: crypto.randomUUID(), nome: novaRedeNome, url: novaRedeUrl, icone: novaRedeIcone }];
    saveRedesSociais(updated);
    setRedes(updated);
    setNovaRedeNome(""); setNovaRedeUrl(""); setNovaRedeIcone("instagram");
  };

  const handleDeleteRede = (id: string) => {
    const updated = redes.filter(r => r.id !== id);
    saveRedesSociais(updated);
    setRedes(updated);
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
            <p className="text-xs text-muted-foreground">Cole a URL do seu stream (Zeno.fm, Shoutcast, Icecast, etc.)</p>
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

          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo da Rádio</Label>
            <div className="flex items-center gap-4">
              {logo && (
                <img src={logo} alt="Logo" className="w-16 h-16 rounded-lg object-contain border border-border bg-muted p-1" />
              )}
              <div className="flex gap-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm h-10">
                  <Upload className="w-4 h-4" /> {logo ? "Trocar logo" : "Enviar logo"}
                  <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setLogo(await fileToBase64(f)); }} />
                </label>
                {logo && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setLogo("")}>Remover</Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Formato recomendado: PNG com fundo transparente, 200×200px</p>
          </div>

          <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Salvar</Button>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-500" /> WhatsApp para Pedidos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Número do WhatsApp (com DDD e código do país)</Label>
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5511999999999" />
            <p className="text-xs text-muted-foreground">Formato: 55 + DDD + número. Ex: 5511999999999</p>
          </div>
          <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Salvar</Button>
        </CardContent>
      </Card>

      {/* Redes Sociais */}
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
