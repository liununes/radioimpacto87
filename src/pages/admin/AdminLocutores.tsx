import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, X, Upload } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Locutores</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{editId ? "Editar Locutor" : "Novo Locutor"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do locutor" />
            </div>
            <div className="space-y-2">
              <Label>Foto</Label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm">
                  <Upload className="w-4 h-4" /> Escolher foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                </label>
                {foto && <img src={foto} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-border" />}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Breve descrição" rows={2} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> {editId ? "Atualizar" : "Salvar"}</Button>
            {editId && <Button variant="ghost" onClick={resetForm} className="gap-2"><X className="w-4 h-4" /> Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locutores.map(loc => (
          <Card key={loc.id}>
            <CardContent className="p-4 flex items-center gap-4">
              {loc.foto ? (
                <img src={loc.foto} alt={loc.nome} className="w-14 h-14 rounded-full object-cover border-2 border-primary/30" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xl font-bold">
                  {loc.nome.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{loc.nome}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{loc.bio || "Sem bio"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(loc)}><Edit2 className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(loc.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {locutores.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">Nenhum locutor cadastrado.</p>}
      </div>
    </div>
  );
};

export default AdminLocutores;
