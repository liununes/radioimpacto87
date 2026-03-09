import { useState } from "react";
import { Trash2, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STORAGE_KEY = "radio_fotos";

interface Foto {
  id: string;
  descricao: string;
  imagem: string;
}

function getFotos(): Foto[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

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
  const [imagem, setImagem] = useState("");

  const handleAdd = () => {
    if (!imagem) return;
    const updated = [...fotos, { id: crypto.randomUUID(), descricao, imagem }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFotos(updated);
    setDescricao(""); setImagem("");
  };

  const handleDelete = (id: string) => {
    const updated = fotos.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFotos(updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Galeria de Fotos</h2>
      <Card>
        <CardHeader><CardTitle>Nova Foto</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição da foto" />
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
          <Button onClick={handleAdd} className="gap-2"><Plus className="w-4 h-4" /> Adicionar Foto</Button>
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
