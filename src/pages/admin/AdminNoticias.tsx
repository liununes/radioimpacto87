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
    setCategorias(cats);
    if (tab === "" && cats.length > 0) setTab(cats[0]);
    if (categoria === "" && cats.length > 0) setCategoria(cats[0]);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = noticias.filter(n => n.categoria === tab);

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return;
    setIsScraping(true);
    try {
      const targetUrl = scrapeUrl.trim().startsWith('http') ? scrapeUrl.trim() : `https://${scrapeUrl.trim()}`;
      
      // Usando AllOrigins como proxy de CORS para VPS self-hosted
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
      
      if (!response.ok) throw new Error("Não foi possível acessar o proxy");
      
      const responseData = await response.json();
      const html = responseData.contents;

      if (!html) throw new Error("Não foi possível ler o conteúdo da página.");

      // Helper para extrair meta tags
      const getMeta = (prop: string) => {
        const reg = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
        const match = html.match(reg);
        if (match) return match[1];
        const regAlt = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
        const matchAlt = html.match(regAlt);
        return matchAlt ? matchAlt[1] : '';
      };

      // Extração
      const title = getMeta('og:title') || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
      const description = getMeta('og:description') || getMeta('description') || "";
      const image = getMeta('og:image') || getMeta('twitter:image') || "";
      const source = getMeta('og:site_name') || new URL(targetUrl).hostname.replace('www.', '');

      // Extração de conteúdo simples (parágrafos)
      const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
      const content = pMatches
        .map((p: string) => p.replace(/<[^>]+>/g, '').trim())
        .filter((text: string) => text.length > 50)
        .slice(0, 8)
        .join('\n\n');

      setTitulo(title);
      setResumo(description);
      setConteudo(content);
      setImagem(image);
      setFonte(source);
      setUrlOriginal(targetUrl);
      setCategoria(tab || (categorias[0] || ""));
      
      toast.success("Dados extraídos com sucesso!");
    } catch (err: any) {
      console.error('Scrape error:', err);
      toast.error("Erro ao extrair dados. O site pode estar protegido ou o link está incorreto.");
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
      categoria: categoria || tab || categorias[0],
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Notícias</h2>

      {/* Category management */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Categorias</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {categorias.map(cat => (
              <div key={cat} className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full">
                <span className="text-sm text-foreground">{cat}</span>
                {categorias.length > 1 && (
                  <button onClick={() => handleDeleteCategoria(cat)} className="text-destructive hover:text-destructive/80 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} placeholder="Nova categoria..." className="max-w-xs" />
            <Button size="sm" onClick={handleAddCategoria} className="gap-1"><Plus className="w-3 h-3" /> Adicionar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categorias.map(cat => (
          <button key={cat} onClick={() => setTab(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* URL Scraper */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Link className="w-5 h-5 text-primary" /> Importar da URL</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Cole a URL de uma notícia e o sistema extrairá automaticamente o título, resumo, foto e fonte.</p>
          <div className="flex gap-2">
            <Input value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="https://exemplo.com/noticia..." className="flex-1" />
            <Button onClick={handleScrape} disabled={isScraping || !scrapeUrl.trim()} className="gap-2 shrink-0">
              {isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
              {isScraping ? "Extraindo..." : "Extrair"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader><CardTitle className="text-lg">{editId ? "Editar Notícia" : "Nova Notícia"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título da notícia" />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Resumo</Label>
            <Textarea value={resumo} onChange={e => setResumo(e.target.value)} rows={2} placeholder="Resumo curto da notícia..." />
          </div>
          <div className="space-y-2">
            <Label>Conteúdo Completo</Label>
            <Textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={5} placeholder="Texto completo..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fonte</Label>
              <Input value={fonte} onChange={e => setFonte(e.target.value)} placeholder="Nome do site/jornal" />
            </div>
            <div className="space-y-2">
              <Label>URL Original</Label>
              <Input value={urlOriginal} onChange={e => setUrlOriginal(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>URL da Imagem</Label>
            <Input value={imagem} onChange={e => setImagem(e.target.value)} placeholder="https://... (preenchido automaticamente ao importar)" />
          </div>
          {imagem && <img src={imagem} alt="Preview" className="h-24 rounded-lg object-cover border border-border" />}
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editId ? "Atualizar" : "Publicar"}
            </Button>
            {editId && <Button variant="ghost" onClick={resetForm} className="gap-2"><X className="w-4 h-4" /> Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(n => (
          <Card key={n.id}>
            <CardContent className="p-4 flex items-center gap-4">
              {n.imagem && <img src={n.imagem} alt={n.titulo} className="w-16 h-16 rounded-lg object-cover border border-border" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{n.titulo}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{n.resumo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground"> {n.categoria}</span>
                  {n.fonte && <span className="text-xs text-primary">Fonte: {n.fonte}</span>}
                  {n.url && (
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(n)}><Edit2 className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(n.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma notícia na categoria "{tab}".</p>}
      </div>
    </div>
  );
};

export default AdminNoticias;
