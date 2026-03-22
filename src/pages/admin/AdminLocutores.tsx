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

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Time de <span className="text-secondary italic">Locutores</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Gerencie as vozes que comandam a sua programação</p>
        </div>
        <Button onClick={resetForm} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-gray-50 text-gray-400 border border-gray-100 hover:bg-primary hover:text-white transition-all">Limpar Tudo</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white text-slate-900 overflow-hidden sticky top-32">
            <CardHeader className="bg-primary/5 p-8 border-b border-gray-100/50 text-center">
              <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">
                {editId ? "Editar Cadastro" : "Novo Cadastro"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col items-center gap-6">
                 <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                       {foto ? <img src={foto} alt="Preview" className="w-full h-full object-cover" /> : <Users className="w-12 h-12 text-gray-200" />}
                    </div>
                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]">
                       <Upload className="text-white w-6 h-6" />
                       <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                    </label>
                 </div>
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Foto do Perfil</Label>
                 <p className="text-[9px] text-gray-400 font-bold">400×400px · JPG ou PNG</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Artístico</Label>
                  <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Robson Silva" className="h-12 rounded-xl border-gray-100 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bio / Descrição</Label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Fale um pouco sobre o locutor..." rows={3} className="rounded-xl border-gray-100 font-medium" />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-primary font-black uppercase tracking-widest text-[10px] shadow-lg shadow-yellow-400/20" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {editId ? "Atualizar Perfil" : "Cadastrar Agora"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {locutores.map(loc => (
                <Card key={loc.id} className="group rounded-[2.5rem] border-none shadow-md hover:shadow-2xl transition-all duration-500 bg-white text-slate-900 overflow-hidden p-8 flex flex-col items-center text-center">
                   <div className="relative mb-6">
                      <div className="w-24 h-24 rounded-[2rem] bg-gray-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                         {loc.foto ? <img src={loc.foto} alt={loc.nome} className="w-full h-full object-cover" /> : <div className="text-3xl font-black text-primary/20">{loc.nome.charAt(0)}</div>}
                      </div>
                   </div>
                   <div className="flex-1 space-y-2 mb-8">
                      <h3 className="text-lg font-black text-primary uppercase tracking-tight italic">{loc.nome}</h3>
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-2 leading-relaxed h-10">{loc.bio || "Este locutor ainda não possui uma biografia cadastrada."}</p>
                   </div>
                   <div className="flex gap-2 w-full pt-6 border-t border-gray-50">
                      <Button variant="ghost" className="flex-1 h-10 border border-transparent hover:bg-gray-50 hover:text-primary font-black uppercase text-[9px]" onClick={() => handleEdit(loc)}>Editar</Button>
                      <Button variant="ghost" className="flex-1 h-10 text-red-400 hover:text-red-500 hover:bg-red-50 font-black uppercase text-[9px]" onClick={() => handleDelete(loc.id)}>Excluir</Button>
                   </div>
                </Card>
              ))}
              {locutores.length === 0 && (
                <div className="col-span-full py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
                   <Users className="w-16 h-16 mb-4 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum locutor encontrado</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLocutores;
