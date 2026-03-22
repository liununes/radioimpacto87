import { useState, useEffect } from "react";
import { Trash2, Upload, Plus, Loader2, Edit2, Save, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Slide, getSlides, saveSlide, deleteSlide } from "@/lib/radioStore";
import { toast } from "sonner";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

const AdminSlides = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [titulo, setTitulo] = useState("");
  const [imagem, setImagem] = useState("");
  const [link, setLink] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSlides = async () => {
    const data = await getSlides();
    setSlides(data);
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleSave = async () => {
    if (!titulo.trim() || !imagem) {
      toast.error("Preencha o título e escolha uma imagem.");
      return;
    }
    setLoading(true);
    const { error } = await saveSlide({ 
      id: editId || undefined,
      titulo, 
      imagem,
      link: link || undefined
    });
    
    if (error) {
      toast.error("Erro ao salvar slide.");
    } else {
      toast.success(editId ? "Slide atualizado!" : "Slide adicionado!");
      fetchSlides();
      resetForm();
    }
    setLoading(false);
  };

  const handleEdit = (slide: Slide) => {
    setEditId(slide.id);
    setTitulo(slide.titulo);
    setImagem(slide.imagem);
    setLink(slide.link || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este slide?")) return;
    const { error } = await deleteSlide(id);
    if (error) {
      toast.error("Erro ao remover.");
    } else {
      toast.success("Slide removido!");
      fetchSlides();
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitulo("");
    setImagem("");
    setLink("");
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Banners & <span className="text-secondary italic">Slides</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Destaques visuais que aparecem no topo do site</p>
        </div>
        {!editId && (
          <div className="flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-2xl border border-primary/10">
            <Plus className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Novo Slide Ativo</span>
          </div>
        )}
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="p-10 pb-4">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">{editId ? "Editar Slide em Destaque" : "Cadastrar Novo Destaque"}</CardTitle>
        </CardHeader>
        <CardContent className="p-10 pt-4 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Título / Chamada Curta</Label>
              <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Grande Show de Prêmios Clube" className="h-14 rounded-2xl border-gray-100 bg-gray-50 text-xl font-bold text-primary" />
            </div>

            <div className="lg:col-span-4 space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Link de Destino (Opcional)</Label>
              <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold text-primary" />
            </div>
            
            <div className="lg:col-span-8">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700 block mb-4">Escolha a Imagem (Mínimo 1920x600 recomendado)</Label>
              <div className="relative group">
                <div className={`h-[300px] rounded-3xl overflow-hidden border-2 border-dashed ${imagem ? 'border-transparent' : 'border-gray-100'} bg-gray-50 flex items-center justify-center p-4 transition-all group-hover:bg-gray-100`}>
                   {imagem ? (
                     <img src={imagem} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                   ) : (
                     <div className="flex flex-col items-center gap-4">
                        <div className="p-6 bg-white rounded-full shadow-sm text-gray-200">
                           <Upload className="w-8 h-8" />
                        </div>
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Nenhuma imagem selecionada</p>
                     </div>
                   )}
                </div>
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                   <div className="h-12 px-8 bg-white text-primary rounded-xl flex items-center gap-3 font-black uppercase text-[10px] tracking-widest border-none shadow-xl">
                      <Upload className="w-4 h-4" /> Importar Foto
                   </div>
                   <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setImagem(await fileToBase64(f)); }} />
                </label>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-end space-y-4">
               <Button onClick={handleSave} className="h-16 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all w-full" disabled={loading}>
                 {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                 {editId ? "Confirmar Edição" : "Publicar Slide"}
               </Button>
               {editId && (
                 <Button variant="ghost" onClick={resetForm} className="h-14 rounded-2xl font-black uppercase text-[10px] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <X className="w-4 h-4 mr-2" /> Cancelar Edição
                 </Button>
               )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {slides.map(slide => (
          <Card key={slide.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white">
            <div className="aspect-[16/9] relative overflow-hidden">
               <img src={slide.imagem} alt={slide.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 gap-4">
                  <div className="flex gap-2">
                     <Button size="sm" className="flex-1 bg-white text-primary font-black uppercase text-[9px] tracking-widest h-10 rounded-lg" onClick={() => handleEdit(slide)}>
                        <Edit2 className="w-3 h-3 mr-2" /> Editar
                     </Button>
                     <Button size="icon" className="bg-red-500 text-white hover:bg-red-600 h-10 w-10 rounded-lg" onClick={() => handleDelete(slide.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                     </Button>
                  </div>
               </div>
            </div>
            <CardContent className="p-6">
               <h5 className="text-[11px] font-black text-primary uppercase tracking-widest truncate italic">{slide.titulo}</h5>
               <p className="text-[9px] font-bold text-gray-300 uppercase mt-1">Snapshot do Banner Ativo</p>
            </CardContent>
          </Card>
        ))}
        {slides.length === 0 && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
             <ImageIcon className="w-12 h-12 text-gray-200 mb-4" />
             <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Nenhum slide cadastrado no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSlides;
