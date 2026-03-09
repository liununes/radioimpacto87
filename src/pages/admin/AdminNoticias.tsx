import { useState } from "react";
import { Trash2, Edit2, Save, X, Plus, Link, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Noticia, getNoticias, saveNoticias, getCategorias, saveCategorias } from "@/lib/noticiasStore";
import { supabase } from "@/integrations/supabase/client";

const AdminNoticias = () => {
  const [noticias, setNoticias] = useState<Noticia[]>(getNoticias());
  const [categorias, setCategorias] = useState<string[]>(getCategorias());
  const [tab, setTab] = useState(categorias[0] || "Local");

  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState(categorias[0] || "Local");
  const [imagem, setImagem] = useState("");
  const [fonte, setFonte] = useState("");
  const [urlOriginal, setUrlOriginal] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  // URL scraping
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  // New category
  const [novaCategoria, setNovaCategoria] = useState("");

  const filtered = noticias.filter(n => n.categoria === tab);

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return;
    setIsScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-news', {
        body: { url: scrapeUrl },
      });

      if (error) throw error;

      if (data?.success && data.data) {
        const d = data.data;
        setTitulo(d.titulo || "");
        setResumo(d.resumo || "");
        setConteudo(d.conteudo || "");
        setImagem(d.imagem || "");
        setFonte(d.fonte || "");
        setUrlOriginal(d.url || scrapeUrl);
        setCategoria(tab);
      } else {
        alert(data?.error || "Não foi possível extrair dados da URL");
      }
    } catch (err) {
      console.error('Scrape error:', err);
      alert("Erro ao acessar a URL. Verifique se o endereço está correto.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSave = () => {
    if (!titulo.trim() || !resumo.trim()) return;
    const now = new Date();
    const data = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;

    let updated: Noticia[];
    if (editId) {
      updated = noticias.map(n => n.id === editId
        ? { ...n, titulo, resumo, conteudo, categoria, imagem: imagem || n.imagem || "", fonte, url: urlOriginal, data }
        : n);
    } else {
      updated = [...noticias, { id: crypto.randomUUID(), titulo, resumo, conteudo, categoria, imagem, fonte, url: urlOriginal, data }];
    }
    saveNoticias(updated);
    setNoticias(updated);
    resetForm();
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

  const handleDelete = (id: string) => {
    const updated = noticias.filter(n => n.id !== id);
    saveNoticias(updated);
    setNoticias(updated);
  };

  const resetForm = () => {
    setEditId(null); setTitulo(""); setResumo(""); setConteudo(""); setImagem(""); setFonte(""); setUrlOriginal(""); setScrapeUrl("");
  };

  const handleAddCategoria = () => {
    const nome = novaCategoria.trim();
    if (!nome || categorias.includes(nome)) return;
    const updated = [...categorias, nome];
    saveCategorias(updated);
    setCategorias(updated);
    setNovaCategoria("");
  };

  const handleDeleteCategoria = (cat: string) => {
    if (categorias.length <= 1) return;
    const updated = categorias.filter(c => c !== cat);
    saveCategorias(updated);
    setCategorias(updated);
    // Remove associated news
    const updatedNews = noticias.filter(n => n.categoria !== cat);
    saveNoticias(updatedNews);
    setNoticias(updatedNews);
    if (tab === cat) setTab(updated[0]);
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
            <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> {editId ? "Atualizar" : "Publicar"}</Button>
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
                  <span className="text-xs text-muted-foreground">{n.data} · {n.categoria}</span>
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
