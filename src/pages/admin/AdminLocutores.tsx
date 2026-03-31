import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, X, Upload, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Locutor, getLocutores, saveLocutor, deleteLocutor } from "@/lib/radioStore";
import { toast } from "sonner";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

const AdminLocutores = () => {
  const [locutores, setLocutores] = useState<Locutor[]>([]);
  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [foto, setFoto] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLocutores = async () => {
    const data = await getLocutores();
    setLocutores(data);
  };

  useEffect(() => { fetchLocutores(); }, []);

  const handleSave = async () => {
    if (!nome.trim()) { toast.error("Nome é obrigatório"); return; }
    
    setLoading(true);
    const { error } = await saveLocutor({
      id: editId || undefined,
      nome,
      bio,
      foto
    });

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success(editId ? "Locutor atualizado!" : "Locutor criado!");
      await fetchLocutores();
      resetForm();
    }
    setLoading(false);
  };

  const handleEdit = (loc: Locutor) => {
    setEditId(loc.id); setNome(loc.nome); setBio(loc.bio || ""); setFoto(loc.foto || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este locutor?")) return;
    
    const { error } = await deleteLocutor(id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
    } else {
      toast.success("Locutor removido!");
      await fetchLocutores();
    }
  };

  const resetForm = () => { setEditId(null); setNome(""); setBio(""); setFoto(""); };

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFoto(await fileToBase64(file));
  };

  return (    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Time de Locutores</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Gerencie as vozes que comandam a sua programação.</p>
        </div>
        <Button onClick={resetForm} variant="outline" className="rounded-lg font-semibold shadow-sm text-sm h-11 px-6">
           Limpar Tudo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden sticky top-32">
            <CardHeader className="p-6 pb-4 border-b border-border/50">
              <CardTitle className="text-lg font-bold">
                {editId ? "Editar Cadastro" : "Novo Cadastro"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-muted border-4 border-background shadow-sm overflow-hidden flex items-center justify-center">
                       {foto ? <img src={foto} alt="Preview" className="w-full h-full object-cover" /> : <Users className="w-8 h-8 text-muted-foreground" />}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full gap-2">
                       <label className="cursor-pointer flex items-center justify-center hover:scale-110 transition-transform" title="Alterar Foto">
                          <Upload className="text-white w-5 h-5" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                       </label>
                       {foto && (
                         <button 
                           type="button" 
                           onClick={() => setFoto("")}
                           className="flex items-center justify-center hover:scale-110 transition-transform text-white hover:text-red-500"
                           title="Remover Foto"
                         >
                           <Trash2 className="w-5 h-5" />
                         </button>
                       )}
                    </div>
                  </div>
                 <div className="text-center">
                   <Label className="text-sm font-semibold">Foto do Perfil</Label>
                   <p className="text-xs text-muted-foreground mt-1">JPG ou PNG (Min. 400x400px)</p>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Nome Artístico</Label>
                  <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Robson Silva" className="h-11 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Bio / Descrição</Label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Fale um pouco sobre o locutor..." rows={4} className="rounded-lg resize-none" />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {editId ? "Atualizar Perfil" : "Cadastrar Agora"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
               {locutores.map(loc => (
                <Card key={loc.id} className="group overflow-hidden rounded-xl border border-border shadow-sm bg-card hover:shadow-md transition-shadow flex flex-col items-center text-center p-6">
                   <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 text-primary border-4 border-background shadow-sm overflow-hidden flex items-center justify-center">
                         {loc.foto ? <img src={loc.foto} alt={loc.nome} className="w-full h-full object-cover" /> : <div className="text-2xl font-bold">{loc.nome.charAt(0)}</div>}
                      </div>
                   </div>
                   <div className="flex-1 space-y-1 mb-6">
                      <h3 className="text-base font-bold text-foreground line-clamp-1">{loc.nome}</h3>
                      <p className="text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed">{loc.bio || "Nenhuma biografia disponível."}</p>
                   </div>
                   <div className="flex gap-2 w-full pt-4 border-t border-border">
                      <Button variant="ghost" className="flex-1 h-9 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold rounded-md" onClick={() => handleEdit(loc)}>Editar</Button>
                      <Button variant="ghost" className="flex-1 h-9 text-muted-foreground hover:text-red-500 hover:bg-red-50 text-xs font-semibold rounded-md" onClick={() => handleDelete(loc.id)}>Excluir</Button>
                   </div>
                </Card>
              ))}
              {locutores.length === 0 && (
                <div className="col-span-full py-16 bg-muted/30 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                   <Users className="w-12 h-12 mb-3 opacity-20" />
                   <p className="text-sm font-medium">Nenhum locutor encontrado</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLocutores;
