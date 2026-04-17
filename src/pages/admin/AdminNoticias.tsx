import { useState, useEffect } from "react";
import { Trash2, Edit2, Save, X, Plus, Link, Loader2, ExternalLink, Star, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { type Noticia, getNoticias, saveNoticia, deleteNoticia, getCategorias, saveCategorias } from "@/lib/noticiasStore";
import { toast } from "sonner";

import { useSearchParams } from "react-router-dom";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const AdminNoticias = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "lista";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [filterTab, setFilterTab] = useState("Todas");
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

  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
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

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const onTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const filtered = !filterTab || filterTab === "Todas" ? noticias : noticias.filter(n => n.categoria === filterTab);

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
      setActiveTab("nova");
      setSearchParams({ tab: "nova" });
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
      titulo, resumo, conteudo,
      categoria: categoria || (filterTab !== "Todas" ? filterTab : categorias[0]),
      imagem, fonte, url: urlOriginal, destaque
    });
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success(editId ? "Notícia atualizada!" : "Notícia publicada!");
      await fetchData();
      resetForm();
      setActiveTab("lista");
      setSearchParams({ tab: "lista" });
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
    setActiveTab("nova");
    setSearchParams({ tab: "nova" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta notícia?")) return;
    const { error } = await deleteNoticia(id);
    if (error) { toast.error("Erro ao excluir: " + error.message); }
    else { toast.success("Notícia removida!"); await fetchData(); }
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
    if (filterTab === cat) setFilterTab("Todas");
    toast.success("Categoria removida!");
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portal de Notícias</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Gerencie o conteúdo informativo da rádio.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           {!editId && activeTab === "lista" && (
             <>
                <Button onClick={() => setFilterTab("Todas")} variant={filterTab === "Todas" ? "default" : "outline"} className="rounded-lg font-semibold text-xs h-9 px-4">Todas</Button>
                {categorias.slice(0, 3).map(cat => (
                  <Button key={cat} onClick={() => setFilterTab(cat)} variant={filterTab === cat ? "default" : "outline"} className="rounded-lg font-semibold text-xs h-9 px-4">{cat}</Button>
                ))}
             </>
           )}
           <Button onClick={() => onTabChange("nova")} className="rounded-lg bg-primary text-primary-foreground font-semibold text-sm h-11 px-6 shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> {editId ? "Editando..." : "Nova Postagem"}
           </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
        <div className="flex overflow-x-auto pb-2 custom-scrollbar">
          <TabsList className="bg-muted p-1 rounded-xl h-auto">
            <TabsTrigger value="lista" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-semibold text-sm">Gerenciar Lista</TabsTrigger>
            <TabsTrigger value="nova" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-semibold text-sm">Publicar Notícia</TabsTrigger>
            <TabsTrigger value="categorias" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-semibold text-sm">Categorias</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="lista" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(n => (
                <Card key={n.id} className="group rounded-xl border border-border shadow-sm overflow-hidden bg-card text-card-foreground hover:shadow-md transition-shadow">
                  <div className="h-48 bg-muted overflow-hidden relative">
                    <img src={n.imagem || ""} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm border border-border/50">{n.categoria}</div>
                    {n.destaque && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-white p-1.5 rounded-full shadow-md">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex flex-col h-[180px]">
                    <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight flex-none">{n.titulo}</h3>
                    <p className="text-sm text-muted-foreground font-medium line-clamp-2 mt-2 flex-grow">{n.resumo}</p>
                    <div className="flex gap-2 pt-4 border-t border-border/50 mt-auto">
                       <Button variant="ghost" onClick={() => handleEdit(n)} className="flex-1 rounded-lg text-muted-foreground font-semibold text-xs h-9 hover:bg-muted hover:text-foreground">Editar</Button>
                       <Button variant="ghost" onClick={() => handleDelete(n.id)} className="flex-1 rounded-lg text-muted-foreground font-semibold text-xs h-9 hover:bg-red-50 hover:text-red-500">Excluir</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full h-64 flex flex-col items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed border-border text-muted-foreground">
                   <Plus className="w-12 h-12 mb-3 opacity-20" />
                   <h4 className="text-sm font-semibold">Nenhuma notícia encontrada</h4>
                </div>
              )}
           </div>
        </TabsContent>

        <TabsContent value="nova" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground">
             <CardHeader className="p-6 border-b border-border/50">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                   <Edit2 className="w-5 h-5 text-muted-foreground" /> {editId ? "Editar Publicação" : "Nova Publicação"}
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-8">
                <div className="bg-muted/30 p-4 border border-border rounded-xl flex flex-col sm:flex-row items-center gap-4">
                   <Link className="w-6 h-6 text-muted-foreground hidden sm:block" />
                   <Input value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="Importar de uma URL externa..." className="flex-1 h-11 rounded-lg" />
                   <Button onClick={handleScrape} disabled={isScraping || !scrapeUrl.trim()} className="h-11 px-6 w-full sm:w-auto rounded-lg bg-secondary text-secondary-foreground font-semibold shadow-sm">
                      {isScraping ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Importar"}
                   </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-xl">
                   <div className="flex items-center gap-3">
                      <Star className={`w-6 h-6 ${destaque ? 'text-yellow-500 fill-current' : 'text-muted-foreground/30'}`} />
                      <div>
                         <p className="text-sm font-semibold">Notícia em Destaque</p>
                         <p className="text-xs text-muted-foreground">Exibir com prioridade no carrossel superior</p>
                      </div>
                   </div>
                   <Switch checked={destaque} onCheckedChange={setDestaque} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                   <div className="md:col-span-8 space-y-6">
                      <div className="space-y-2">
                         <Label className="text-sm font-semibold">Título da Matéria</Label>
                         <Input value={titulo} onChange={e => setTitulo(e.target.value)} className="h-12 rounded-lg text-lg font-bold" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-sm font-semibold">Categoria</Label>
                         <select value={categoria} onChange={e => setCategoria(e.target.value)}
                           className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                           {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-sm font-semibold">Resumo (Lide)</Label>
                         <Textarea value={resumo} onChange={e => setResumo(e.target.value)} rows={3} className="rounded-lg resize-none" />
                      </div>
                   </div>
                   <div className="md:col-span-4 space-y-6">
                      <div className="space-y-2">
                         <Label className="text-sm font-semibold">Capa da Notícia</Label>
                         <div className="h-40 bg-muted border border-border rounded-lg overflow-hidden relative group cursor-pointer">
                            {imagem ? (
                              <>
                                <img src={imagem} alt="Capa" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                   <label className="cursor-pointer bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 shadow-sm transition-colors">
                                      <Upload className="w-5 h-5" />
                                      <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setImagem(await fileToBase64(f)); }} />
                                   </label>
                                   <Button variant="ghost" className="bg-destructive text-destructive-foreground hover:bg-destructive/90 p-2 h-9 w-9 rounded-full" onClick={(e) => { e.stopPropagation(); setImagem(""); }}><Trash2 className="w-5 h-5" /></Button>
                                </div>
                              </>
                            ) : (
                              <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors gap-2">
                                 <Upload className="w-8 h-8 text-muted-foreground/40" />
                                 <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">Upload de Imagem</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setImagem(await fileToBase64(f)); }} />
                              </label>
                            )}
                         </div>
                         <Input value={imagem} onChange={e => setImagem(e.target.value)} placeholder="URL da imagem..." className="h-10 rounded-lg text-sm mt-2" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-sm font-semibold">Fonte original</Label>
                         <Input value={fonte} onChange={e => setFonte(e.target.value)} placeholder="G1, CNN, etc..." className="h-11 rounded-lg" />
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-sm font-semibold">Conteúdo Completo</Label>
                   <Textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={12} className="rounded-lg min-h-[500px] p-4 font-medium" />
                </div>

                <div className="flex gap-3 pt-6 border-t border-border/50">
                  <Button onClick={handleSave} className="h-11 px-8 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {editId ? "Salvar Alterações" : "Publicar Notícia"}
                  </Button>
                  <Button variant="outline" onClick={() => { resetForm(); onTabChange("lista"); }} className="h-11 px-6 rounded-lg font-semibold">Descartar</Button>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="categorias" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           <Card className="rounded-xl border border-border shadow-sm bg-card p-6">
              <CardTitle className="text-lg font-bold mb-6">Gerenciar Categorias</CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 {categorias.map(cat => (
                   <div key={cat} className="flex items-center justify-between bg-muted/50 border border-border p-3 rounded-lg group hover:bg-background hover:shadow-sm transition-all">
                      <span className="font-semibold text-sm text-foreground">{cat}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategoria(cat)} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50">
                         <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                 ))}
              </div>
              <div className="mt-8 pt-6 border-t border-border flex gap-3">
                 <Input value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} placeholder="Nova categoria..." className="h-11 rounded-lg max-w-sm" />
                 <Button onClick={handleAddCategoria} variant="secondary" className="h-11 px-6 rounded-lg font-semibold text-secondary-foreground shadow-sm">Adicionar</Button>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNoticias;
