import { useState, useEffect } from "react";
import { Trash2, Edit2, Save, X, Plus, Link, Loader2, ExternalLink, Star, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { type Noticia, getNoticias, saveNoticia, deleteNoticia } from "@/lib/noticiasStore";
import { toast } from "sonner";

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
        resumo: "Entenda por que o formato de áudio está voltando com tudo nas plataformas digitais e como a rádio se adapta.",
        conteudo: "Conteúdo completo sobre a evolução do áudio...",
        imagem: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
        categoria: CATEGORIA_FIXA,
        fonte: "Cultura Pop",
        destaque: true
      },
      {
        titulo: "Top 10 curiosidades sobre os maiores locutores do Brasil",
        resumo: "De onde vieram as vozes que embalam as manhãs de milhões de brasileiros todos os dias?",
        conteudo: "Histórias incríveis de superação...",
        imagem: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
        categoria: CATEGORIA_FIXA,
        fonte: "Rádio Brasil"
      },
      {
        titulo: "Lançamento: Nova música do momento promete quebrar recordes",
        resumo: "Conheça o novo hit que já está na nossa programação e que não sai da cabeça dos ouvintes.",
        conteudo: "Análise completa do novo álbum...",
        imagem: "https://images.unsplash.com/photo-1514525253361-b83f8b91272d?auto=format&fit=crop&w=800&q=80",
        categoria: CATEGORIA_FIXA,
        fonte: "Billboard"
      }
    ];

    for (const ex of examples) {
      await saveNoticia(ex);
    }
    
    toast.success("Exemplos de entretenimento gerados com sucesso!");
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
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-accent text-white flex items-center justify-center rounded-none shadow-lg">
              <Radio className="w-8 h-8" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Canal de <span className="text-secondary italic">Entretenimento</span></h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Vídeos, Curiosidades e Estilo de Vida</p>
           </div>
        </div>
        <div className="flex gap-4">
           {noticias.length === 0 && (
             <Button onClick={insertExamples} disabled={loading} variant="outline" className="rounded-none border-primary text-primary font-black uppercase tracking-widest text-[9px] h-12 px-6 hover:bg-primary hover:text-white border-2">
                Gerar Conteúdo de Exemplo
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
             <CardHeader className="bg-primary/5 p-8 border-b border-gray-100/50">
               <CardTitle className="text-lg font-black uppercase tracking-tight text-primary flex items-center gap-3">
                 <Link className="w-5 h-5 text-secondary" /> Importar de Fonte Externa
               </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
               <div className="flex gap-4">
                 <Input value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="Link de vídeo ou matéria de fofoca/entretenimento..." className="flex-1 h-14 rounded-none border-gray-100 bg-gray-50" />
                 <Button onClick={handleScrape} disabled={isScraping || !scrapeUrl.trim()} className="h-14 px-10 rounded-none bg-accent hover:bg-accent/90 text-white font-black uppercase text-[10px]">
                   {isScraping ? <Loader2 className="w-5 h-5 animate-spin" /> : "Capturar"}
                 </Button>
               </div>
             </CardContent>
           </Card>

           <Card className="rounded-none border-none shadow-xl bg-white text-slate-900 overflow-hidden">
             <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
               <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">
                 {editId ? "Editar Conteúdo" : "Nova Publicação de Entretenimento"}
               </CardTitle>
               <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 border border-gray-100">
                  <span className="text-[10px] font-black uppercase text-gray-400 italic">Editoria Fixa:</span>
                  <span className="text-[10px] font-black uppercase text-accent">{CATEGORIA_FIXA}</span>
               </div>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between p-6 bg-yellow-50/50 border border-yellow-100 rounded-none">
                   <div className="flex items-center gap-4">
                      <div className={`p-3 ${destaque ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400'} transition-all`}>
                         <Star className={`w-6 h-6 ${destaque ? 'fill-current' : ''}`} />
                      </div>
                      <div>
                         <p className="text-xs font-black uppercase text-primary">Destaque nesta editoria</p>
                      </div>
                   </div>
                   <Switch checked={destaque} onCheckedChange={setDestaque} />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Título Chamativo</Label>
                  <Input value={titulo} onChange={e => setTitulo(e.target.value)} className="h-12 rounded-none border-gray-100" />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Curta Chamada (Resumo)</Label>
                  <Textarea value={resumo} onChange={e => setResumo(e.target.value)} rows={2} className="rounded-none border-gray-100 shadow-sm" />
                </div>

                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Conteúdo / Curiosidades</Label>
                   <Textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={8} className="rounded-none border-gray-100 p-6 font-medium leading-relaxed resize-y" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fonte Original</Label>
                    <Input value={fonte} onChange={e => setFonte(e.target.value)} className="h-12 rounded-none border-gray-100" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">URL da Imagem / Vídeo Thumb</Label>
                    <Input value={imagem} onChange={e => setImagem(e.target.value)} className="h-12 rounded-none border-gray-100" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSave} className="h-14 px-12 rounded-none bg-primary hover:bg-primary/95 text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-3" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Confirmar Publicação
                  </Button>
                  {editId && (
                    <Button variant="ghost" onClick={resetForm} className="h-14 px-8 rounded-none font-black uppercase text-[10px] text-gray-400">
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Conteúdos Publicados ({noticias.length})</h4>
           <div className="space-y-4">
             {noticias.map(n => (
               <Card key={n.id} className="rounded-none border-none shadow-md overflow-hidden bg-white text-slate-900 group">
                 <CardContent className="p-4 flex gap-4">
                   <div className="w-20 h-20 rounded-none overflow-hidden bg-gray-100 shrink-0 relative">
                     <img src={n.imagem || ""} alt={n.titulo} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                     {n.destaque && <div className="absolute top-1 right-1"><Star className="w-3 h-3 text-yellow-500 fill-current" /></div>}
                   </div>
                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                     <h5 className="font-black text-[11px] text-primary uppercase line-clamp-2 leading-tight">{n.titulo}</h5>
                     <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => handleEdit(n)} className="text-[9px] font-black uppercase text-blue-500 hover:underline">Editar</button>
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

export default AdminEntretenimento;
