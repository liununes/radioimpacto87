import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STORAGE_KEY = "radio_sobre";

function getSobre() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

const AdminSobre = () => {
  const saved = getSobre();
  const [titulo, setTitulo] = useState(saved.titulo || "Impacto FM 87.9");
  const [descricao, setDescricao] = useState(saved.descricao || "");
  const [endereco, setEndereco] = useState(saved.endereco || "");
  const [telefone, setTelefone] = useState(saved.telefone || "");
  const [email, setEmail] = useState(saved.email || "");

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ titulo, descricao, endereco, telefone, email }));
    alert("Informações salvas!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Sobre a Rádio</h2>
      <Card>
        <CardHeader><CardTitle>Informações da Rádio</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Rádio</Label>
            <Input value={titulo} onChange={e => setTitulo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descrição / Sobre</Label>
            <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={4} placeholder="Conte a história da rádio..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, cidade..." />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="contato@radio.com" />
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Salvar</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSobre;
