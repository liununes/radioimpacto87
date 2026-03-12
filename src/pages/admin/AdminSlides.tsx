import { useState, useEffect } from "react";
import { Trash2, Upload, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Slide, getSlides, saveSlide, deleteSlide } from "@/lib/radioStore";
import { toast } from "sonner";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

const AdminSlides = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [titulo, setTitulo] = useState("");
  const [imagem, setImagem] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSlides = async () => {
    const data = await getSlides();
    setSlides(data);
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleAdd = async () => {
    if (!titulo.trim() || !imagem) {
      toast.error("Preencha o título e escolha uma imagem.");
      return;
    }
    setLoading(true);
    const { error } = await saveSlide({ titulo, imagem });
    if (error) {
      toast.error("Erro ao adicionar slide.");
    } else {
      toast.success("Slide adicionado!");
      fetchSlides();
      setTitulo(""); setImagem("");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este slide?")) return;
    const { error } = await deleteSlide(id);
    if (error) {
      toast.error("Erro ao remover.");
    } else {
      toast.success("Slide removido!");
      fetchSlides();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Slides / Banners</h2>
      <Card>
        <CardHeader><CardTitle>Novo Slide</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título do slide" />
            </div>
            <div className="space-y-2">
              <Label>Imagem</Label>
              <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm h-10">
                <Upload className="w-4 h-4" /> Escolher imagem
                <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setImagem(await fileToBase64(f)); }} />
              </label>
            </div>
          </div>
          {imagem && <img src={imagem} alt="Preview" className="h-32 rounded-lg object-cover border border-border" />}
          <Button onClick={handleAdd} className="gap-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Adicionar Slide
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map(slide => (
          <Card key={slide.id} className="overflow-hidden">
            <img src={slide.imagem} alt={slide.titulo} className="w-full h-40 object-cover" />
            <CardContent className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{slide.titulo}</span>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(slide.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {slides.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">Nenhum slide cadastrado.</p>}
      </div>
    </div>
  );
};

export default AdminSlides;
