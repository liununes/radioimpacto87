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

import { useSearchParams } from "react-router-dom";

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
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Portal de <span className="text-secondary italic">Notícias</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Gerencie o conteúdo informativo do seu site</p>
        </div>
        <div className="flex gap-4">
           {!editId && activeTab === "lista" && (
             <>
                <Button onClick={() => setFilterTab("Todas")} variant={filterTab === "Todas" ? "default" : "outline"} className="rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-6">Todas</Button>
                {categorias.slice(0, 3).map(cat => (
                  <Button key={cat} onClick={() => setFilterTab(cat)} variant={filterTab === cat ? "default" : "outline"} className="rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-6">{cat}</Button>
                ))}
             </>
           )}
           <Button onClick={() => onTabChange("nova")} className="rounded-none h-12 bg-secondary text-primary font-black uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-yellow-400/20">
              <Plus className="w-4 h-4 mr-2" /> {editId ? "Editando..." : "Nova Postagem"}
           </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="bg-white p-1 h-auto rounded-none border border-gray-100 shadow-xl">
            <TabsTrigger value="lista" className="rounded-none px-8 py-4 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">Gerenciar Lista</TabsTrigger>
            <TabsTrigger value="nova" className="rounded-none px-8 py-4 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">Publicar Notícia</TabsTrigger>
            <TabsTrigger value="categorias" className="rounded-none px-8 py-4 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">Categorias</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="lista" className="animate-in fade-in zoom-in-95 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(n => (
                <Card key={n.id} className="group rounded-none border-none shadow-xl overflow-hidden bg-white text-slate-900 hover:shadow-2xl transition-all duration-500">
                  <div className="h-48 bg-gray-100 overflow-hidden relative">
                    <img src={n.imagem || ""} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-primary text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-none">{n.categoria}</div>
                    {n.destaque && (
                      <div className="absolute top-4 right-4 bg-secondary text-primary font-black p-2 rounded-none shadow-lg">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <h3 className="font-black text-lg text-primary uppercase italic leading-tight line-clamp-2 h-14">{n.titulo}</h3>
                    <p className="text-[11px] text-gray-400 font-medium line-clamp-3 leading-relaxed">{n.resumo}</p>
                    <div className="flex gap-4 pt-6 border-t border-gray-50">
                       <Button variant="ghost" onClick={() => handleEdit(n)} className="flex-1 rounded-none border border-gray-100 font-black uppercase text-[10px] h-10 hover:bg-primary hover:text-white transition-all">Editar</Button>
                       <Button variant="ghost" onClick={() => handleDelete(n.id)} className="flex-1 rounded-none text-red-400 font-black uppercase text-[10px] h-10 hover:bg-red-50 hover:text-red-500 transition-all">Excluir</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full h-80 flex flex-col items-center justify-center bg-gray-50 text-gray-200 rounded-none border-2 border-dashed border-gray-100">
                   <Plus className="w-16 h-16 mb-4 opacity-10" />
                   <h4 className="text-xl font-black uppercase tracking-widest italic">Nenhuma notícia encontrada</h4>
                </div>
              )}
           </div>
        </TabsContent>

        <TabsContent value="nova" className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
           <Card className="rounded-none border-none shadow-2xl bg-white text-slate-900">
             <CardHeader className="bg-primary/5 p-10 border-b border-gray-100">
                <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary italic flex items-center gap-4">
                   <Edit2 className="w-8 h-8 text-secondary" /> {editId ? "Editar Publicação" : "Nova Publicação"}
                </CardTitle>
             </CardHeader>
             <CardContent className="p-10 space-y-10">
                <div className="bg-blue-50/50 p-6 border border-blue-100 flex items-center gap-6 group">
                   <Link className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform" />
                   <Input value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="Importar de uma URL externa..." className="flex-1 h-14 rounded-none border-gray-100 bg-white" />
                   <Button onClick={handleScrape} disabled={isScraping || !scrapeUrl.trim()} className="h-14 px-10 rounded-none bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl">
                      {isScraping ? <Loader2 className="w-5 h-5 animate-spin" /> : "Importar"}
                   </Button>
                </div>

                <div className="flex items-center justify-between p-6 bg-yellow-50/30 border border-yellow-100 rounded-none">
                   <div className="flex items-center gap-4">
                      <Star className={`w-8 h-8 ${destaque ? 'text-secondary fill-current' : 'text-gray-200'}`} />
                      <div>
                         <p className="text-xs font-black uppercase text-primary italic">Notícia em Destaque</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase italic">Exibir com prioridade no carrossel do site</p>
                      </div>
                   </div>
                   <Switch checked={destaque} onCheckedChange={setDestaque} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                   <div className="md:col-span-8 space-y-8">
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Título da Matéria</Label>
                         <Input value={titulo} onChange={e => setTitulo(e.target.value)} className="h-16 rounded-none border-gray-100 text-xl font-black text-primary shadow-sm" />
                      </div>
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Categoria</Label>
                         <select value={categoria} onChange={e => setCategoria(e.target.value)}
                           className="flex h-12 w-full rounded-none border border-gray-100 bg-gray-50 px-4 text-sm font-bold text-primary focus:ring-2 focus:ring-primary">
                           {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                         </select>
                      </div>
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Resumo (Lide)</Label>
                         <Textarea value={resumo} onChange={e => setResumo(e.target.value)} rows={3} className="rounded-none border-gray-100 font-medium" />
                      </div>
                   </div>
                   <div className="md:col-span-4 space-y-8">
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Capa da Notícia</Label>
                         <div className="h-48 bg-gray-50 border border-gray-100 rounded-none overflow-hidden relative group">
                            {imagem ? <img src={imagem} alt="Capa" className="w-full h-full object-cover" /> : <Plus className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-gray-200" />}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <Button variant="ghost" className="text-white hover:text-red-400" onClick={() => setImagem("")}><Trash2 className="w-6 h-6" /></Button>
                            </div>
                         </div>
                         <Input value={imagem} onChange={e => setImagem(e.target.value)} placeholder="URL da imagem..." className="h-10 rounded-none border-gray-100 text-[10px] mt-2 font-bold" />
                      </div>
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Fonte original</Label>
                         <Input value={fonte} onChange={e => setFonte(e.target.value)} placeholder="G1, CNN, etc..." className="h-12 rounded-none border-gray-100" />
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Conteúdo Completo</Label>
                   <Textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={15} className="rounded-none border-gray-100 font-medium leading-relaxed p-6 min-h-[300px]" />
                </div>

                <div className="flex gap-4 pt-10 border-t border-gray-50">
                  <Button onClick={handleSave} className="h-16 px-16 rounded-none bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 transition-all" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                    {editId ? "Salvar Alterações" : "Publicar Notícia"}
                  </Button>
                  <Button variant="ghost" onClick={() => { resetForm(); onTabChange("lista"); }} className="h-16 px-10 rounded-none font-black uppercase text-[10px] text-gray-400 tracking-widest">Descartar</Button>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="categorias" className="animate-in fade-in zoom-in-95 duration-500 max-w-3xl mx-auto">
           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 p-10">
              <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic mb-10">Gerenciar Categorias</CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {categorias.map(cat => (
                   <div key={cat} className="flex items-center justify-between bg-gray-50 border border-gray-100 p-6 rounded-none group hover:bg-white hover:shadow-lg transition-all">
                      <span className="font-black text-sm uppercase tracking-tighter text-primary italic">{cat}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategoria(cat)} className="text-gray-200 hover:text-red-500 transition-colors">
                         <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                 ))}
              </div>
              <div className="mt-10 pt-10 border-t border-gray-100 flex gap-4">
                 <Input value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} placeholder="NOME DA CATEGORIA..." className="h-14 rounded-none border-gray-100 uppercase font-bold" />
                 <Button onClick={handleAddCategoria} className="h-14 px-10 rounded-none bg-gray-100 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all">Adicionar</Button>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNoticias;
