import { useState, useEffect } from "react";
import { Trash2, Upload, Plus, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Foto, getFotos, saveFoto, deleteFoto } from "@/lib/radioStore";
import { toast } from "sonner";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

const AdminFotos = () => {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [descricao, setDescricao] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFotos = async () => {
    const data = await getFotos();
    setFotos(data);
  };

  useEffect(() => { fetchFotos(); }, []);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const bases: string[] = [];
    for (let i = 0; i < files.length; i++) {
      bases.push(await fileToBase64(files[i]));
    }
    setImagens(prev => [...prev, ...bases]);
  };

  const handleAdd = async () => {
    if (imagens.length === 0) return;
    setLoading(true);
    
    try {
      for (const img of imagens) {
        await saveFoto({
          descricao,
          imagem: img,
        });
      }
      toast.success(`${imagens.length} foto(s) adicionada(s)!`);
      await fetchFotos();
      setDescricao("");
      setImagens([]);
    } catch (error) {
      toast.error("Erro ao salvar fotos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta foto?")) return;
    const { error } = await deleteFoto(id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
    } else {
      toast.success("Foto removida!");
      await fetchFotos();
    }
  };

  const removePreview = (idx: number) => {
    setImagens(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Galeria de Fotos</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Publique fotos de eventos e shows da rádio.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg text-primary text-sm font-semibold">
          <ImageIcon className="w-5 h-5" />
          <span>{fotos.length} Fotos Ativas</span>
        </div>
      </div>

      <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-border/50">
          <CardTitle className="text-lg font-bold">Upload de Imagens</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="space-y-2">
                 <Label className="text-sm font-semibold">Descrição Geral (Opcional)</Label>
                 <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Show de aniversário..." className="h-11 rounded-lg" />
               </div>

               <div className="space-y-2">
                 <Label className="text-sm font-semibold">Seleção de Arquivos</Label>
                 <label className="flex flex-col items-center justify-center gap-3 h-32 border-2 border-dashed border-border rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all">
                    <Upload className="w-8 h-8 text-muted-foreground/60" />
                    <span className="text-sm font-medium text-muted-foreground">Clique ou arraste múltiplas fotos</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFilesChange} />
                 </label>
                 <p className="text-xs text-muted-foreground font-medium text-center mt-2">JPG, PNG ou WebP (Máx. 2MB cada)</p>
               </div>
            </div>

            <div className="space-y-4">
               <Label className="text-sm font-semibold">Preview para Postagem ({imagens.length})</Label>
               <div className="min-h-[160px] bg-muted/20 rounded-xl p-4 border border-border">
                  {imagens.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {imagens.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden shadow-sm border border-border">
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removePreview(idx)}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="text-xs font-bold">Remover</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full min-h-[140px] flex items-center justify-center text-muted-foreground">
                       <span className="text-sm font-medium">Nenhuma foto selecionada</span>
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/50">
             <Button onClick={handleAdd} className="w-full sm:w-auto h-11 px-8 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm transition-all disabled:opacity-50" disabled={imagens.length === 0 || loading}>
               {loading ? <Plus className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
               {loading ? "Processando..." : `Publicar ${imagens.length} ${imagens.length === 1 ? 'Foto' : 'Fotos'}`}
             </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
         {fotos.map(foto => (
          <div key={foto.id} className="group relative rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm border border-border hover:shadow-md transition-shadow">
            <div className="aspect-square relative overflow-hidden bg-muted">
               <img src={foto.imagem} alt={foto.descricao} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full shadow-lg hover:scale-105 transition-transform" onClick={() => handleDelete(foto.id)}>
                   <Trash2 className="w-4 h-4" />
                 </Button>
               </div>
            </div>
            {foto.descricao && (
              <div className="p-3 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground line-clamp-1 truncate" title={foto.descricao}>{foto.descricao}</p>
              </div>
            )}
          </div>
        ))}
        {fotos.length === 0 && (
           <div className="col-span-full h-48 flex flex-col items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed border-border">
              <ImageIcon className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">A galeria está vazia.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminFotos;
