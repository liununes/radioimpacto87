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
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Biblioteca de Mídia</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Repositório central de imagens e ativos.</p>
        </div>
        <div className="flex gap-4 w-full md:w-max">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar arquivo..." 
                className="h-11 pl-10 rounded-lg"
              />
           </div>
           <Button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} 
            variant="outline" 
            className="h-11 w-11 p-0 rounded-lg shrink-0 shadow-sm"
           >
              {viewMode === 'grid' ? <ListIcon className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
           <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden sticky top-24">
              <CardHeader className="p-6 border-b border-border/50">
                 <CardTitle className="text-base font-bold text-foreground">Novo Upload</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">URL da Imagem</label>
                    <Input 
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      placeholder="https://..." 
                      className="h-11 rounded-lg"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Nome/Descrição</label>
                    <Input 
                      value={newImageDesc}
                      onChange={e => setNewImageDesc(e.target.value)}
                      placeholder="Nome do arquivo..." 
                      className="h-11 rounded-lg"
                    />
                 </div>
                 <Button 
                   onClick={handleUpload} 
                   disabled={uploading || !newImageUrl}
                   className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm"
                 >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Adicionar à Galeria
                 </Button>
                 
                 {newImageUrl && (
                   <div className="mt-4 aspect-video rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
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
             <Card className="border-dashed border-2 border-border p-16 flex flex-col items-center justify-center bg-muted/30 rounded-xl text-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold text-foreground">Nenhum arquivo encontrado</h3>
                <p className="text-sm font-medium text-muted-foreground mt-1">Comece adicionando novos links ou fazendo upload.</p>
             </Card>
           ) : (
             <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {filtered.map(item => (
                   <Card key={item.id} className={`group relative bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden ${viewMode === 'list' ? 'flex flex-row p-4 gap-4 items-center' : 'flex flex-col'}`}>
                      <div className={viewMode === 'grid' ? "aspect-square w-full bg-muted overflow-hidden relative" : "w-16 h-16 shrink-0 bg-muted overflow-hidden rounded-lg relative"}>
                         <img src={item.imagem} alt={item.descricao} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         {viewMode === 'grid' && (
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => copyUrl(item.imagem)}>
                               <Copy className="w-4 h-4" />
                             </Button>
                             <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleDelete(item.id)}>
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </div>
                         )}
                      </div>
                      
                      <div className={`p-4 flex-1 min-w-0 ${viewMode === 'list' ? 'p-0' : ''}`}>
                         <h4 className="text-sm font-bold text-foreground truncate">{item.descricao || "Arquivo sem título"}</h4>
                         <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">{item.imagem}</p>
                         
                         {viewMode === 'list' && (
                           <div className="flex gap-2 mt-2">
                              <Button variant="outline" size="sm" className="h-7 text-xs px-3 rounded-lg" onClick={() => copyUrl(item.imagem)}>
                                 <Copy className="w-3 h-3 mr-1" /> Copiar
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs px-3 rounded-lg text-destructive hover:bg-destructive/10 border-transparent hover:border-destructive/20" onClick={() => handleDelete(item.id)}>
                                 <Trash2 className="w-3 h-3 mr-1" /> Remover
                              </Button>
                           </div>
                         )}
                      </div>
                   </Card>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminMedia;
