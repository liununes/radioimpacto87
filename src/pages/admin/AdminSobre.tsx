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
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sobre a Estação</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Gerencie a história e os contatos da sua rádio.</p>
        </div>
        <Button onClick={handleSave} className="rounded-lg font-semibold text-sm h-11 px-8 bg-primary text-primary-foreground shadow-sm transition-all w-full sm:w-auto" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Alterações
        </Button>
      </div>

      <Card className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Título da Seção (Ex: A Rádio)</Label>
            <Input value={titulo} onChange={e => setTitulo(e.target.value)} className="h-11 rounded-lg text-lg font-bold" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Nossa História / Descrição Completa</Label>
            <Textarea 
              value={descricao} 
              onChange={e => setDescricao(e.target.value)} 
              rows={8} 
              placeholder="Conte a história da rádio..." 
              className="min-h-[200px] rounded-lg p-4 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border/50">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Endereço Físico</Label>
              <Input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, cidade..." className="h-11 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Telefone para Contato</Label>
              <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="h-11 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">E-mail Profissional</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="contato@radio.com" className="h-11 rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSobre;
