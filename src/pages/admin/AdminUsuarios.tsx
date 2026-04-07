import { useState, useEffect } from "react";
import { Users, Shield, ShieldCheck, Trash2, Plus, Save, AlertCircle, X, Loader2, CheckSquare, Square, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const ALL_PERMISSIONS = [
  { id: "*", label: "Acesso Total (Master)" },
  { id: "estatisticas", label: "📈 Estatísticas" },
  { id: "media", label: "📁 Arquivos / Mídia" },
  { id: "aparencia_visual", label: "🎨 Identidade Visual" },
  { id: "aparencia_textos", label: "✍️ Texto & Cores" },
  { id: "aparencia_menus", label: "🔗 Menu do Site" },
  { id: "aparencia_layout", label: "🏗️ Design do Site" },
  { id: "visibilidade", label: "👁️ Seções do Site" },
  { id: "locutores", label: "🎙️ Equipe Locutores" },
  { id: "programacao", label: "📅 Programação" },
  { id: "noticias_lista", label: "📰 Lista de Notícias" },
  { id: "noticias_nova", label: "➕ Publicar Notícia" },
  { id: "noticias_categorias", label: "📂 Categorias News" },
  { id: "entretenimento", label: "📻 Entretenimento" },
  { id: "slides", label: "🖼️ Banners / Slides" },
  { id: "pedidos", label: "🎵 Mural de Pedidos" },
  { id: "fotos", label: "📸 Galeria de Fotos" },
  { id: "sobre", label: "ℹ️ Sobre a Rádio" },
  { id: "streaming_sinal", label: "📻 Sinal do Player" },
  { id: "streaming_redes", label: "🌐 Redes Sociais" },
  { id: "streaming_whatsapp", label: "💬 WhatsApp / Ouvinte" },
  { id: "patrocinadores", label: "🤝 Patrocinadores" },
  { id: "promocoes", label: "🎁 Promoções" },
  { id: "usuarios", label: "👥 Usuários / Acessos" },
  { id: "perfil", label: "👤 Editar Meu Perfil" },
  { id: "danger_zone", label: "⚠️ Zona de Perigo" },
];

const AdminUsuarios = () => {
  const { supabase, isAdmin, hasPermission } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState("");
  const [newRealEmail, setNewRealEmail] = useState("");
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
      setError(error.message);
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
      // 1. Criar via RPC por Nome (agora com suporte a e-mail opcional)
      const { data: userId, error: authError } = await (supabase as any).rpc('registrar_usuario_por_nome', {
        p_username: newUsername.trim().toLowerCase(),
        p_password: newPassword,
        p_display_name: newDisplayName,
        p_email: newRealEmail.trim() || null,
        p_metadata: { 
          permissions: newPermissions.length > 0 ? newPermissions : ["base"],
          real_email: newRealEmail.trim() || null
        }
      });

      if (authError) throw new Error(authError.message || "Erro ao criar usuário.");
      
      toast.success("Colaborador cadastrado com sucesso!");
      setIsAdding(false);
      setNewUsername("");
      setNewRealEmail("");
      setNewDisplayName("");
      setNewPassword("");
      setNewPermissions([]);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setLoading(true);
    try {
      const { error: authError } = await (supabase as any).rpc('atualizar_usuario', {
        p_user_id: editingUser.user_id,
        p_username: editingUser.username.trim().toLowerCase(),
        p_display_name: editingUser.display_name,
        p_password: editingUser.new_password || null,
        p_email: editingUser.email_real || null,
        p_metadata: { 
          permissions: editingUser.permissions,
          real_email: editingUser.email_real || null
        }
      });

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

  const handleDeleteUser = async (id: string) => {
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

  const selectAllPermissions = () => {
    const allIds = ALL_PERMISSIONS.map(p => p.id);
    if (editingUser) setEditingUser({ ...editingUser, permissions: allIds });
    else setNewPermissions(allIds);
    toast.success("Todos os módulos selecionados!");
  };

  const clearAllPermissions = () => {
    if (editingUser) setEditingUser({ ...editingUser, permissions: ["base"] });
    else setNewPermissions(["base"]);
    toast.info("Seleções limpas.");
  };

  const repairDatabase = () => {
    const sql = `-- ATUALIZE O SISTEMA DE EMAILS NO SQL EDITOR DA VPS
ALTER TABLE public.user_permissions ADD COLUMN IF NOT EXISTS email_real TEXT;

CREATE OR REPLACE FUNCTION public.registrar_usuario_por_nome(
  p_username TEXT,
  p_password TEXT,
  p_display_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
DECLARE
  new_uid UUID := gen_random_uuid();
  final_email TEXT;
  hashed_password TEXT;
BEGIN
  final_email := COALESCE(p_email, LOWER(TRIM(p_username)) || '@radio.internal');
  
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = final_email) THEN
    RAISE EXCEPTION 'USUARIO_EXISTENTE';
  END IF;

  hashed_password := extensions.crypt(p_password, extensions.gen_salt('bf'));

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  VALUES (
    new_uid, '00000000-0000-0000-0000-000000000000', final_email, 
    hashed_password, now(), '{"provider":"email","providers":["email"]}'::jsonb,
    p_metadata || jsonb_build_object('username', p_username, 'display_name', p_display_name, 'real_email', p_email),
    now(), now(), 'authenticated', 'authenticated', '', '', '', ''
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), new_uid, jsonb_build_object('sub', new_uid::text, 'email', final_email, 'email_verified', true), 'email', new_uid::text, now(), now(), now());

  INSERT INTO public.user_permissions (user_id, username, display_name, email_real, permissions)
  VALUES (new_uid, p_username, p_display_name, p_email, ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_metadata->'permissions', '["base"]'::jsonb))));

  RETURN new_uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_usuario(
  p_user_id UUID,
  p_username TEXT DEFAULT NULL, -- NOVO
  p_display_name TEXT DEFAULT NULL,
  p_password TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
DECLARE
  old_email TEXT;
  new_email TEXT;
BEGIN
  SELECT email INTO old_email FROM auth.users WHERE id = p_user_id;
  
  -- Se o username mudar e não houver um e-mail real, atualizamos o e-mail interno
  IF p_username IS NOT NULL AND old_email LIKE '%@radio.internal' AND p_email IS NULL THEN
      new_email := LOWER(TRIM(p_username)) || '@radio.internal';
  ELSE
      new_email := COALESCE(p_email, old_email);
  END IF;

  UPDATE auth.users
  SET 
    email = new_email,
    raw_user_meta_data = raw_user_meta_data || 
                         CASE WHEN p_username IS NOT NULL THEN jsonb_build_object('username', p_username) ELSE '{}'::jsonb END ||
                         CASE WHEN p_display_name IS NOT NULL THEN jsonb_build_object('display_name', p_display_name) ELSE '{}'::jsonb END ||
                         CASE WHEN p_email IS NOT NULL THEN jsonb_build_object('real_email', p_email) ELSE '{}'::jsonb END ||
                         p_metadata,
    updated_at = now()
  WHERE id = p_user_id;

  -- Atualizar identities também para o login funcionar com novo e-mail
  UPDATE auth.identities SET identity_data = jsonb_build_object('sub', p_user_id::text, 'email', new_email, 'email_verified', true) WHERE user_id = p_user_id;

  IF p_password IS NOT NULL AND p_password <> '' THEN
    UPDATE auth.users SET encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')) WHERE id = p_user_id;
  END IF;

  UPDATE public.user_permissions
  SET
    username = COALESCE(p_username, username),
    display_name = COALESCE(p_display_name, display_name),
    email_real = COALESCE(p_email, email_real),
    permissions = CASE WHEN p_metadata ? 'permissions' THEN ARRAY(SELECT jsonb_array_elements_text(p_metadata->'permissions')) ELSE permissions END
  WHERE user_id = p_user_id;
END;
$$;

-- REGISTRAR ADMIN MASTER SE NÃO EXISTIR NA TABELA DE PERMISSÕES
DO $$
DECLARE
  master_uid UUID;
BEGIN
  SELECT id INTO master_uid FROM auth.users WHERE email = 'liununes06@gmail.com';
  IF master_uid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.user_permissions WHERE user_id = master_uid) THEN
    INSERT INTO public.user_permissions (user_id, username, display_name, email_real, permissions)
    VALUES (master_uid, 'liununes06', 'Liu Nunes (Master)', 'liununes06@gmail.com', '{"*"}');
  END IF;
END $$;
`;
    navigator.clipboard.writeText(sql);
    toast.success("SQL de Reparo copiado!");
  };

  if (!isAdmin && !hasPermission('usuarios')) return <div>Acesso restrito.</div>;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipe & Acessos</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Gerencie colaboradores e níveis de permissão da rádio.</p>
        </div>
        {!isAdding && !editingUser && (
          <Button onClick={() => setIsAdding(true)} className="rounded-lg font-semibold shadow-sm text-sm h-11 px-6 bg-primary text-primary-foreground">
             <Plus className="w-4 h-4 mr-2" /> Novo Colaborador
          </Button>
        )}
      </div>

      {(isAdding || editingUser) && (
        <Card className="rounded-xl border border-border shadow-sm bg-card text-card-foreground overflow-hidden">
          <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">
              {editingUser ? `Editar: ${editingUser.username}` : "Dados do Novo Colaborador"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingUser(null); }} className="rounded-lg hover:bg-muted">
              <X className="w-5 h-5 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="space-y-2">
                 <Label className="text-sm font-semibold">Login (Username)</Label>
                 <Input 
                    value={editingUser ? editingUser.username : newUsername} 
                    onChange={e => editingUser ? setEditingUser({...editingUser, username: e.target.value}) : setNewUsername(e.target.value)} 
                    placeholder="Ex: joao_silva" 
                    className="h-11 rounded-lg"
                  />
               </div>
               <div className="space-y-2">
                 <Label className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" /> E-mail Real (Opcional)
                 </Label>
                 <Input 
                   value={editingUser ? (editingUser.email_real || "") : newRealEmail} 
                   onChange={e => editingUser ? setEditingUser({...editingUser, email_real: e.target.value}) : setNewRealEmail(e.target.value)} 
                   placeholder="Ex: joao@gmail.com" 
                   className="h-11 rounded-lg"
                 />
                 <p className="text-xs text-muted-foreground">* P/ recuperação de senha</p>
               </div>
               <div className="space-y-2">
                 <Label className="text-sm font-semibold">Nome de Exibição</Label>
                 <Input 
                   value={editingUser ? (editingUser.display_name || "") : newDisplayName} 
                   onChange={e => editingUser ? setEditingUser({...editingUser, display_name: e.target.value}) : setNewDisplayName(e.target.value)} 
                   placeholder="Ex: João Silva" 
                   className="h-11 rounded-lg"
                 />
               </div>
               <div className="space-y-2">
                 <Label className="text-sm font-semibold">
                    {editingUser ? "Nova Senha (Opcional)" : "Senha do Colaborador"}
                 </Label>
                 <Input 
                   type="password" 
                   value={editingUser ? (editingUser.new_password || "") : newPassword} 
                   onChange={e => editingUser ? setEditingUser({...editingUser, new_password: e.target.value}) : setNewPassword(e.target.value)} 
                   className="h-11 rounded-lg"
                 />
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <Label className="text-sm font-semibold">Permissões de Acesso</Label>
                  <div className="flex gap-2">
                     <Button type="button" variant="outline" size="sm" onClick={selectAllPermissions} className="h-8 rounded-md text-xs font-medium"><CheckSquare className="w-3 h-3 mr-2" /> Tudo</Button>
                     <Button type="button" variant="outline" size="sm" onClick={clearAllPermissions} className="h-8 rounded-md text-xs font-medium"><Square className="w-3 h-3 mr-2" /> Limpar</Button>
                  </div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = editingUser ? editingUser.permissions.includes(perm.id) : newPermissions.includes(perm.id);
                    return (
                      <button key={perm.id} type="button" onClick={() => editingUser ? toggleEditPermission(perm.id) : togglePermission(perm.id)} className={`flex items-center gap-2.5 p-3 border rounded-lg transition-colors text-left ${isChecked ? "bg-primary border-primary text-primary-foreground shadow-sm" : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"}`}>
                         <ShieldCheck className={`w-4 h-4 shrink-0 ${isChecked ? 'text-primary-foreground/80' : 'text-muted-foreground/50'}`} />
                         <span className="text-xs font-semibold leading-tight">{perm.label}</span>
                      </button>
                    )
                  })}
               </div>
            </div>

            <Button onClick={editingUser ? handleUpdateUser : handleAddUser} disabled={loading} className="w-full sm:w-min h-11 px-8 bg-primary text-primary-foreground font-semibold text-sm rounded-lg shadow-sm">
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((u) => (
          <Card key={u.user_id} className="group overflow-hidden rounded-xl border border-border shadow-sm bg-card hover:shadow-md transition-shadow">
             <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                   <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5" />
                   </div>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full" onClick={() => setEditingUser({ ...u })}><ShieldCheck className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full" onClick={() => handleDeleteUser(u.user_id)}><Trash2 className="w-4 h-4" /></Button>
                   </div>
                </div>
                <div>
                   <h3 className="text-lg font-bold text-foreground truncate">{u.display_name || u.username}</h3>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-medium text-muted-foreground">@{u.username}</span>
                     {u.email_real && <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1"><Mail className="w-3 h-3" /> E-mail</span>}
                   </div>
                </div>
                <div className="pt-4 border-t border-border flex flex-wrap gap-1.5">
                   {u.permissions?.slice(0, 3).map((p: string) => (
                      <span key={p} className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-md uppercase">{p.split('_')[0]}</span>
                   ))}
                   {u.permissions?.length > 3 && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase">+{u.permissions.length - 3}</span>}
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsuarios;
