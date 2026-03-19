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
  const { supabase, isAdmin, hasPermission } = useAuth();
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
        setError("A tabela 'user_permissions' não existe. Execute o script de reparo no SQL Editor do Supabase.");
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

    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Criar via RPC (Pula confirmação de e-mail)
      const { data: userId, error: authError } = await (supabase as any).rpc('registrar_usuario_sem_confirmar', {
        email_input: newEmail.trim().toLowerCase(),
        password_input: newPassword,
        metadata_input: { 
          permissions: newPermissions.length > 0 ? newPermissions : ["base"] 
        }
      });

      if (authError) {
        console.error('RPC Auth Error:', authError);
        throw new Error(authError.message || "Erro no banco de dados.");
      }
      
      if (!userId) {
        throw new Error("O banco não retornou um ID. Verifique se o e-mail já existe.");
      }

      // 2. Salvar na tabela de listagem
      const { error: permError } = await supabase
        .from("user_permissions")
        .upsert({
          user_id: userId as string,
          email: newEmail.trim().toLowerCase(),
          permissions: newPermissions
        });

      if (permError) {
        console.error('Permission Table Error:', permError);
        throw new Error("Usuário criado, mas erro ao salvar permissões: " + permError.message);
      }

      toast.success("Usuário criado com sucesso!");
      setIsAdding(false);
      setNewEmail("");
      setNewPassword("");
      setNewPermissions([]);
      fetchUsers();
    } catch (err: any) {
      console.error('Final Catch Error:', err);
      toast.error(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!window.confirm(`Remover acesso de ${email}?`)) return;
    setLoading(true);
    try {
      const { error } = await (supabase as any).rpc('deletar_usuario', { target_uid: id });
      if (error) throw error;
      toast.success("Usuário removido.");
      fetchUsers();
    } catch (err: any) {
      toast.error("Erro ao remover usuário via RPC: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (id: string) => {
    setNewPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const copyRepairSQL = () => {
    const sql = `-- COPIE E COLE NO SQL EDITOR DO SUPABASE
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.user_permissions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.registrar_usuario_sem_confirmar(
  p_email TEXT,
  p_password TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_sent_at, last_sign_in_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', p_email,
    crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', p_metadata,
    now(), now(), '', '', now(), now()
  )
  RETURNING id INTO new_user_id;

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), new_user_id,
    format('{"sub":"%s","email":"%s"}', new_user_id::text, p_email)::jsonb,
    'email', now(), now(), now()
  );

  RETURN new_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.deletar_usuario(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = p_user_id;
  DELETE FROM public.user_permissions WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_usuario_sem_confirmar TO authenticated;
GRANT EXECUTE ON FUNCTION public.deletar_usuario TO authenticated;
`;
    navigator.clipboard.writeText(sql);
    toast.success("SQL copiado! Cole no Editor SQL do seu Supabase.");
  };

  if (!isAdmin && !hasPermission('usuarios')) return <div className="p-8 text-center bg-destructive/10 text-destructive rounded-lg border border-destructive/20 m-8">Acesso restrito. Sua conta não tem permissão para gerenciar usuários.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Equipe e Acessos</h2>
          <p className="text-muted-foreground">Gerencie quem pode editar cada seção da rádio.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"} className="shadow-md">
          {isAdding ? "Cancelar" : <><Plus className="w-4 h-4 mr-2" /> Novo Colaborador</>}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5 shadow-inner">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-destructive">Erro de Configuração</p>
                  <p className="mt-1 opacity-90">{error}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={copyRepairSQL} className="border-destructive/30 hover:bg-destructive/10">
                <Save className="w-4 h-4 mr-2" /> Copiar SQL Admin
              </Button>
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
