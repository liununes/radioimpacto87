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

  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_permissions")
      .select("*")
      .order('username');

    if (error) {
      if (error.code === "PGRST116" || error.message.includes("does not exist")) {
        setError("A tabela 'user_permissions' precisa ser atualizada para suportar nomes. Execute o script repair_users.sql.");
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
    if (!newUsername || !newPassword) {
      toast.error("Preencha o nome de usuário e senha!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Criar via RPC por Nome
      const { data: userId, error: authError } = await (supabase as any).rpc('registrar_usuario_por_nome', {
        p_username: newUsername.trim().toLowerCase(),
        p_password: newPassword,
        p_display_name: newDisplayName,
        p_metadata: { 
          permissions: newPermissions.length > 0 ? newPermissions : ["base"] 
        }
      });

      if (authError) throw new Error(authError.message || "Erro ao criar usuário.");
      
      if (authError) throw new Error(authError.message || "Erro ao criar usuário.");
      
      if (!userId) {
        throw new Error("O banco não retornou um ID. Tente outro nome de usuário.");
      }

      toast.success("Colaborador cadastrado com sucesso!");
      setIsAdding(false);
      setNewUsername("");
      setNewDisplayName("");
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

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setLoading(true);
    try {
      // 1. Atualiza via RPC (Metadata e Senha opcional)
      const { error: authError } = await (supabase as any).rpc('atualizar_usuario', {
        p_user_id: editingUser.user_id,
        p_display_name: editingUser.display_name,
        p_password: editingUser.new_password || null,
        p_metadata: { permissions: editingUser.permissions }
      });

      if (authError) throw authError;

      if (authError) throw authError;

      toast.success("Usuário atualizado!");
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error("Erro ao atualizar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!window.confirm(`Remover acesso?`)) return;
    setLoading(true);
    try {
      const { error } = await (supabase as any).rpc('deletar_usuario', { target_uid: id });
      if (error) throw error;
      toast.success("Usuário removido.");
      fetchUsers();
    } catch (err: any) {
      toast.error("Erro ao remover: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (id: string) => {
    setNewPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleEditPermission = (id: string) => {
    if (!editingUser) return;
    const newPerms = editingUser.permissions.includes(id)
      ? editingUser.permissions.filter((p: string) => p !== id)
      : [...editingUser.permissions, id];
    setEditingUser({ ...editingUser, permissions: newPerms });
  };

  const copyRepairSQL = () => {
    const sql = `-- COPIE E COLE NO SQL EDITOR DO SUPABASE (SISTEMA DE NOMES)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.user_permissions ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.user_permissions ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 1. Registro por Nome
CREATE OR REPLACE FUNCTION public.registrar_usuario_por_nome(
  p_username TEXT,
  p_password TEXT,
  p_display_name TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
DECLARE
  new_uid UUID := gen_random_uuid();
  internal_email TEXT;
  hashed_password TEXT;
BEGIN
  internal_email := LOWER(TRIM(p_username)) || '@radio.internal';
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = internal_email) THEN
    RAISE EXCEPTION 'USUARIO_EXISTENTE';
  END IF;

  hashed_password := extensions.crypt(p_password, extensions.gen_salt('bf'));

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  )
  VALUES (
    new_uid, '00000000-0000-0000-0000-000000000000', internal_email, 
    hashed_password, now(), '{"provider":"email","providers":["email"]}'::jsonb,
    p_metadata || jsonb_build_object('username', p_username, 'display_name', p_display_name),
    now(), now(), 'authenticated', 'authenticated'
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), new_uid, 
    jsonb_build_object('sub', new_uid::text, 'email', internal_email, 'email_verified', true), 
    'email', new_uid::text, now(), now(), now()
  );

  INSERT INTO public.user_permissions (
    user_id, username, display_name, permissions
  ) VALUES (
    new_uid, p_username, p_display_name, 
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(NULLIF(p_metadata->'permissions', 'null'::jsonb), '["base"]'::jsonb)))
  );

  RETURN new_uid;
END;
$$;

-- 2. Atualização de Usuário
CREATE OR REPLACE FUNCTION public.atualizar_usuario(
  p_user_id UUID,
  p_display_name TEXT DEFAULT NULL,
  p_password TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
BEGIN
  UPDATE auth.users
  SET 
    raw_user_meta_data = raw_user_meta_data || 
                         CASE WHEN p_display_name IS NOT NULL THEN jsonb_build_object('display_name', p_display_name) ELSE '{}'::jsonb END ||
                         p_metadata,
    updated_at = now()
  WHERE id = p_user_id;

  IF p_password IS NOT NULL AND p_password <> '' THEN
    UPDATE auth.users
    SET encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf'))
    WHERE id = p_user_id;
  END IF;

  UPDATE public.user_permissions
  SET
    display_name = COALESCE(p_display_name, display_name),
    permissions = CASE WHEN p_metadata ? 'permissions' THEN ARRAY(SELECT jsonb_array_elements_text(p_metadata->'permissions')) ELSE permissions END
  WHERE user_id = p_user_id;
END;
$$;

-- 3. Deleção
CREATE OR REPLACE FUNCTION public.deletar_usuario(target_uid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = target_uid;
  DELETE FROM public.user_permissions WHERE user_id = target_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_usuario_por_nome TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.atualizar_usuario TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.deletar_usuario TO authenticated, anon;
`;
    navigator.clipboard.writeText(sql);
    toast.success("SQL de Nomes copiado!");
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
                <Label>Login / Usuário (Para entrar no sistema)</Label>
                <Input 
                  value={newUsername} 
                  onChange={e => setNewUsername(e.target.value)} 
                  placeholder="Ex: joao_silva" 
                />
              </div>
              <div className="space-y-2">
                <Label>Nome Completo (Exibição)</Label>
                <Input 
                  value={newDisplayName} 
                  onChange={e => setNewDisplayName(e.target.value)} 
                  placeholder="Ex: João da Silva" 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
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

      {editingUser && (
        <Card className="border-primary bg-primary/5 shadow-xl animate-in zoom-in duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 rotate-45" /> Editando: {editingUser.username}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo (Exibição)</Label>
                <Input 
                  value={editingUser.display_name || ""} 
                  onChange={e => setEditingUser({...editingUser, display_name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Nova Senha (Deixe em branco p/ manter)</Label>
                <Input 
                  type="password" 
                  value={editingUser.new_password || ""} 
                  onChange={e => setEditingUser({...editingUser, new_password: e.target.value})} 
                  placeholder="********"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_PERMISSIONS.map((perm) => (
                <div key={perm.id} className="flex items-center space-x-2 border p-2 rounded bg-background/50 hover:bg-muted">
                  <Checkbox 
                    id={`edit-p-${perm.id}`} 
                    checked={editingUser.permissions.includes(perm.id)}
                    onCheckedChange={() => toggleEditPermission(perm.id)}
                  />
                  <label htmlFor={`edit-p-${perm.id}`} className="text-xs cursor-pointer">{perm.label}</label>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateUser} disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {users.map((u) => (
          <Card key={u.user_id} className="hover:border-primary/30 transition-all overflow-hidden group">
            <div className="flex items-center justify-between p-4 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">{u.display_name || u.username}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    USUÁRIO: <span className="text-primary font-mono">{u.username}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => setEditingUser({ ...u })}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-destructive/10 hover:text-destructive transition-colors" 
                  onClick={() => handleDeleteUser(u.user_id, u.email)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 flex flex-wrap gap-2 bg-background/40">
              {u.permissions?.map((p: string) => (
                <span key={p} className="text-[9px] bg-primary/5 text-primary/80 px-2 py-1 rounded-sm border border-primary/10 uppercase font-bold tracking-tight">
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
