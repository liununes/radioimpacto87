import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Upload, Radio, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  type Locutor,
  type Programa,
  getLocutores,
  saveLocutores,
  getProgramas,
  saveProgramas,
} from "@/lib/radioStore";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

const Dashboard = () => {
  const [locutores, setLocutores] = useState<Locutor[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);

  // Locutor form
  const [locNome, setLocNome] = useState("");
  const [locBio, setLocBio] = useState("");
  const [locFoto, setLocFoto] = useState("");
  const [editLocId, setEditLocId] = useState<string | null>(null);

  // Programa form
  const [progNome, setProgNome] = useState("");
  const [progLocutorId, setProgLocutorId] = useState("");
  const [progFoto, setProgFoto] = useState("");
  const [progInicio, setProgInicio] = useState("");
  const [progFim, setProgFim] = useState("");
  const [progDias, setProgDias] = useState<number[]>([]);
  const [editProgId, setEditProgId] = useState<string | null>(null);

  useEffect(() => {
    setLocutores(getLocutores());
    setProgramas(getProgramas());
  }, []);

  // --- Locutores ---
  const handleSaveLocutor = () => {
    if (!locNome.trim()) return;
    let updated: Locutor[];
    if (editLocId) {
      updated = locutores.map(l =>
        l.id === editLocId ? { ...l, nome: locNome, bio: locBio, foto: locFoto || l.foto } : l
      );
    } else {
      updated = [...locutores, { id: crypto.randomUUID(), nome: locNome, bio: locBio, foto: locFoto }];
    }
    saveLocutores(updated);
    setLocutores(updated);
    resetLocForm();
  };

  const handleEditLocutor = (loc: Locutor) => {
    setEditLocId(loc.id);
    setLocNome(loc.nome);
    setLocBio(loc.bio);
    setLocFoto(loc.foto);
  };

  const handleDeleteLocutor = (id: string) => {
    const updated = locutores.filter(l => l.id !== id);
    saveLocutores(updated);
    setLocutores(updated);
  };

  const resetLocForm = () => {
    setEditLocId(null);
    setLocNome("");
    setLocBio("");
    setLocFoto("");
  };

  // --- Programas ---
  const handleSavePrograma = () => {
    if (!progNome.trim() || !progLocutorId || !progInicio || !progFim || progDias.length === 0) return;
    let updated: Programa[];
    if (editProgId) {
      updated = programas.map(p =>
        p.id === editProgId
          ? { ...p, nome: progNome, locutorId: progLocutorId, foto: progFoto || p.foto, horaInicio: progInicio, horaFim: progFim, diasSemana: progDias }
          : p
      );
    } else {
      updated = [
        ...programas,
        { id: crypto.randomUUID(), nome: progNome, locutorId: progLocutorId, foto: progFoto, horaInicio: progInicio, horaFim: progFim, diasSemana: progDias },
      ];
    }
    saveProgramas(updated);
    setProgramas(updated);
    resetProgForm();
  };

  const handleEditPrograma = (prog: Programa) => {
    setEditProgId(prog.id);
    setProgNome(prog.nome);
    setProgLocutorId(prog.locutorId);
    setProgFoto(prog.foto);
    setProgInicio(prog.horaInicio);
    setProgFim(prog.horaFim);
    setProgDias(prog.diasSemana);
  };

  const handleDeletePrograma = (id: string) => {
    const updated = programas.filter(p => p.id !== id);
    saveProgramas(updated);
    setProgramas(updated);
  };

  const resetProgForm = () => {
    setEditProgId(null);
    setProgNome("");
    setProgLocutorId("");
    setProgFoto("");
    setProgInicio("");
    setProgFim("");
    setProgDias([]);
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setter(base64);
    }
  };

  const toggleDia = (dia: number) => {
    setProgDias(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
  };

  const getLocutorNome = (id: string) => locutores.find(l => l.id === id)?.nome || "—";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-sm text-muted-foreground">Impacto FM 87.9</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {locutores.length} locutores</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {programas.length} programas</span>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6">
        <Tabs defaultValue="locutores" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="locutores" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Locutores
            </TabsTrigger>
            <TabsTrigger value="programacao" className="flex items-center gap-2">
              <Radio className="w-4 h-4" /> Programação
            </TabsTrigger>
          </TabsList>

          {/* ===== LOCUTORES ===== */}
          <TabsContent value="locutores" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editLocId ? "Editar Locutor" : "Novo Locutor"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={locNome} onChange={e => setLocNome(e.target.value)} placeholder="Nome do locutor" />
                  </div>
                  <div className="space-y-2">
                    <Label>Foto</Label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm">
                        <Upload className="w-4 h-4" /> Escolher foto
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleFotoUpload(e, setLocFoto)} />
                      </label>
                      {locFoto && <img src={locFoto} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-border" />}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea value={locBio} onChange={e => setLocBio(e.target.value)} placeholder="Breve descrição do locutor" rows={2} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveLocutor} className="gap-2">
                    <Save className="w-4 h-4" /> {editLocId ? "Atualizar" : "Salvar"}
                  </Button>
                  {editLocId && (
                    <Button variant="ghost" onClick={resetLocForm} className="gap-2">
                      <X className="w-4 h-4" /> Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lista de locutores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locutores.map(loc => (
                <Card key={loc.id} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    {loc.foto ? (
                      <img src={loc.foto} alt={loc.nome} className="w-14 h-14 rounded-full object-cover border-2 border-primary/30" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xl font-bold">
                        {loc.nome.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{loc.nome}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{loc.bio || "Sem bio"}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEditLocutor(loc)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteLocutor(loc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {locutores.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  Nenhum locutor cadastrado. Adicione o primeiro acima.
                </p>
              )}
            </div>
          </TabsContent>

          {/* ===== PROGRAMAÇÃO ===== */}
          <TabsContent value="programacao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editProgId ? "Editar Programa" : "Novo Programa"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Programa</Label>
                    <Input value={progNome} onChange={e => setProgNome(e.target.value)} placeholder="Ex: Manhã Total" />
                  </div>
                  <div className="space-y-2">
                    <Label>Locutor</Label>
                    <select
                      value={progLocutorId}
                      onChange={e => setProgLocutorId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Selecione um locutor</option>
                      {locutores.map(l => (
                        <option key={l.id} value={l.id}>{l.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Hora Início</Label>
                    <Input type="time" value={progInicio} onChange={e => setProgInicio(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora Fim</Label>
                    <Input type="time" value={progFim} onChange={e => setProgFim(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Foto do Programa</Label>
                    <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm h-10">
                      <Upload className="w-4 h-4" /> Escolher foto
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFotoUpload(e, setProgFoto)} />
                    </label>
                  </div>
                </div>

                {progFoto && (
                  <img src={progFoto} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-border" />
                )}

                <div className="space-y-2">
                  <Label>Dias da Semana</Label>
                  <div className="flex flex-wrap gap-2">
                    {DIAS.map((dia, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={progDias.includes(i)}
                          onCheckedChange={() => toggleDia(i)}
                        />
                        <span className="text-sm">{dia}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSavePrograma} className="gap-2" disabled={locutores.length === 0}>
                    <Save className="w-4 h-4" /> {editProgId ? "Atualizar" : "Salvar"}
                  </Button>
                  {editProgId && (
                    <Button variant="ghost" onClick={resetProgForm} className="gap-2">
                      <X className="w-4 h-4" /> Cancelar
                    </Button>
                  )}
                </div>
                {locutores.length === 0 && (
                  <p className="text-sm text-secondary">⚠ Cadastre um locutor antes de criar programas.</p>
                )}
              </CardContent>
            </Card>

            {/* Lista de programas */}
            <div className="space-y-3">
              {programas.map(prog => (
                <Card key={prog.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    {prog.foto ? (
                      <img src={prog.foto} alt={prog.nome} className="w-16 h-16 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                        <Radio className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{prog.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        Locutor: {getLocutorNome(prog.locutorId)} · {prog.horaInicio} - {prog.horaFim}
                      </p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {prog.diasSemana.sort().map(d => (
                          <span key={d} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{DIAS[d]}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEditPrograma(prog)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeletePrograma(prog.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {programas.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum programa cadastrado.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
