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
    const { error } = await deletePrograma(id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
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
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Grade de <span className="text-secondary italic">Programação</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Organize os horários e locutores da rádio</p>
        </div>
        {!editId && (
          <div className="flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-2xl border border-primary/10">
            <Radio className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">{programas.length} Horários Definidos</span>
          </div>
        )}
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white text-slate-900 overflow-hidden">
        <CardHeader className="p-10 pb-4">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">{editId ? "Editar Programa Existente" : "Registrar Novo Programa"}</CardTitle>
        </CardHeader>
        <CardContent className="p-10 pt-4 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome do Show / Programa</Label>
                  <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Manhã Total Clube" className="h-14 rounded-2xl border-gray-100 bg-gray-50 text-lg font-bold text-primary" />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Locutor Responsável</Label>
                  <select value={locutorId} onChange={e => setLocutorId(e.target.value)}
                    className="flex h-14 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <option value="">Selecione um locutor</option>
                    {locutores.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                  </select>
                </div>
             </div>

             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Horário de Início</Label>
                     <Input type="time" value={inicio} onChange={e => setInicio(e.target.value)} className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold" />
                   </div>
                   <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Horário de Término</Label>
                     <Input type="time" value={fim} onChange={e => setFim(e.target.value)} className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold" />
                   </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Capa do Programa</Label>
                  <div className="flex items-center gap-6">
                     <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                        {foto ? <img src={foto} alt="Preview" className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-gray-200" />}
                     </div>
                     <label className="flex-1 h-14 bg-white text-slate-900 border border-gray-100 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all font-black uppercase text-[10px] tracking-widest text-primary shadow-sm">
                        <Upload className="w-4 h-4" /> Importar Arte
                        <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setFoto(await fileToBase64(f)); }} />
                     </label>
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold">600×600px · JPG ou PNG</p>
                </div>
             </div>
          </div>

          <div className="space-y-4 pt-6 mt-6 border-t border-gray-50">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dias de Exibição</Label>
            <div className="flex flex-wrap gap-4">
              {DIAS.map((dia, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => toggleDia(i)}
                  className={`px-6 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                    dias.includes(i) 
                      ? "bg-primary text-white border-primary shadow-lg shadow-blue-900/10" 
                      : "bg-white text-slate-900 text-gray-400 border-gray-100 hover:border-primary/20"
                  }`}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-gray-50 flex gap-4">
            <Button onClick={handleSave} className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50" disabled={locutores.length === 0 || loading}>
               {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
               {editId ? "Salvar Alterações" : "Publicar Programa"}
            </Button>
            {editId && (
              <Button variant="ghost" onClick={resetForm} className="h-16 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:text-red-500">
                <X className="w-4 h-4 mr-2" /> Cancelar Edição
              </Button>
            )}
          </div>
          {locutores.length === 0 && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic pt-4">⚠ Cadastre um locutor antes de criar programas.</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {programas.map(prog => (
          <Card key={prog.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white text-slate-900">
            <CardContent className="p-8 flex items-center gap-8">
              <div className="relative shrink-0">
                 <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-gray-50 group-hover:border-primary/5 transition-all duration-500">
                    {prog.foto ? (
                      <img src={prog.foto} alt={prog.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-primary/5 flex items-center justify-center"><Radio className="w-8 h-8 text-primary/20" /></div>
                    )}
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/20 text-primary font-black text-xs">
                    <Radio className="w-5 h-5" />
                 </div>
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-col">
                   <h3 className="text-lg font-black text-primary uppercase italic tracking-tight truncate leading-none">{prog.nome}</h3>
                   <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">{getLocutorNome(prog.locutorId)}</span>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-black text-primary/50 uppercase">
                   <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-secondary">●</span> {prog.horaInicio} - {prog.horaFim}
                   </div>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {prog.diasSemana.sort().map(d => (
                    <span key={d} className="text-[8px] font-black bg-primary/5 text-primary px-2.5 py-1 rounded-full uppercase tracking-widest border border-primary/5">{DIAS[d]}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-10 w-10 bg-gray-50 rounded-xl" onClick={() => handleEdit(prog)}><Edit2 className="w-4 h-4 text-primary" /></Button>
                <Button size="icon" variant="ghost" className="h-10 w-10 bg-red-50 rounded-xl text-red-400 hover:text-red-600" onClick={() => handleDelete(prog.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {programas.length === 0 && (
           <div className="col-span-full h-64 flex flex-col items-center justify-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
              <Radio className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Nenhum programa na grade ainda.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminProgramacao;
