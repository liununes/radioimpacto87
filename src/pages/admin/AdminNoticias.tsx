import { useState, useEffect } from "react";
import { Trash2, Edit2, Save, X, Plus, Link, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Noticia, getNoticias, saveNoticia, deleteNoticia, getCategorias, saveCategorias } from "@/lib/noticiasStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminNoticias = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [tab, setTab] = useState("");
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState("");
  const [fonte, setFonte] = useState("");
  const [urlOriginal, setUrlOriginal] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  // URL scraping
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  // New category
  const [novaCategoria, setNovaCategoria] = useState("");

  const fetchData = async () => {
    const [newsData, cats] = await Promise.all([getNoticias(), getCategorias()]);
    setNoticias(newsData);
    
    // Coletar todas as categorias presentes nas notícias para garantir que nada fique oculto
    const newsCats = newsData
      .map(n => n.categoria)
      .filter((c): c is string => !!c && !cats.includes(c));
    
    const allCats = [...cats, ...newsCats];
    setCategorias(allCats);
    
    // Garantir que a aba inicial seja "Todas" caso nenhuma esteja selecionada
    if (!tab) setTab("Todas");
    if (!categoria && allCats.length > 0) setCategoria(allCats[0]);
  };

  useEffect(() => { fetchData(); }, []);

  // O filtro agora garante que se a aba for "Todas", mostramos TUDO
  const filtered = !tab || tab === "Todas" ? noticias : noticias.filter(n => n.categoria === tab);

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return;
    setIsScraping(true);
    try {
      const targetUrl = scrapeUrl.trim().startsWith('http') ? scrapeUrl.trim() : `https://${scrapeUrl.trim()}`;
      
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(targetUrl)}&palette=true&audio=true&video=true&iframe=true`);
      const res = await response.json();
      
      if (res.status !== 'success') {
        throw new Error(res.message || "Não foi possível extrair dados desta URL.");
      }
      
      const data = res.data;

      setTitulo(data.title || "");
      setResumo(data.description || "");
      setConteudo(data.description || ""); 
      setImagem(data.image?.url || data.logo?.url || "");
      setFonte(data.publisher || new URL(targetUrl).hostname.replace('www.', ''));
      setUrlOriginal(data.url || targetUrl);
      setCategoria(tab !== "Todas" ? tab : (categorias[0] || ""));
      
      toast.success("Dados importados com sucesso!");
    } catch (err: any) {
      console.error('Microlink error:', err);
      toast.error(err.message || "Erro ao importar notícia. Verifique o link e tente novamente.");
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
      url: urlOriginal
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
    setEditId(null); setTitulo(""); setResumo(""); setConteudo(""); setImagem(""); setFonte(""); setUrlOriginal(""); setScrapeUrl("");
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
    if (tab === cat) setTab(updated[0]);
    toast.success("Categoria removida!");
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Portal de <span className="text-secondary italic">Notícias</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Gerencie o conteúdo informativo do seu site</p>
        </div>
        <div className="flex gap-4">
           <Button onClick={() => setTab("Todas")} variant={tab === "Todas" ? "default" : "outline"} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-6">Todas</Button>
           {categorias.slice(0, 3).map(cat => (
             <Button key={cat} onClick={() => setTab(cat)} variant={tab === cat ? "default" : "outline"} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-6">{cat}</Button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           {/* URL Scraper */}
           <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
             <CardHeader className="bg-primary/5 p-8 border-b border-gray-100/50">
               <CardTitle className="text-lg font-black uppercase tracking-tight text-primary flex items-center gap-3">
                 <Link className="w-5 h-5 text-secondary" /> Importação Inteligente
               </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                 Cole o link de qualquer portal de notícias para que nossa IA extraia o conteúdo automaticamente.
               </p>
               <div className="flex gap-4">
                 <Input 
                   value={scrapeUrl} 
                   onChange={e => setScrapeUrl(e.target.value)} 
                   placeholder="https://exemplo.com/noticia..." 
                   className="flex-1 h-14 rounded-2xl border-gray-100 bg-gray-50 focus-visible:ring-primary font-medium" 
                 />
                 <Button onClick={handleScrape} disabled={isScraping || !scrapeUrl.trim()} className="h-14 px-10 rounded-2xl bg-secondary hover:bg-secondary/90 text-primary font-black uppercase tracking-widest text-[10px] shadow-lg shadow-yellow-400/10">
                   {isScraping ? <Loader2 className="w-5 h-5 animate-spin" /> : "Extrair Dados"}
                 </Button>
               </div>
             </CardContent>
           </Card>

           {/* Form Card */}
           <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
             <CardHeader className="p-8 border-b border-gray-50">
               <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">
                 {editId ? "Editando Publicação" : "Nova Publicação"}
               </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Título da Notícia</Label>
                   <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="O que está acontecendo?" className="h-12 rounded-xl border-gray-100 shadow-sm" />
                 </div>
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Categoria do Post</Label>
                   <select value={categoria} onChange={e => setCategoria(e.target.value)}
                     className="flex h-12 w-full rounded-xl border border-gray-100 bg-background px-4 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                     {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
                 </div>
               </div>
               
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Resumo de Chamada</Label>
                 <Textarea value={resumo} onChange={e => setResumo(e.target.value)} rows={2} className="rounded-xl border-gray-100 shadow-sm p-4 font-medium" />
               </div>

               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Conteúdo Detalhado</Label>
                 <Textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={8} className="rounded-xl border-gray-100 shadow-sm p-6 font-medium leading-relaxed" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fonte / Veículo</Label>
                   <Input value={fonte} onChange={e => setFonte(e.target.value)} className="h-12 rounded-xl border-gray-100" />
                 </div>
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Link da Imagem Principal</Label>
                   <Input value={imagem} onChange={e => setImagem(e.target.value)} className="h-12 rounded-xl border-gray-100" />
                 </div>
               </div>

               {imagem && (
                 <div className="relative group rounded-[2rem] overflow-hidden border-4 border-gray-50 h-64 shadow-inner bg-gray-50 flex items-center justify-center">
                    <img src={imagem} alt="Preview" className="max-h-full object-contain" />
                 </div>
               )}

               <div className="flex gap-4 pt-4">
                 <Button onClick={handleSave} className="h-14 px-12 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-900/10" disabled={loading}>
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                   {editId ? "Atualizar Notícia" : "Publicar Notícia"}
                 </Button>
                 {editId && (
                   <Button variant="ghost" onClick={resetForm} className="h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-50">
                     Cancelar
                   </Button>
                 )}
               </div>
             </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-10">
           {/* Category Management */}
           <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
             <CardHeader className="p-8 pb-4">
               <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">Categorias</CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-4 space-y-8">
               <div className="flex flex-wrap gap-2">
                 {categorias.map(cat => (
                   <div key={cat} className="group relative flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100/50 hover:bg-white hover:shadow-md transition-all">
                     <span className="text-[11px] font-bold text-primary uppercase">{cat}</span>
                     {categorias.length > 1 && (
                       <button 
                         onClick={() => handleDeleteCategoria(cat)} 
                         className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                         <X className="w-3.5 h-3.5" />
                       </button>
                     )}
                   </div>
                 ))}
               </div>
               <div className="pt-6 border-t border-gray-50 flex flex-col gap-3">
                 <Input value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} placeholder="NOME DA CATEGORIA..." className="h-12 rounded-xl border-gray-100 bg-gray-50 font-black text-[10px] uppercase tracking-widest text-center" />
                 <Button onClick={handleAddCategoria} className="h-12 rounded-xl bg-gray-100 text-primary border-none hover:bg-primary hover:text-white font-black uppercase text-[10px] tracking-widest">
                   Adicionar Nova
                 </Button>
               </div>
             </CardContent>
           </Card>

           {/* Feed */}
           <div className="space-y-6">
             <div className="flex items-center justify-between px-4">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Feed de Publicações</h4>
               <span className="text-[10px] font-black text-primary bg-secondary/20 px-2 py-0.5 rounded uppercase leading-none">{filtered.length} Ativas</span>
             </div>
             <div className="space-y-4">
               {filtered.map(n => (
                 <Card key={n.id} className="group rounded-[1.8rem] border-none shadow-md overflow-hidden bg-white hover:shadow-xl transition-all duration-300 cursor-default">
                   <CardContent className="p-4 flex gap-4">
                     <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-inner">
                        <img src={n.imagem || ""} alt={n.titulo} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                     </div>
                     <div className="flex-1 flex flex-col justify-center min-w-0">
                        <h5 className="font-black text-xs text-primary uppercase tracking-tight line-clamp-1 group-hover:text-secondary transition-colors italic">{n.titulo}</h5>
                        <p className="text-[10px] text-gray-400 font-medium line-clamp-2 mt-1 leading-tight">{n.resumo}</p>
                        <div className="flex items-center gap-3 mt-3">
                           <button onClick={() => handleEdit(n)} className="p-1 px-3 bg-gray-50 text-[9px] font-black uppercase text-primary rounded-lg border border-gray-100 hover:bg-primary hover:text-white transition-all">Editar</button>
                           <button onClick={() => handleDelete(n.id)} className="p-1 px-3 bg-red-50 text-[9px] font-black uppercase text-red-500 rounded-lg border border-red-100 hover:bg-red-500 hover:text-white transition-all">Excluir</button>
                        </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNoticias;
