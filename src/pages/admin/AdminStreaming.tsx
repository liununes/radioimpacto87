import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STORAGE_KEY = "radio_streaming_config";

function getConfig() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

const AdminStreaming = () => {
  const saved = getConfig();
  const [streamUrl, setStreamUrl] = useState(saved.streamUrl || "https://stream.zeno.fm/yn65fsaurfhvv");
  const [radioName, setRadioName] = useState(saved.radioName || "Impacto FM");
  const [radioFreq, setRadioFreq] = useState(saved.radioFreq || "87.9 FM");

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ streamUrl, radioName, radioFreq }));
    alert("Configurações salvas!");
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
    </div>
  );
};

export default AdminStreaming;
