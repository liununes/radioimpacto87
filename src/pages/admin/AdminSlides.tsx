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
  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Banners & Slides</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Gerencie os destaques visuais que aparecem no topo do site.</p>
        </div>
        {!editId && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg text-primary text-sm font-semibold">
            <Plus className="w-4 h-4" />
            <span>Novo Cadastro Ativo</span>
          </div>
        )}
      </div>

      <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-border/50">
          <CardTitle className="text-lg font-bold">{editId ? "Editar Slide em Destaque" : "Cadastrar Novo Destaque"}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-2">
              <Label className="text-sm font-semibold">Título / Chamada Curta</Label>
              <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Grande Show de Prêmios Clube" className="h-11 rounded-lg text-base" />
            </div>

            <div className="lg:col-span-4 space-y-2">
              <Label className="text-sm font-semibold">Link de Destino (Opcional)</Label>
              <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="h-11 rounded-lg" />
            </div>
            
            <div className="lg:col-span-8 space-y-3">
              <div>
                <Label className="text-sm font-semibold block">Escolha a Imagem</Label>
                <p className="text-xs text-muted-foreground font-medium mt-1 mb-3">Recomendado: 1920x600 pixels (JPG, PNG ou WebP)</p>
              </div>
              
              <div className="relative group rounded-xl overflow-hidden border-2 border-dashed bg-muted border-border hover:border-primary/50 hover:bg-muted/80 transition-colors flex flex-col items-center justify-center p-4 min-h-[220px]">
                 {imagem ? (
                   <div className="relative w-full h-[200px] rounded-lg overflow-hidden border border-border shadow-sm">
                     <img src={imagem} alt="Preview" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-background text-foreground hover:bg-muted font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
                           <Upload className="w-4 h-4" /> Trocar Imagem
                           <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setImagem(await fileToBase64(f)); }} />
                        </label>
                     </div>
                   </div>
                 ) : (
                   <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full min-h-[180px] text-muted-foreground">
                      <div className="p-4 bg-background border border-border rounded-full shadow-sm mb-3">
                         <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold">Clique para importar foto</span>
                      <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setImagem(await fileToBase64(f)); }} />
                   </label>
                 )}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-end gap-3">
               <Button onClick={handleSave} className="h-11 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm w-full transition-all" disabled={loading}>
                 {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                 {editId ? "Confirmar Edição" : "Publicar Slide"}
               </Button>
               {editId && (
                 <Button variant="outline" onClick={resetForm} className="h-11 rounded-lg font-semibold text-muted-foreground transition-all">
                    <X className="w-4 h-4 mr-2" /> Cancelar Edição
                 </Button>
               )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {slides.map(slide => (
          <Card key={slide.id} className="group overflow-hidden rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow bg-card">
            <div className="aspect-[21/9] relative overflow-hidden bg-muted">
               <img src={slide.imagem} alt={slide.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full shadow-sm" onClick={() => handleEdit(slide)}>
                     <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-9 w-9 rounded-full shadow-sm" onClick={() => handleDelete(slide.id)}>
                     <Trash2 className="w-4 h-4" />
                  </Button>
               </div>
            </div>
            <CardContent className="p-4">
               <h5 className="text-sm font-bold text-foreground truncate">{slide.titulo}</h5>
               <p className="text-xs font-semibold text-muted-foreground mt-1">Snapshot banner ativo</p>
            </CardContent>
          </Card>
        ))}
        {slides.length === 0 && (
          <div className="col-span-full h-48 flex flex-col items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed border-border">
             <ImageIcon className="w-10 h-10 text-muted-foreground/30 mb-3" />
             <p className="text-sm font-medium text-muted-foreground">Nenhum slide cadastrado no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
  );
};

export default AdminSlides;
