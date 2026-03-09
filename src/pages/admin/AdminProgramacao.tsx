import { useState, useEffect } from "react";
import { Trash2, Edit2, Save, X, Upload, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Programa, getLocutores, getProgramas, saveProgramas } from "@/lib/radioStore";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

const AdminProgramacao = () => {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const locutores = getLocutores();

  const [nome, setNome] = useState("");
  const [locutorId, setLocutorId] = useState("");
  const [foto, setFoto] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [dias, setDias] = useState<number[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { setProgramas(getProgramas()); }, []);

  const handleSave = () => {
    if (!nome.trim() || !locutorId || !inicio || !fim || dias.length === 0) return;
    let updated: Programa[];
    if (editId) {
      updated = programas.map(p => p.id === editId
        ? { ...p, nome, locutorId, foto: foto || p.foto, horaInicio: inicio, horaFim: fim, diasSemana: dias } : p);
    } else {
      updated = [...programas, { id: crypto.randomUUID(), nome, locutorId, foto, horaInicio: inicio, horaFim: fim, diasSemana: dias }];
    }
    saveProgramas(updated);
    setProgramas(updated);
    resetForm();
  };

  const handleEdit = (prog: Programa) => {
    setEditId(prog.id); setNome(prog.nome); setLocutorId(prog.locutorId);
    setFoto(prog.foto); setInicio(prog.horaInicio); setFim(prog.horaFim); setDias(prog.diasSemana);
  };

  const handleDelete = (id: string) => {
    const updated = programas.filter(p => p.id !== id);
    saveProgramas(updated);
    setProgramas(updated);
  };

  const resetForm = () => { setEditId(null); setNome(""); setLocutorId(""); setFoto(""); setInicio(""); setFim(""); setDias([]); };

  const toggleDia = (d: number) => setDias(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const getLocutorNome = (id: string) => locutores.find(l => l.id === id)?.nome || "—";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Programação</h2>
      <Card>
        <CardHeader><CardTitle className="text-lg">{editId ? "Editar Programa" : "Novo Programa"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Programa</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Manhã Total" />
            </div>
            <div className="space-y-2">
              <Label>Locutor</Label>
              <select value={locutorId} onChange={e => setLocutorId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Selecione um locutor</option>
                {locutores.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Hora Início</Label>
              <Input type="time" value={inicio} onChange={e => setInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hora Fim</Label>
              <Input type="time" value={fim} onChange={e => setFim(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Foto do Programa</Label>
              <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm h-10">
                <Upload className="w-4 h-4" /> Escolher foto
                <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setFoto(await fileToBase64(f)); }} />
              </label>
            </div>
          </div>
          {foto && <img src={foto} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-border" />}
          <div className="space-y-2">
            <Label>Dias da Semana</Label>
            <div className="flex flex-wrap gap-2">
              {DIAS.map((dia, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={dias.includes(i)} onCheckedChange={() => toggleDia(i)} />
                  <span className="text-sm">{dia}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2" disabled={locutores.length === 0}>
              <Save className="w-4 h-4" /> {editId ? "Atualizar" : "Salvar"}
            </Button>
            {editId && <Button variant="ghost" onClick={resetForm} className="gap-2"><X className="w-4 h-4" /> Cancelar</Button>}
          </div>
          {locutores.length === 0 && <p className="text-sm text-secondary">⚠ Cadastre um locutor antes de criar programas.</p>}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {programas.map(prog => (
          <Card key={prog.id}>
            <CardContent className="p-4 flex items-center gap-4">
              {prog.foto ? (
                <img src={prog.foto} alt={prog.nome} className="w-16 h-16 rounded-lg object-cover border border-border" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center"><Radio className="w-6 h-6 text-muted-foreground" /></div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{prog.nome}</h3>
                <p className="text-sm text-muted-foreground">Locutor: {getLocutorNome(prog.locutorId)} · {prog.horaInicio} - {prog.horaFim}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {prog.diasSemana.sort().map(d => (
                    <span key={d} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{DIAS[d]}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(prog)}><Edit2 className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(prog.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {programas.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum programa cadastrado.</p>}
      </div>
    </div>
  );
};

export default AdminProgramacao;
