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
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Galeria de <span className="text-secondary italic">Momentos</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Publique fotos de eventos e vips da rádio</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-none border border-primary/10">
          <ImageIcon className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">{fotos.length} Fotos Ativas</span>
        </div>
      </div>

      <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
        <CardHeader className="p-10 pb-4">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">Upload de Imagens</CardTitle>
        </CardHeader>
        <CardContent className="p-10 pt-4 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Descrição Geral (Opcional)</Label>
                 <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Show de aniversário..." className="h-14 rounded-none border-gray-100 bg-gray-50 font-bold text-primary" />
               </div>

               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seleção de Arquivos</Label>
                 <label className="flex flex-col items-center justify-center gap-4 h-40 border-2 border-dashed border-gray-100 rounded-none bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 hover:border-primary/20 transition-all">
                    <Upload className="w-8 h-8 text-primary/30" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Clique ou arraste múltiplas fotos</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFilesChange} />
                 </label>
                 <p className="text-[9px] text-gray-400 font-bold text-center mt-2">800×600px · JPG, PNG ou WebP · Máx. 2MB cada</p>
               </div>
            </div>

             <div className="space-y-6">
               <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Preview para Postagem ({imagens.length})</Label>
               <div className="min-h-[220px] bg-gray-50/50 rounded-none p-6 border border-gray-100">
                  {imagens.length > 0 ? (
                    <div className="grid grid-cols-4 gap-4">
                      {imagens.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-none overflow-hidden shadow-sm border border-white">
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removePreview(idx)}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest">Remover</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-200">
                       <span className="text-[9px] font-black uppercase tracking-widest">Nenhuma foto selecionada</span>
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50">
             <Button onClick={handleAdd} className="h-16 px-12 rounded-none bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50" disabled={imagens.length === 0 || loading}>
               {loading ? <Plus className="w-5 h-5 animate-spin mr-3" /> : <Plus className="w-5 h-5 mr-3" />}
               {loading ? "Processando..." : `Publicar ${imagens.length} ${imagens.length === 1 ? 'Foto' : 'Fotos'} agora`}
             </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
         {fotos.map(foto => (
          <div key={foto.id} className="group relative rounded-none overflow-hidden bg-white text-slate-900 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="aspect-square relative overflow-hidden">
               <img src={foto.imagem} alt={foto.descricao} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Button size="icon" variant="ghost" className="h-12 w-12 bg-white text-slate-900 text-destructive rounded-none shadow-xl hover:scale-110" onClick={() => handleDelete(foto.id)}>
                   <Trash2 className="w-5 h-5" />
                 </Button>
               </div>
            </div>
            {foto.descricao && (
              <div className="p-4 border-t border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{foto.descricao}</p>
              </div>
            )}
          </div>
        ))}
        {fotos.length === 0 && (
           <div className="col-span-full h-64 flex flex-col items-center justify-center bg-gray-50/50 rounded-none border-2 border-dashed border-gray-100">
              <ImageIcon className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest">A galeria está vazia.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminFotos;
