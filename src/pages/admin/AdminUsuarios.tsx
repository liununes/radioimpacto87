import { useState, useEffect } from "react";
import { Users, Shield, ShieldCheck, Trash2, Plus, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const ALL_PERMISSIONS = [
  { id: "*", label: "Acesso Total (Master)" },
  { id: "streaming", label: "Player / Redes Sociais" },
  { id: "aparencia", label: "Aparência / Layout" },
  { id: "top3", label: "Top 3 Músicas" },
  { id: "locutores", label: "Locutores" },
  { id: "programacao", label: "Programação" },
  { id: "slides", label: "Slides / Banners" },
  { id: "fotos", label: "Galeria de Fotos" },
  { id: "pedidos", label: "Pedidos Musicais" },
  { id: "noticias", label: "Notícias" },
  { id: "sobre", label: "Sobre a Rádio" },
  { id: "usuarios", label: "Gerenciar Usuários" },
];

const AdminUsuarios = () => {
  const { supabase, isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_permissions")
      .select("*")
      .order('email');

    if (error) {
      if (error.code === "PGRST116" || error.message.includes("does not exist")) {
        setError("Configuração pendente: Execute o script SQL de reparo.");
      } else {
        setError(error.message);
      }
    } else {
      setUsers(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newEmail || !newPassword) {
      toast.error("Preencha e-mail e senha!");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Criar via RPC (Pula confirmação de e-mail)
      const { data: userId, error: authError } = await supabase.rpc('registrar_usuario_sem_confirmar', {
        p_email: newEmail,
        p_password: newPassword,
        p_metadata: { 
          permissions: newPermissions.length > 0 ? newPermissions : ["base"] 
        }
      });

      if (authError) throw authError;
      if (!userId) throw new Error("Erro ao gerar ID do usuário.");

      // 2. Salvar na tabela de listagem
      const { error: permError } = await supabase
        .from("user_permissions")
        .insert({
          user_id: userId,
          email: newEmail,
          permissions: newPermissions
        });

      if (permError) throw permError;

      toast.success("Usuário criado com sucesso!");
      setIsAdding(false);
      setNewEmail("");
      setNewPassword("");
      setNewPermissions([]);
      fetchUsers();
    } catch (err: any) {
      console.error('Error adding user:', err);
      toast.error(err.message || "Erro ao criar usuário. Verifique o SQL.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!window.confirm(`Remover acesso de ${email}?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('deletar_usuario', { p_user_id: id });
      if (error) throw error;
      toast.success("Usuário removido.");
      fetchUsers();
    } catch (err: any) {
      toast.error("Erro ao remover usuário.");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (id: string) => {
    setNewPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  if (!isAdmin) return <div className="p-8 text-center">Acesso restrito ao Administrador.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Usuários e Permissões</h2>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
          {isAdding ? "Cancelar" : <><Plus className="w-4 h-4 mr-2" /> Novo Usuário</>}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div className="text-sm">
                <p className="font-bold text-destructive">{error}</p>
                <p className="mt-2 opacity-70">Certifique-se de ter executado as funções RPC no SQL Editor para habilitar o cadastro sem e-mail.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdding && (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>Novo Colaborador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@radio.com" />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_PERMISSIONS.map((perm) => (
                <div key={perm.id} className="flex items-center space-x-2 border p-2 rounded hover:bg-muted">
                  <Checkbox 
                    id={`p-${perm.id}`} 
                    checked={newPermissions.includes(perm.id)}
                    onCheckedChange={() => togglePermission(perm.id)}
                  />
                  <label htmlFor={`p-${perm.id}`} className="text-xs cursor-pointer">{perm.label}</label>
                </div>
              ))}
            </div>

            <Button onClick={handleAddUser} disabled={loading} className="w-full">
              {loading ? "Processando..." : "Finalizar Cadastro"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {users.map((u) => (
          <Card key={u.user_id} className="hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between p-4 bg-muted/20">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{u.email}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{u.user_id.substring(0,8)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteUser(u.user_id, u.email)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {u.permissions?.map((p: string) => (
                <span key={p} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20 uppercase font-bold">
                  {ALL_PERMISSIONS.find(a => a.id === p)?.label || p}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsuarios;
