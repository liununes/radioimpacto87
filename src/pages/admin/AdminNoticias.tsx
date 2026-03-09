import { useState } from "react";
import { Trash2, Edit2, Save, X, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Noticia, getNoticias, saveNoticias } from "@/lib/noticiasStore";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

const AdminNoticias = () => {
  const [noticias, setNoticias] = useState<Noticia[]>(getNoticias());
  const [tab, setTab] = useState<"local" | "regional">("local");

  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState<"local" | "regional">("local");
  const [imagem, setImagem] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = noticias.filter(n => n.categoria === tab);

  const handleSave = () => {
    if (!titulo.trim() || !resumo.trim()) return;
    const now = new Date();
    const data = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;

    let updated: Noticia[];
    if (editId) {
      updated = noticias.map(n => n.id === editId
        ? { ...n, titulo, resumo, conteudo, categoria, imagem: imagem || n.imagem || "", data }
        : n);
    } else {
      updated = [...noticias, { id: crypto.randomUUID(), titulo, resumo, conteudo, categoria, imagem, data }];
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
  };

  const handleDelete = (id: string) => {
    const updated = noticias.filter(n => n.id !== id);
    saveNoticias(updated);
    setNoticias(updated);
  };

  const resetForm = () => {
    setEditId(null); setTitulo(""); setResumo(""); setConteudo(""); setImagem("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Notícias</h2>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab("local")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === "local" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
          Locais
        </button>
        <button onClick={() => setTab("regional")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === "regional" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
          Regionais
        </button>
      </div>

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
              <select value={categoria} onChange={e => setCategoria(e.target.value as "local" | "regional")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="local">Local</option>
                <option value="regional">Regional</option>
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
          <div className="space-y-2">
            <Label>Imagem (opcional)</Label>
            <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm h-10">
              <Upload className="w-4 h-4" /> Escolher imagem
              <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setImagem(await fileToBase64(f)); }} />
            </label>
          </div>
          {imagem && <img src={imagem} alt="Preview" className="h-24 rounded-lg object-cover border border-border" />}
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> {editId ? "Atualizar" : "Publicar"}</Button>
            {editId && <Button variant="ghost" onClick={resetForm} className="gap-2"><X className="w-4 h-4" /> Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.map(n => (
          <Card key={n.id}>
            <CardContent className="p-4 flex items-center gap-4">
              {n.imagem && <img src={n.imagem} alt={n.titulo} className="w-16 h-16 rounded-lg object-cover border border-border" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{n.titulo}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{n.resumo}</p>
                <span className="text-xs text-muted-foreground">{n.data} · {n.categoria === "local" ? "Local" : "Regional"}</span>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(n)}><Edit2 className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(n.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma notícia {tab === "local" ? "local" : "regional"} cadastrada.</p>}
      </div>
    </div>
  );
};

export default AdminNoticias;
