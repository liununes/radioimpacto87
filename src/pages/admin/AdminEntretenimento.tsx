import { useState, useEffect } from "react";
import { Trash2, Edit2, Save, X, Plus, Link, Loader2, ExternalLink, Star, Radio, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { type Noticia, getNoticias, saveNoticia, deleteNoticia } from "@/lib/noticiasStore";
import { toast } from "sonner";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const AdminEntretenimento = () => {
  const CATEGORIA_FIXA = "Entretenimento";
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagem, setImagem] = useState("");
  const [fonte, setFonte] = useState("");
  const [urlOriginal, setUrlOriginal] = useState("");
  const [destaque, setDestaque] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // URL scraping
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  const fetchData = async () => {
    const newsData = await getNoticias();
    setNoticias(newsData.filter(n => n.categoria === CATEGORIA_FIXA));
  };

  useEffect(() => { fetchData(); }, []);

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return;
    setIsScraping(true);
    try {
      const targetUrl = scrapeUrl.trim().startsWith('http') ? scrapeUrl.trim() : `https://${scrapeUrl.trim()}`;
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&palette=true&audio=true&video=true&iframe=true`);
      const res = await response.json();
      
      if (res.status !== 'success') throw new Error(res.message || "Não foi possível extrair dados.");
      
      const data = res.data;
      setTitulo(data.title || "");
      setResumo(data.description || "");
      setConteudo(data.description || ""); 
      setImagem(data.image?.url || data.logo?.url || "");
      setFonte(data.publisher || new URL(targetUrl).hostname.replace('www.', ''));
      setUrlOriginal(data.url || targetUrl);
      
      toast.success("Dados de entretenimento importados!");
    } catch (err: any) {
      toast.error("Erro ao importar.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSave = async () => {
    if (!titulo.trim() || !resumo.trim()) { toast.error("Título e resumo são obrigatórios!"); return; }
    
    setLoading(true);
    const { error } = await saveNoticia({
      id: editId || undefined,
      titulo,
      resumo,
      conteudo,
      categoria: CATEGORIA_FIXA,
      imagem,
      fonte,
      url: urlOriginal,
      destaque
    });

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success(editId ? "Publicação atualizada!" : "Publicação de Entretenimento ativa!");
      await fetchData();
      resetForm();
    }
    setLoading(false);
  };

  const insertExamples = async () => {
    setLoading(true);
    const examples = [
      {
        titulo: "Os segredos por trás do sucesso das rádio novelas modernas",
        resumo: "Entenda por que o formato de áudio está voltando com tudo nas plataformas digitais...",
        conteudo: "Conteúdo completo...",
        imagem: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80",
        categoria: CATEGORIA_FIXA,
        fonte: "Cultura Pop",
        destaque: true
      },
      {
        titulo: "Lançamento da Semana: Hit que não sai da cabeça!",
        resumo: "Conheça o novo sucesso que já é o mais pedido na programação da FM.",
        conteudo: "Análise completa...",
        imagem: "https://images.unsplash.com/photo-1514525253361-b83f8b91272d?auto=format&fit=crop&w=400&q=80",
        categoria: CATEGORIA_FIXA,
        fonte: "Billboard Brasil"
      }
    ];

    for (const ex of examples) {
      await saveNoticia(ex);
    }
    
    toast.success("Exemplos gerados com sucesso!");
    await fetchData();
    setLoading(false);
  };

  const handleEdit = (n: Noticia) => {
    setEditId(n.id);
    setTitulo(n.titulo);
    setResumo(n.resumo);
    setConteudo(n.conteudo);
    setImagem(n.imagem || "");
    setFonte(n.fonte || "");
    setUrlOriginal(n.url || "");
    setDestaque(n.destaque || false);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir?")) return;
    const { error } = await deleteNoticia(id);
    if (!error) {
      toast.success("Removido!");
      await fetchData();
    }
  };

  const resetForm = () => {
    setEditId(null); setTitulo(""); setResumo(""); setConteudo(""); setImagem(""); setFonte(""); setUrlOriginal(""); setScrapeUrl(""); setDestaque(false);
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
              <Radio className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-2xl font-bold tracking-tight">Canal de Entretenimento</h2>
              <p className="text-sm font-medium text-muted-foreground mt-1">Vídeos, curiosidades e estilo de vida da rádio.</p>
           </div>
        </div>
        <div className="flex gap-4">
           {noticias.length === 0 && (
             <Button onClick={insertExamples} disabled={loading} variant="outline" className="rounded-lg font-semibold text-sm h-10 px-4">
                Gerar Conteúdo de Exemplo
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden">
             <CardHeader className="p-6 pb-4 border-b border-border/50">
               <CardTitle className="text-lg font-bold flex items-center gap-2">
                 <Link className="w-5 h-5 text-muted-foreground" /> Importar de Fonte Externa
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
               <div className="flex flex-col sm:flex-row gap-3">
                 <Input value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="Link do vídeo ou matéria..." className="flex-1 h-11 rounded-lg" />
                 <Button onClick={handleScrape} disabled={isScraping || !scrapeUrl.trim()} className="h-11 px-8 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold shadow-sm">
                   {isScraping ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link className="w-4 h-4 mr-2" />}
                   {isScraping ? "Capturando..." : "Importar Dados"}
                 </Button>
               </div>
             </CardContent>
           </Card>

           <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden">
             <CardHeader className="p-6 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
               <CardTitle className="text-lg font-bold">
                 {editId ? "Editar Conteúdo" : "Nova Publicação"}
               </CardTitle>
               <Button onClick={resetForm} variant="ghost" className="text-sm font-semibold text-muted-foreground rounded-lg h-9 px-3">
                  <Plus className="w-4 h-4 mr-2" /> Novo Post
               </Button>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${destaque ? 'bg-yellow-500/10 text-yellow-600' : 'bg-muted text-muted-foreground'} transition-colors`}>
                         <Star className={`w-5 h-5 ${destaque ? 'fill-current' : ''}`} />
                      </div>
                      <div>
                         <p className="text-sm font-semibold text-foreground">Definir como Destaque</p>
                         <p className="text-xs text-muted-foreground">Exibir em evidência na home</p>
                      </div>
                   </div>
                   <Switch checked={destaque} onCheckedChange={setDestaque} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Título da Publicação</Label>
                  <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Melhores momentos do show..." className="h-11 rounded-lg" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Resumo / Linha Fina</Label>
                  <Textarea value={resumo} onChange={e => setResumo(e.target.value)} rows={2} placeholder="Um resumo curto do assunto..." className="rounded-lg resize-none" />
                </div>

                <div className="space-y-2">
                   <Label className="text-sm font-semibold">Conteúdo Completo</Label>
                   <Textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={6} placeholder="Digite o conteúdo aqui..." className="rounded-lg resize-y p-3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Fonte (Opcional)</Label>
                    <Input value={fonte} onChange={e => setFonte(e.target.value)} placeholder="Ex: YouTube, Portal G1..." className="h-11 rounded-lg" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Imagem de Capa</Label>
                    <div className="flex items-center gap-2">
                       <Input value={imagem} onChange={e => setImagem(e.target.value)} placeholder="URL da imagem ou botão ao lado" className="h-11 rounded-lg flex-1" />
                       <label className="h-11 w-11 flex items-center justify-center bg-muted border border-border rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                          <Upload className="w-4 h-4 text-muted-foreground" />
                          <input type="file" className="hidden" accept="image/*" onChange={async e => {
                            const f = e.target.files?.[0];
                            if (f) setImagem(await fileToBase64(f));
                          }} />
                       </label>
                    </div>
                  </div>
                </div>

                {imagem && (
                  <div className="p-4 bg-muted/20 border border-border rounded-xl relative flex justify-center">
                     <div className="relative inline-block">
                       <img src={imagem} alt="Preview" className="max-h-40 w-auto object-cover rounded-lg shadow-sm" />
                       <button onClick={() => setImagem("")} className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 text-muted-foreground hover:text-red-500 shadow-sm transition-colors">
                          <X className="w-4 h-4" />
                       </button>
                     </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border/50">
                  <Button onClick={handleSave} className="w-full sm:w-auto h-11 px-8 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm transition-all" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {editId ? "Salvar Alterações" : "Publicar Conteúdo"}
                  </Button>
                </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
           <h4 className="text-sm font-semibold text-muted-foreground px-1">Ativas ({noticias.length})</h4>
           <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
             {noticias.length === 0 && (
               <div className="p-8 text-center bg-muted/30 border-2 border-dashed border-border rounded-xl">
                 <p className="text-sm font-medium text-muted-foreground">Nenhuma publicação ainda.</p>
               </div>
             )}
             {noticias.map(n => (
               <Card key={n.id} className="rounded-xl border border-border shadow-sm overflow-hidden bg-card hover:shadow-md transition-shadow group">
                 <CardContent className="p-3 flex gap-3">
                   <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0 relative">
                     {n.imagem ? (
                        <img src={n.imagem} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-muted-foreground/30" /></div>
                     )}
                     {n.destaque && (
                       <div className="absolute top-1 right-1 bg-yellow-500 rounded-full p-1 shadow-sm">
                         <Star className="w-3 h-3 text-white fill-current" />
                       </div>
                     )}
                   </div>
                   <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                     <h5 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight" title={n.titulo}>{n.titulo}</h5>
                     <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => handleEdit(n)}><Edit2 className="w-3 h-3 mr-1" /> Editar</Button>
                        <Button variant="ghost" className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(n.id)}><Trash2 className="w-3 h-3 mr-1" /> Excluir</Button>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEntretenimento;
