import { useState } from "react";
import { Trash2, Upload, Plus, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFotos, saveFotos, type Foto } from "@/lib/radioStore";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

const AdminFotos = () => {
  const [fotos, setFotos] = useState<Foto[]>(getFotos());
  const [descricao, setDescricao] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const bases: string[] = [];
    for (let i = 0; i < files.length; i++) {
      bases.push(await fileToBase64(files[i]));
    }
    setImagens(prev => [...prev, ...bases]);
  };

  const handleAdd = () => {
    if (imagens.length === 0) return;
    const novas: Foto[] = imagens.map(img => ({
      id: crypto.randomUUID(),
      descricao,
      imagem: img,
    }));
    const updated = [...fotos, ...novas];
    saveFotos(updated);
    setFotos(updated);
    setDescricao("");
    setImagens([]);
  };

  const handleDelete = (id: string) => {
    const updated = fotos.filter(f => f.id !== id);
    saveFotos(updated);
    setFotos(updated);
  };

  const removePreview = (idx: number) => {
    setImagens(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Galeria de Fotos</h2>

      <Card>
        <CardHeader><CardTitle>Adicionar Fotos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Guidelines */}
          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ImageIcon className="w-4 h-4 text-primary" />
              Requisitos das Fotos
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Formatos aceitos:</strong> JPG, PNG, WebP</li>
              <li><strong>Tamanho recomendado:</strong> 1080×1080px (quadrada) ou 1920×1080px (paisagem)</li>
              <li><strong>Tamanho máximo:</strong> 5MB por foto</li>
              <li><strong>Dica:</strong> Use fotos com boa iluminação e resolução para melhor exibição na galeria</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label>Descrição (opcional, aplicada a todas as fotos)</Label>
            <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição das fotos" />
          </div>

          <div className="space-y-2">
            <Label>Selecionar Imagens (múltiplas)</Label>
            <label className="flex items-center gap-2 px-4 py-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm border-2 border-dashed border-border">
              <Upload className="w-5 h-5 text-primary" /> Clique para escolher fotos ou arraste aqui
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFilesChange} />
            </label>
          </div>

          {imagens.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{imagens.length} foto(s) selecionada(s)</p>
              <div className="flex gap-2 flex-wrap">
                {imagens.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-border" />
                    <button
                      onClick={() => removePreview(idx)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="text-destructive-foreground text-xs">✕</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleAdd} className="gap-2" disabled={imagens.length === 0}>
            <Plus className="w-4 h-4" /> Adicionar {imagens.length > 1 ? `${imagens.length} Fotos` : "Foto"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {fotos.map(foto => (
          <div key={foto.id} className="relative group rounded-lg overflow-hidden border border-border">
            <img src={foto.imagem} alt={foto.descricao} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(foto.id)}>
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
            {foto.descricao && <p className="text-xs text-muted-foreground p-2 truncate">{foto.descricao}</p>}
          </div>
        ))}
        {fotos.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">Nenhuma foto cadastrada.</p>}
      </div>
    </div>
  );
};

export default AdminFotos;
