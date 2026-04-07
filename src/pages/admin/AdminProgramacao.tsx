import { useState, useEffect } from "react";
import { Trash2, Edit2, Save, X, Upload, Radio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Programa, type Locutor, getLocutores, getProgramas, savePrograma, deletePrograma } from "@/lib/radioStore";
import { toast } from "sonner";

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
  const [locutores, setLocutores] = useState<Locutor[]>([]);
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [locutorId, setLocutorId] = useState("");
  const [foto, setFoto] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [dias, setDias] = useState<number[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchData = async () => {
    const [progData, locData] = await Promise.all([getProgramas(), getLocutores()]);
    setProgramas(progData);
    setLocutores(locData);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!nome.trim() || !locutorId || !inicio || !fim || dias.length === 0) {
      toast.error("Preencha todos os campos e selecione pelo menos um dia.");
      return;
    }

    setLoading(true);
    const { error } = await savePrograma({
      id: editId || undefined,
      nome,
      locutorId,
      foto,
      horaInicio: inicio,
      horaFim: fim,
      diasSemana: dias
    });

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success(editId ? "Programa atualizado!" : "Programa criado!");
      await fetchData();
      resetForm();
    }
    setLoading(false);
  };

  const handleEdit = (prog: Programa) => {
    setEditId(prog.id); setNome(prog.nome); setLocutorId(prog.locutorId);
    setFoto(prog.foto || ""); setInicio(prog.horaInicio); setFim(prog.horaFim); setDias(prog.diasSemana);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este programa?")) return;
    
    // Optimistic update
    setProgramas(prev => prev.filter(p => p.id !== id));
    
    const { error } = await deletePrograma(id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
      await fetchData(); // Revert on error
    } else {
      toast.success("Programa removido!");
      await fetchData();
    }
  };

  const resetForm = () => { setEditId(null); setNome(""); setLocutorId(""); setFoto(""); setInicio(""); setFim(""); setDias([]); };

  const toggleDia = (d: number) => setDias(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const getLocutorNome = (id: string) => locutores.find(l => l.id === id)?.nome || "—";

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Grade de Programação</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Organize os horários e locutores da rádio.</p>
        </div>
        {!editId && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg text-primary text-sm font-semibold">
            <Radio className="w-5 h-5" />
            <span>{programas.length} Horários Definidos</span>
          </div>
        )}
      </div>

      <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden">
         <CardHeader className="p-6 pb-4 border-b border-border/50">
           <CardTitle className="text-lg font-bold">{editId ? "Editar Programa Existente" : "Registrar Novo Programa"}</CardTitle>
         </CardHeader>
         <CardContent className="p-6 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Nome do Show / Programa</Label>
                  <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Manhã Total Clube" className="h-11 rounded-lg text-base" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Locutor Responsável</Label>
                  <select value={locutorId} onChange={e => setLocutorId(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="">Selecione um locutor</option>
                    {locutores.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                  </select>
                </div>
             </div>

             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="text-sm font-semibold">Horário de Início</Label>
                     <Input type="time" value={inicio} onChange={e => setInicio(e.target.value)} className="h-11 rounded-lg" />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-sm font-semibold">Horário de Término</Label>
                     <Input type="time" value={fim} onChange={e => setFim(e.target.value)} className="h-11 rounded-lg" />
                   </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Capa do Programa</Label>
                    <div className="flex items-center gap-4">
                       <div className="relative group w-16 h-16 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                          {foto ? (
                            <>
                              <img src={foto} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button type="button" onClick={() => setFoto("")} className="text-white hover:text-red-500 transition-colors" title="Remover Capa">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <Upload className="w-6 h-6 text-muted-foreground/50" />
                          )}
                       </div>
                       <label className="flex-1 h-11 bg-background text-foreground border border-border rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors font-semibold text-sm shadow-sm">
                          <Upload className="w-4 h-4" /> {foto ? "Alterar Arte" : "Importar Arte"}
                          <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setFoto(await fileToBase64(f)); }} />
                       </label>
                    </div>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Recomendado: 600×600px (JPG ou PNG)</p>
                </div>
             </div>
           </div>

           <div className="space-y-3 pt-6 border-t border-border/50">
             <Label className="text-sm font-semibold">Dias de Exibição</Label>
             <div className="flex flex-wrap gap-2">
               {DIAS.map((dia, i) => (
                 <button 
                   key={i} 
                   type="button"
                   onClick={() => toggleDia(i)}
                   className={`px-4 py-2 rounded-lg border font-semibold text-sm transition-colors ${
                     dias.includes(i) 
                       ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                       : "bg-background text-foreground border-border hover:bg-muted"
                   }`}
                 >
                   {dia}
                 </button>
               ))}
             </div>
           </div>

           <div className="pt-6 border-t border-border/50 flex flex-wrap gap-3">
             <Button onClick={handleSave} className="h-11 px-8 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm w-full sm:w-auto" disabled={locutores.length === 0 || loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {editId ? "Salvar Alterações" : "Publicar Programa"}
             </Button>
             {editId && (
               <Button variant="outline" onClick={resetForm} className="h-11 px-6 rounded-lg font-semibold w-full sm:w-auto">
                 <X className="w-4 h-4 mr-2" /> Cancelar Edição
               </Button>
             )}
           </div>
           {locutores.length === 0 && <p className="text-sm font-medium text-destructive mt-3">⚠ Cadastre um locutor antes de criar programas.</p>}
         </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programas.map(prog => (
          <Card key={prog.id} className="group overflow-hidden rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow bg-card text-card-foreground">
            <CardContent className="p-5 flex items-center gap-5">
              <div className="relative shrink-0">
                 <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-muted group-hover:border-primary/20 transition-colors">
                    {prog.foto ? (
                      <img src={prog.foto} alt={prog.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center"><Radio className="w-6 h-6 text-muted-foreground/40" /></div>
                    )}
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow-sm text-secondary-foreground font-bold">
                    <Radio className="w-4 h-4" />
                 </div>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                 <div>
                   <h3 className="text-base font-bold text-foreground truncate">{prog.nome}</h3>
                   <span className="text-sm font-medium text-muted-foreground">{getLocutorNome(prog.locutorId)}</span>
                 </div>
                
                 <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-md border border-border/50">
                       <span className="text-secondary text-[10px]">●</span> {prog.horaInicio} - {prog.horaFim}
                    </div>
                 </div>

                 <div className="flex gap-1 flex-wrap mt-1">
                   {prog.diasSemana.sort().map(d => (
                     <span key={d} className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">{DIAS[d]}</span>
                   ))}
                 </div>
              </div>

              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-muted" onClick={() => handleEdit(prog)}><Edit2 className="w-4 h-4 text-foreground" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(prog.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {programas.length === 0 && (
           <div className="col-span-full h-48 flex flex-col items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed border-border">
              <Radio className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum programa na grade ainda.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminProgramacao;
