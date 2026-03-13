import { useState, useEffect } from "react";
import { Calendar, MapPin, ExternalLink, Image as ImageIcon, Rss, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewsItem {
  id: string;
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  categoria: string | null;
  imagem: string | null;
  fonte: string | null;
  url: string | null;
  data_postagem: string;
  usuario_id: string | null;
}

interface EnhancedNewsSectionProps {
  showNews?: boolean;
}

const EnhancedNewsSection = ({ showNews = true }: EnhancedNewsSectionProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    resumo: '',
    conteudo: '',
    categoria: 'local',
    imagem: '',
    fonte: '',
    url: ''
  });

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("data_postagem", { ascending: false })
      .limit(20);
    
    if (error) {
      toast.error("Erro ao buscar notícias: " + error.message);
    } else {
      setNews(data || []);
    }
    setLoading(false);
  };

  const fetchNewsFromUrl = async (url: string) => {
    try {
      toast.info("Extraindo conteúdo da URL...");
      
      const response = await fetch(url);
      const html = await response.text();
      
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : "Título não encontrado";
      
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["'][^>]*>/i);
      const content = descMatch ? descMatch[1] : "Conteúdo não encontrado";
      
      setFormData(prev => ({
        ...prev,
        titulo: title.substring(0, 100),
        resumo: content.substring(0, 300),
        url: url
      }));
      
      toast.success("Conteúdo extraído com sucesso!");
    } catch (error) {
      toast.error("Erro ao extrair conteúdo da URL");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error("Título é obrigatório.");
      return;
    }

    try {
      const newsData = {
        titulo: formData.titulo.trim(),
        resumo: formData.resumo.trim() || null,
        conteudo: formData.conteudo.trim() || null,
        categoria: formData.categoria,
        imagem: formData.imagem.trim() || null,
        fonte: formData.fonte.trim() || null,
        url: formData.url.trim() || null,
        data_postagem: new Date().toISOString()
      };

      if (editingNews) {
        const { error } = await supabase
          .from("noticias")
          .update(newsData)
          .eq("id", editingNews.id);
        
        if (error) throw error;
        toast.success("Notícia atualizada!");
      } else {
        const { error } = await supabase
          .from("noticias")
          .insert(newsData);
        
        if (error) throw error;
        toast.success("Notícia criada!");
      }

      setFormData({
        titulo: '',
        resumo: '',
        conteudo: '',
        categoria: 'local',
        imagem: '',
        fonte: '',
        url: ''
      });
      setEditingNews(null);
      setIsDialogOpen(false);
      fetchNews();
    } catch (error) {
      toast.error("Erro ao salvar notícia.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta notícia?")) return;
    
    try {
      const { error } = await supabase.from("noticias").delete().eq("id", id);
      if (error) throw error;
      toast.success("Notícia removida!");
      fetchNews();
    } catch (error) {
      toast.error("Erro ao remover notícia.");
    }
  };

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setFormData({
      titulo: newsItem.titulo,
      resumo: newsItem.resumo || '',
      conteudo: newsItem.conteudo || '',
      categoria: newsItem.categoria || 'local',
      imagem: newsItem.imagem || '',
      fonte: newsItem.fonte || '',
      url: newsItem.url || ''
    });
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (!showNews) return null;

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Notícias</h2>
            <p className="text-muted-foreground">Acompanhe as últimas notícias locais e regionais</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Notícia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNews ? 'Editar Notícia' : 'Nova Notícia'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Título da notícia"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={formData.categoria} onValueChange={(value: any) => setFormData(prev => ({ ...prev, categoria: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                        <SelectItem value="nacional">Nacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="resumo">Resumo</Label>
                  <Textarea
                    id="resumo"
                    value={formData.resumo}
                    onChange={(e) => setFormData(prev => ({ ...prev, resumo: e.target.value }))}
                    placeholder="Resumo da notícia"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="conteudo">Conteúdo Completo</Label>
                  <Textarea
                    id="conteudo"
                    value={formData.conteudo}
                    onChange={(e) => setFormData(prev => ({ ...prev, conteudo: e.target.value }))}
                    placeholder="Conteúdo completo da notícia"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imagem">URL da Imagem</Label>
                    <Input
                      id="imagem"
                      value={formData.imagem}
                      onChange={(e) => setFormData(prev => ({ ...prev, imagem: e.target.value }))}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Dimensões recomendadas: 1200x630px
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="fonte">Fonte</Label>
                    <Input
                      id="fonte"
                      value={formData.fonte}
                      onChange={(e) => setFormData(prev => ({ ...prev, fonte: e.target.value }))}
                      placeholder="Nome da fonte"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="url">URL da Notícia</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://exemplo.com/noticia"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formData.url && fetchNewsFromUrl(formData.url)}
                      disabled={!formData.url}
                    >
                      <Rss className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingNews(null);
                      setFormData({
                        titulo: '',
                        resumo: '',
                        conteudo: '',
                        categoria: 'local',
                        imagem: '',
                        fonte: '',
                        url: ''
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingNews ? 'Atualizar' : 'Criar'} Notícia
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.imagem && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={item.imagem} 
                    alt={item.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    item.categoria === 'local' ? 'bg-blue-100 text-blue-800' :
                    item.categoria === 'regional' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {item.categoria === 'local' ? 'Local' :
                     item.categoria === 'regional' ? 'Regional' : 'Nacional'}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-2">{item.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.resumo && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.resumo}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.data_postagem).toLocaleDateString('pt-BR')}
                  </div>
                  {item.fonte && (
                    <span className="text-xs">{item.fonte}</span>
                  )}
                </div>

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ler mais
                  </a>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando notícias...</p>
          </div>
        )}

        {!loading && news.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma notícia encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando sua primeira notícia usando o botão acima.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EnhancedNewsSection;
