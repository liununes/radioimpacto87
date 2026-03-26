import { useState, useEffect } from "react";
import { Trash2, Edit2, Save, X, Plus, Link, Loader2, ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { type Noticia, getNoticias, saveNoticia, deleteNoticia, getCategorias, saveCategorias } from "@/lib/noticiasStore";
import { toast } from "sonner";

const AdminNoticias = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [tab, setTab] = useState("Todas");
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState("");
  const [fonte, setFonte] = useState("");
  const [urlOriginal, setUrlOriginal] = useState("");
  const [destaque, setDestaque] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // URL scraping
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  // New category
  const [novaCategoria, setNovaCategoria] = useState("");

  const fetchData = async () => {
    const [newsData, cats] = await Promise.all([getNoticias(), getCategorias()]);
    setNoticias(newsData);
    
    const newsCats = newsData
      .map(n => n.categoria)
      .filter((c): c is string => !!c && !cats.includes(c));
    
    const allCats = Array.from(new Set([...cats, ...newsCats]));
    setCategorias(allCats);
    
    if (!categoria && allCats.length > 0) setCategoria(allCats[0]);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = !tab || tab === "Todas" ? noticias : noticias.filter(n => n.categoria === tab);

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
      
      toast.success("Dados importados!");
    } catch (err: any) {
      toast.error("Erro ao importar notícia.");
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
      categoria: categoria || (tab !== "Todas" ? tab : categorias[0]),
      imagem,
      fonte,
      url: urlOriginal,
      destaque
    });

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success(editId ? "Notícia atualizada!" : "Notícia publicada!");
      await fetchData();
      resetForm();
    }
    setLoading(false);
  };

  const handleEdit = (n: Noticia) => {
    setEditId(n.id);
    setTitulo(n.titulo);
    setResumo(n.resumo);
    setConteudo(n.conteudo);
    setCategoria(n.categoria);
    setImagem(n.imagem || "");
    setFonte(n.fonte || "");
    setUrlOriginal(n.url || "");
    setDestaque(n.destaque || false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta notícia?")) return;
    const { error } = await deleteNoticia(id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
    } else {
      toast.success("Notícia removida!");
      await fetchData();
    }
  };

  const resetForm = () => {
    setEditId(null); setTitulo(""); setResumo(""); setConteudo(""); setImagem(""); setFonte(""); setUrlOriginal(""); setScrapeUrl(""); setDestaque(false);
  };

  const handleAddCategoria = async () => {
    const nome = novaCategoria.trim();
    if (!nome || categorias.includes(nome)) return;
    const updated = [...categorias, nome];
    await saveCategorias(updated);
    setCategorias(updated);
    setNovaCategoria("");
    toast.success("Categoria adicionada!");
  };

  const handleDeleteCategoria = async (cat: string) => {
    if (categorias.length <= 1) return;
    const updated = categorias.filter(c => c !== cat);
    await saveCategorias(updated);
    setCategorias(updated);
    if (tab === cat) setTab("Todas");
    toast.success("Categoria removida!");
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Portal de <span className="text-secondary italic">Notícias</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Gerencie o conteúdo informativo do seu site</p>
        </div>
        <div className="flex gap-4">
           <Button onClick={() => setTab("Todas")} variant={tab === "Todas" ? "default" : "outline"} className="rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-6">Todas</Button>
           {categorias.slice(0, 3).map(cat => (
             <Button key={cat} onClick={() => setTab(cat)} variant={tab === cat ? "default" : "outline"} className="rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-6">{cat}</Button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
             <CardHeader className="bg-primary/5 p-8 border-b border-gray-100/50">
               <CardTitle className="text-lg font-black uppercase tracking-tight text-primary flex items-center gap-3">
                 <Link className="w-5 h-5 text-secondary" /> Importação Inteligente
               </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
               <div className="flex gap-4">
                 <Input value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="https://exemplo.com/noticia..." className="flex-1 h-14 rounded-none border-gray-100 bg-gray-50 font-medium" />
                 <Button onClick={handleScrape} disabled={isScraping || !scrapeUrl.trim()} className="h-14 px-10 rounded-none bg-secondary hover:bg-secondary/90 text-primary font-black uppercase tracking-widest text-[10px]">
                   {isScraping ? <Loader2 className="w-5 h-5 animate-spin" /> : "Extrair Dados"}
                 </Button>
               </div>
             </CardContent>
           </Card>

           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
             <CardHeader className="p-8 border-b border-gray-50">
               <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">
                 {editId ? "Editando Publicação" : "Nova Publicação"}
               </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between p-6 bg-yellow-50/50 border border-yellow-100 rounded-none">
                   <div className="flex items-center gap-4">
                      <div className={`p-3 ${destaque ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400'} transition-all`}>
                         <Star className={`w-6 h-6 ${destaque ? 'fill-current' : ''}`} />
                      </div>
                      <div>
                         <p className="text-xs font-black uppercase text-primary">Destaque na Página Inicial</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Esta notícia será exibida com prioridade no topo</p>
                      </div>
                   </div>
                   <Switch checked={destaque} onCheckedChange={setDestaque} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Título da Notícia</Label>
                    <Input value={titulo} onChange={e => setTitulo(e.target.value)} className="h-12 rounded-none border-gray-100 shadow-sm" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Categoria</Label>
                    <select value={categoria} onChange={e => setCategoria(e.target.value)}
                      className="flex h-12 w-full rounded-none border border-gray-100 bg-background px-4 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Resumo de Chamada</Label>
                  <Textarea value={resumo} onChange={e => setResumo(e.target.value)} rows={2} className="rounded-none border-gray-100" />
                </div>

                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Conteúdo Detalhado</Label>
                   <Textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={10} className="rounded-none border-gray-100 p-6 font-medium leading-relaxed resize-y min-h-[200px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fonte</Label>
                    <Input value={fonte} onChange={e => setFonte(e.target.value)} className="h-12 rounded-none border-gray-100" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">URL da Imagem</Label>
                    <Input value={imagem} onChange={e => setImagem(e.target.value)} className="h-12 rounded-none border-gray-100" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSave} className="h-14 px-12 rounded-none bg-primary hover:bg-primary/95 text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {editId ? "Atualizar" : "Publicar"}
                  </Button>
                  {editId && (
                    <Button variant="ghost" onClick={resetForm} className="h-14 px-8 rounded-none font-black uppercase text-[10px] tracking-widest text-gray-400">
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
             <CardHeader className="p-8 pb-4">
               <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">Categorias</CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-4 space-y-8">
               <div className="flex flex-wrap gap-2">
                 {categorias.map(cat => (
                   <div key={cat} className="group flex items-center gap-2 bg-gray-50 px-4 py-2 border border-gray-100">
                     <span className="text-[11px] font-bold text-primary uppercase">{cat}</span>
                     <button onClick={() => handleDeleteCategoria(cat)} className="text-gray-300 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                   </div>
                 ))}
               </div>
               <div className="pt-6 border-t border-gray-50 flex flex-col gap-3">
                 <Input value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} placeholder="NOVA CATEGORIA..." className="h-12 rounded-none border-gray-100 uppercase" />
                 <Button onClick={handleAddCategoria} className="h-12 rounded-none bg-gray-100 text-primary font-black uppercase text-[10px]">Adicionar</Button>
               </div>
             </CardContent>
           </Card>

           <div className="space-y-4">
             {filtered.map(n => (
               <Card key={n.id} className="group rounded-none border-none shadow-md overflow-hidden bg-white text-slate-900 hover:shadow-xl transition-all">
                 <CardContent className="p-4 flex gap-4">
                   <div className="w-16 h-16 rounded-none overflow-hidden bg-gray-100 shrink-0 relative">
                     <img src={n.imagem || ""} alt={n.titulo} className="w-full h-full object-cover" />
                     {n.destaque && <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center"><Star className="w-4 h-4 text-yellow-500 fill-current" /></div>}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h5 className="font-black text-xs text-primary uppercase line-clamp-1 italic">{n.titulo}</h5>
                     <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => handleEdit(n)} className="text-[9px] font-black uppercase text-primary hover:underline">Editar</button>
                        <button onClick={() => handleDelete(n.id)} className="text-[9px] font-black uppercase text-red-500 hover:underline">Excluir</button>
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

export default AdminNoticias;
