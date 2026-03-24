import { useState, useEffect } from "react";
import { Upload, Trash2, Copy, Search, Grid, List as ListIcon, HardDrive, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFotos, deleteFoto, saveFoto, type Foto } from "@/lib/radioStore";
import { toast } from "sonner";

const AdminMedia = () => {
  const [media, setMedia] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageDesc, setNewImageDesc] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const data = await getFotos();
    setMedia(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async () => {
    if (!newImageUrl.trim()) return;
    setUploading(true);
    const { error } = await saveFoto({ imagem: newImageUrl, descricao: newImageDesc });
    if (error) {
      toast.error("Erro ao salvar arquivo.");
    } else {
      toast.success("Mídia adicionada à biblioteca!");
      setNewImageUrl("");
      setNewImageDesc("");
      fetchData();
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover permanentemente?")) return;
    const { error } = await deleteFoto(id);
    if (!error) {
      toast.success("Mídia removida.");
      fetchData();
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const filtered = media.filter(m => 
    m.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.imagem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm gap-6">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none flex items-center gap-3">
             <HardDrive className="w-8 h-8 text-secondary" /> Biblioteca de <span className="text-secondary italic">Mídia</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Repositório central de imagens e ativos</p>
        </div>
        <div className="flex gap-2 w-full md:w-max">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="BUSCAR ARQUIVO..." 
                className="h-12 pl-10 rounded-none border-gray-100 bg-gray-50 font-bold text-[10px] uppercase tracking-widest"
              />
           </div>
           <Button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} 
            variant="outline" 
            className="h-12 w-12 p-0 rounded-none"
           >
              {viewMode === 'grid' ? <ListIcon className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden sticky top-24">
              <CardHeader className="bg-primary/5 p-8 border-b border-gray-100">
                 <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-primary">Novo Upload</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">URL da Imagem</label>
                    <Input 
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      placeholder="https://..." 
                      className="h-12 rounded-none border-gray-100 bg-gray-50"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome/Descrição</label>
                    <Input 
                      value={newImageDesc}
                      onChange={e => setNewImageDesc(e.target.value)}
                      placeholder="NOME DO ARQUIVO..." 
                      className="h-12 rounded-none border-gray-100 bg-gray-50"
                    />
                 </div>
                 <Button 
                   onClick={handleUpload} 
                   disabled={uploading || !newImageUrl}
                   className="w-full h-14 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-none shadow-lg shadow-blue-900/10"
                 >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 mr-3" />}
                    Adicionar à Galeria
                 </Button>
                 
                 {newImageUrl && (
                   <div className="mt-6 aspect-video rounded-none border-4 border-gray-50 bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img src={newImageUrl} alt="Preview" className="max-h-full object-contain" />
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-8">
           {loading ? (
             <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
             </div>
           ) : filtered.length === 0 ? (
             <div className="bg-white p-20 text-center border border-dashed border-gray-200">
                <ImageIcon className="w-20 h-20 text-gray-100 mx-auto mb-6" />
                <h3 className="text-xl font-black text-primary uppercase tracking-tighter">Nenhum arquivo encontrado</h3>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2">Comece adicionando novos links ou fazendo upload.</p>
             </div>
           ) : (
             <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 gap-6" : "space-y-4"}>
                {filtered.map(item => (
                   <div key={item.id} className={`group relative bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden ${viewMode === 'list' ? 'flex items-center p-4 gap-6' : ''}`}>
                      <div className={viewMode === 'grid' ? "aspect-square overflow-hidden bg-gray-50" : "w-20 h-20 shrink-0 overflow-hidden bg-gray-50"}>
                         <img src={item.imagem} alt={item.descricao} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      
                      <div className={`p-4 ${viewMode === 'list' ? 'flex-1 p-0' : 'space-y-2'}`}>
                         <h4 className="text-[11px] font-black uppercase text-primary tracking-tighter line-clamp-1 italic">{item.descricao || "Arquivo sem título"}</h4>
                         <p className="text-[9px] text-gray-300 font-medium truncate">{item.imagem}</p>
                         
                         <div className="flex gap-2 pt-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:text-primary hover:bg-gray-50"
                              onClick={() => copyUrl(item.imagem)}
                            >
                               <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:text-red-500 hover:bg-red-50"
                              onClick={() => handleDelete(item.id)}
                            >
                               <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                         </div>
                      </div>

                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-white/90 backdrop-blur-sm px-2 py-1 text-[8px] font-black text-primary uppercase shadow-md">Selecione</div>
                      </div>
                   </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminMedia;
