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
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Sobre a <span className="text-secondary italic">Estação</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Gerencie a história e os contatos da sua rádio</p>
        </div>
        <Button onClick={handleSave} className="rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-primary text-white hover:bg-primary/90 transition-all shadow-lg" disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Alterações
        </Button>
      </div>

      <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
        <CardContent className="p-12 space-y-10">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Título da Seção (Ex: A Rádio)</Label>
            <Input value={titulo} onChange={e => setTitulo(e.target.value)} className="h-14 rounded-none border-gray-100 bg-gray-50 text-xl font-black text-primary" />
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nossa História / Descrição Completa</Label>
            <Textarea 
              value={descricao} 
              onChange={e => setDescricao(e.target.value)} 
              rows={8} 
              placeholder="Conte a história da rádio..." 
              className="rounded-none border-gray-100 bg-gray-50 p-6 text-sm font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-300">Endereço Físico</Label>
              <Input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, cidade..." className="h-12 rounded-none border-gray-100" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-300">Telefone para Contato</Label>
              <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="h-12 rounded-none border-gray-100" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-300">E-mail Profissional</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="contato@radio.com" className="h-12 rounded-none border-gray-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSobre;
