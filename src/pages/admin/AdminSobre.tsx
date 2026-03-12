import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteConfig, saveSiteConfig } from "@/lib/radioStore";
import { toast } from "sonner";

const AdminSobre = () => {
  const [titulo, setTitulo] = useState("Impacto FM 87.9");
  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSobre = async () => {
      const data = await getSiteConfig("sobre");
      if (data) {
        setTitulo(data.titulo || "Impacto FM 87.9");
        setDescricao(data.descricao || "");
        setEndereco(data.endereco || "");
        setTelefone(data.telefone || "");
        setEmail(data.email || "");
      }
    };
    fetchSobre();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await saveSiteConfig("sobre", { titulo, descricao, endereco, telefone, email });
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Informações salvas com sucesso!");
    }
    setLoading(false);
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
          <Button onClick={handleSave} className="gap-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSobre;
