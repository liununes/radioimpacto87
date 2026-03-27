import { useState, useEffect } from "react";
import { Users, Shield, ShieldCheck, Trash2, Plus, Save, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const ALL_PERMISSIONS = [
  { id: "*", label: "Acesso Total (Master)" },
  { id: "streaming", label: "Vídeos & Redes Sociais" },
  { id: "aparencia", label: "Personalizar Site & Cores" },
  { id: "media", label: "Arquivos / Mídia" },
  { id: "locutores", label: "Equipe Locutores" },
  { id: "programacao", label: "Grade de Horários" },
  { id: "noticias", label: "Notícias / Blog" },
  { id: "entretenimento", label: "Canal Entretenimento" },
  { id: "pedidos", label: "Mural de Pedidos" },
  { id: "promocoes", label: "Promoções & Sorteios" },
  { id: "patrocinadores", label: "Patrocinadores / Apoio" },
  { id: "slides", label: "Banners do Topo" },
  { id: "fotos", label: "Galeria de Fotos" },
  { id: "sobre", label: "Sobre a Rádio" },
  { id: "estatisticas", label: "Relatórios de Acesso" },
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
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  VALUES (
    new_uid, '00000000-0000-0000-0000-000000000000', internal_email, 
    hashed_password, now(), '{"provider":"email","providers":["email"]}'::jsonb,
    p_metadata || jsonb_build_object('username', p_username, 'display_name', p_display_name),
    now(), now(), 'authenticated', 'authenticated',
    '', '', '', ''
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
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Equipe & <span className="text-secondary italic">Acessos</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Gerencie quem pode editar cada seção da rádio</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-primary text-white hover:bg-primary/90 transition-all shadow-lg active:scale-95">
             <Plus className="w-4 h-4 mr-2" /> Novo Colaborador
          </Button>
        )}
      </div>

      {error && (
        <Card className="rounded-none border-none bg-red-50 p-6 flex items-center justify-between border border-red-100">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white text-slate-900 rounded-none flex items-center justify-center shadow-sm text-red-500">
                 <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Erro de Configuração</p>
                 <p className="text-xs font-bold text-red-900 mt-1">{error}</p>
              </div>
           </div>
           <Button variant="outline" size="sm" onClick={copyRepairSQL} className="rounded-none border-red-200 text-red-600 font-black uppercase text-[9px] tracking-widest bg-white text-slate-900">
              <Save className="w-3.5 h-3.5 mr-2" /> Copiar SQL Fix
           </Button>
        </Card>
      )}

      {(isAdding || editingUser) && (
        <Card className="rounded-none border-none shadow-2xl bg-white text-slate-900 overflow-hidden animate-in zoom-in-95 duration-500">
          <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
            <div>
               <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">
                 {editingUser ? `Configurar: ${editingUser.username}` : "Dados do Novo Colaborador"}
               </CardTitle>
               <p className="text-[10px] font-bold text-gray-300 uppercase mt-2">Defina as credenciais e o nível de acesso</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-none h-12 w-12" onClick={() => { setIsAdding(false); setEditingUser(null); }}>
               <X className="w-6 h-6 text-gray-300" />
            </Button>
          </CardHeader>
          <CardContent className="p-10 pt-4 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Login de Acesso</Label>
                 <Input 
                   disabled={!!editingUser}
                   value={editingUser ? editingUser.username : newUsername} 
                   onChange={e => editingUser ? setEditingUser({...editingUser, username: e.target.value}) : setNewUsername(e.target.value)} 
                   placeholder="Ex: joao_silva" 
                   className="h-14 rounded-none border-gray-100 bg-gray-50 font-bold text-primary"
                 />
               </div>
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome de Exibição</Label>
                 <Input 
                   value={editingUser ? (editingUser.display_name || "") : newDisplayName} 
                   onChange={e => editingUser ? setEditingUser({...editingUser, display_name: e.target.value}) : setNewDisplayName(e.target.value)} 
                   placeholder="Ex: João da Silva" 
                   className="h-14 rounded-none border-gray-100 bg-gray-50 font-bold text-primary"
                 />
               </div>
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {editingUser ? "Nova Senha (Opcional)" : "Senha do Colaborador"}
                 </Label>
                 <Input 
                   type="password" 
                   value={editingUser ? (editingUser.new_password || "") : newPassword} 
                   onChange={e => editingUser ? setEditingUser({...editingUser, new_password: e.target.value}) : setNewPassword(e.target.value)} 
                   placeholder={editingUser ? "********" : "Mínimo 6 dígitos"}
                   className="h-14 rounded-none border-gray-100 bg-gray-50 font-bold text-primary"
                 />
               </div>
            </div>

            <div className="space-y-6">
               <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Módulos que este usuário pode gerenciar</Label>
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = editingUser ? editingUser.permissions.includes(perm.id) : newPermissions.includes(perm.id);
                    return (
                      <button 
                        key={perm.id} 
                        type="button"
                        onClick={() => editingUser ? toggleEditPermission(perm.id) : togglePermission(perm.id)}
                        className={`flex items-center gap-3 p-4 rounded-none border text-left transition-all ${
                          isChecked 
                            ? "bg-primary border-primary shadow-lg shadow-blue-900/10" 
                            : "bg-background border-gray-100 hover:border-primary/20"
                        }`}
                      >
                         <div className={`w-5 h-5 rounded-none flex items-center justify-center transition-colors ${isChecked ? 'bg-secondary text-primary' : 'bg-gray-100'}`}>
                            {isChecked && <ShieldCheck className="w-3.5 h-3.5" />}
                         </div>
                         <span className={`text-[10px] font-black uppercase tracking-tight ${isChecked ? 'text-white' : 'text-gray-400'}`}>
                            {perm.label}
                         </span>
                      </button>
                    )
                  })}
               </div>
            </div>

            <div className="pt-6 border-t border-gray-50">
               <Button onClick={editingUser ? handleUpdateUser : handleAddUser} disabled={loading} className="h-16 px-12 rounded-none bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto">
                 {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : (editingUser ? <Save className="w-5 h-5 mr-3" /> : <Plus className="w-5 h-5 mr-3" />)}
                 {loading ? "Processando..." : (editingUser ? "Atualizar Usuário" : "Finalizar Cadastro")}
               </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {users.map((u) => (
          <Card key={u.user_id} className="group overflow-hidden rounded-none border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white text-slate-900">
             <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="w-14 h-14 bg-primary/5 rounded-none flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <Shield className="w-6 h-6" />
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-10 w-10 bg-gray-50 rounded-none" onClick={() => setEditingUser({ ...u })}><ShieldCheck className="w-4 h-4 text-primary" /></Button>
                      <Button size="icon" variant="ghost" className="h-10 w-10 bg-red-50 rounded-none text-red-400 hover:text-red-600" onClick={() => handleDeleteUser(u.user_id, u.email)}><Trash2 className="w-4 h-4" /></Button>
                   </div>
                </div>

                <div>
                   <h3 className="text-xl font-black text-primary uppercase italic tracking-tight truncate leading-none mb-2">{u.display_name || u.username}</h3>
                   <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">@{u.username}</span>
                </div>

                <div className="pt-4 border-t border-gray-50">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">Módulos Autorizados:</p>
                   <div className="flex flex-wrap gap-1.5">
                      {u.permissions?.map((p: string) => (
                         <span key={p} className="text-[8px] font-black bg-gray-50 text-primary/70 px-2.5 py-1 rounded-none uppercase tracking-tight border border-gray-100">
                            {ALL_PERMISSIONS.find(a => a.id === p)?.label || p}
                         </span>
                      ))}
                   </div>
                </div>
             </div>
          </Card>
        ))}
        {users.length === 0 && (
           <div className="col-span-full h-64 flex flex-col items-center justify-center bg-gray-50/50 rounded-none border-2 border-dashed border-gray-100">
              <Users className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Nenhum colaborador registrado.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsuarios;
