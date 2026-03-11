import { useState, useEffect } from "react";
import { Users, Shield, ShieldCheck, Trash2, Plus, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";

const ALL_PERMISSIONS = [
  { id: "streaming", label: "Player / Redes Sociais" },
  { id: "aparencia", label: "Aparência / Layout" },
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

  // Form for new user
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    // Since we can't list auth.users, we list from public.user_permissions
    // and assume users must be registered there to be managed here.
    const { data, error } = await supabase
      .from("user_permissions")
      .select("*, profile:user_id (email)"); // Requires a 'profiles' or similar if email is needed

    if (error) {
      if (error.code === "PGRST116" || error.message.includes("does not exist")) {
        setError("Tabela 'user_permissions' não encontrada. Peça ao desenvolvedor para executar o SQL de setup.");
      } else {
        setError(error.message);
      }
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newEmail || !newPassword) return;
    setLoading(true);
    
    // Note: Creating users for OTHERS usually needs Service Role or an Edge Function.
    // If we use signUp, it might logout the current user or requires email confirmation.
    // A better way is using a custom Edge Function. 
    // For now, we inform that this requires setup.
    
    alert("Para criar novos usuários, é necessário configurar uma Edge Function no Supabase para evitar o logout do administrador atual. Contate o suporte técnico.");
    
    setLoading(false);
  };

  const togglePermission = (id: string) => {
    setNewPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  if (!isAdmin) return <div>Acesso restrito ao Administrador Master.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Usuários e Permissões</h2>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
          {isAdding ? "Cancelar" : <><Plus className="w-4 h-4 mr-2" /> Novo Usuário</>}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">{error}</p>
              <pre className="text-[10px] bg-black/20 p-2 rounded overflow-auto max-w-full">
{`CREATE TABLE public.user_permissions (
  user_id UUID PRIMARY KEY,
  permissions TEXT[] DEFAULT '{}',
  email TEXT -- Armazenar e-mail para exibição
);`}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Colaborador</CardTitle>
            <CardDescription>Crie um acesso limitado para membros da equipe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="colaborador@radio.com" />
              </div>
              <div className="space-y-2">
                <Label>Senha Temporária</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Permissões de Acesso</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {ALL_PERMISSIONS.map((perm) => (
                  <div key={perm.id} className="flex items-center space-x-2 border border-border/50 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <Checkbox 
                      id={`perm-${perm.id}`} 
                      checked={newPermissions.includes(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id)}
                    />
                    <label htmlFor={`perm-${perm.id}`} className="text-sm cursor-pointer select-none">
                      {perm.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleAddUser} disabled={loading} className="w-full md:w-auto">
              {loading ? "Processando..." : "Criar Usuário"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {users.length === 0 && !loading && !error && (
          <p className="text-center py-12 text-muted-foreground italic">Nenhum colaborador secundário cadastrado.</p>
        )}
        
        {users.map((u) => (
          <Card key={u.user_id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{u.email || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground">ID: {u.user_id.substring(0,8)}...</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="p-4">
                <Label className="text-[10px] uppercase text-muted-foreground mb-2 block">Acessos Ativos</Label>
                <div className="flex flex-wrap gap-2">
                  {u.permissions?.length > 0 ? u.permissions.map((p: string) => (
                    <span key={p} className="px-2 py-1 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold uppercase border border-secondary/20">
                      {ALL_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                    </span>
                  )) : <span className="text-xs text-muted-foreground italic">Nenhuma permissão concedida</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsuarios;
