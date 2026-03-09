import { useState } from "react";
import { Save, Plus, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type RedeSocial, getRedesSociais, saveRedesSociais, getWhatsApp, saveWhatsApp } from "@/lib/radioStore";

const STORAGE_KEY = "radio_streaming_config";

const ICONE_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter / X" },
  { value: "tiktok", label: "TikTok" },
  { value: "other", label: "Outro" },
];

function getConfig() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

const AdminStreaming = () => {
  const saved = getConfig();
  const [streamUrl, setStreamUrl] = useState(saved.streamUrl || "https://stream.zeno.fm/yn65fsaurfhvv");
  const [radioName, setRadioName] = useState(saved.radioName || "Impacto FM");
  const [radioFreq, setRadioFreq] = useState(saved.radioFreq || "87.9 FM");

  const [whatsapp, setWhatsapp] = useState(getWhatsApp());
  const [redes, setRedes] = useState<RedeSocial[]>(getRedesSociais());
  const [novaRedeNome, setNovaRedeNome] = useState("");
  const [novaRedeUrl, setNovaRedeUrl] = useState("");
  const [novaRedeIcone, setNovaRedeIcone] = useState("instagram");

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ streamUrl, radioName, radioFreq }));
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
      <h2 className="text-2xl font-bold text-foreground">Streaming / Player</h2>

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
