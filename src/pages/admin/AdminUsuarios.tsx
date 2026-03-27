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
  { id: "media", label: "Arquivos / Mídia" },
  { id: "entretenimento", label: "Canal Entretenimento" },
  { id: "noticias", label: "Notícias / Blog" },
  { id: "streaming", label: "Vídeos & Redes Sociais" },
  { id: "aparencia", label: "Personalizar Site & Cores" },
  { id: "locutores", label: "Equipe Locutores" },
  { id: "programacao", label: "Grade de Horários" },
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
BEGIN
  UPDATE auth.users
  SET 
    email = COALESCE(p_email, email),
    raw_user_meta_data = raw_user_meta_data || 
                         CASE WHEN p_display_name IS NOT NULL THEN jsonb_build_object('display_name', p_display_name) ELSE '{}'::jsonb END ||
                         CASE WHEN p_email IS NOT NULL THEN jsonb_build_object('real_email', p_email) ELSE '{}'::jsonb END ||
                         p_metadata,
    updated_at = now()
  WHERE id = p_user_id;

  IF p_password IS NOT NULL AND p_password <> '' THEN
    UPDATE auth.users SET encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')) WHERE id = p_user_id;
  END IF;

  UPDATE public.user_permissions
  SET
    display_name = COALESCE(p_display_name, display_name),
    email_real = COALESCE(p_email, email_real),
    permissions = CASE WHEN p_metadata ? 'permissions' THEN ARRAY(SELECT jsonb_array_elements_text(p_metadata->'permissions')) ELSE permissions END
  WHERE user_id = p_user_id;
END;
$$;
`;
    navigator.clipboard.writeText(sql);
    toast.success("SQL de Reparo copiado!");
  };

  if (!isAdmin && !hasPermission('usuarios')) return <div>Acesso restrito.</div>;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center bg-white text-slate-900 p-8 rounded-none border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase italic leading-none">Equipe & <span className="text-secondary italic">Acessos</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Novidade: Agora com suporte a e-mail real!</p>
        </div>
        {!isAdding && !editingUser && (
          <Button onClick={() => setIsAdding(true)} className="rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-primary text-white">
             <Plus className="w-4 h-4 mr-2" /> Novo Colaborador
          </Button>
        )}
      </div>

      {(isAdding || editingUser) && (
        <Card className="rounded-none border-none shadow-2xl bg-white text-slate-900 overflow-hidden">
          <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black uppercase tracking-tight text-primary italic">
              {editingUser ? `Editar: ${editingUser.username}` : "Dados do Novo Colaborador"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingUser(null); }}>
              <X className="w-6 h-6 text-gray-300" />
            </Button>
          </CardHeader>
          <CardContent className="p-10 pt-4 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Login (Username)</Label>
                 <Input 
                   disabled={!!editingUser}
                   value={editingUser ? editingUser.username : newUsername} 
                   onChange={e => editingUser ? setEditingUser({...editingUser, username: e.target.value}) : setNewUsername(e.target.value)} 
                   placeholder="Ex: joao_silvain" 
                   className="h-14 rounded-none border-gray-100 bg-gray-50"
                 />
               </div>
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Mail className="w-3 h-3 text-secondary" /> E-mail Real (Opcional)
                 </Label>
                 <Input 
                   value={editingUser ? (editingUser.email_real || "") : newRealEmail} 
                   onChange={e => editingUser ? setEditingUser({...editingUser, email_real: e.target.value}) : setNewRealEmail(e.target.value)} 
                   placeholder="Ex: joao@gmail.com" 
                   className="h-14 rounded-none border-gray-100 bg-gray-50"
                 />
                 <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">* Necessário para recuperação de senha por e-mail.</p>
               </div>
               <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome de Exibição</Label>
                 <Input 
                   value={editingUser ? (editingUser.display_name || "") : newDisplayName} 
                   onChange={e => editingUser ? setEditingUser({...editingUser, display_name: e.target.value}) : setNewDisplayName(e.target.value)} 
                   placeholder="Ex: João Silva" 
                   className="h-14 rounded-none border-gray-100 bg-gray-50"
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
                   className="h-14 rounded-none border-gray-100 bg-gray-50"
                 />
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Permissões de Acesso</Label>
                  <div className="flex gap-2">
                     <Button type="button" variant="outline" size="sm" onClick={selectAllPermissions} className="h-8 rounded-none text-[9px] uppercase"><CheckSquare className="w-3 h-3 mr-2" /> Tudo</Button>
                     <Button type="button" variant="outline" size="sm" onClick={clearAllPermissions} className="h-8 rounded-none text-[9px] uppercase"><Square className="w-3 h-3 mr-2" /> Limpar</Button>
                  </div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = editingUser ? editingUser.permissions.includes(perm.id) : newPermissions.includes(perm.id);
                    return (
                      <button key={perm.id} type="button" onClick={() => editingUser ? toggleEditPermission(perm.id) : togglePermission(perm.id)} className={`flex items-center gap-3 p-4 border rounded-none transition-all ${isChecked ? "bg-primary border-primary text-white" : "bg-gray-50 text-gray-400"}`}>
                         <ShieldCheck className={`w-4 h-4 ${isChecked ? 'text-secondary' : 'text-gray-300'}`} />
                         <span className="text-[10px] font-black uppercase tracking-tighter">{perm.label}</span>
                      </button>
                    )
                  })}
               </div>
            </div>

            <Button onClick={editingUser ? handleUpdateUser : handleAddUser} disabled={loading} className="w-full md:w-max h-16 px-12 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-none shadow-xl">
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Alterações"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-none border-none bg-orange-50 p-6 flex items-center justify-between border-l-4 border-l-orange-500">
         <div className="flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            <div>
               <p className="text-[10px] font-black uppercase text-orange-600">Configuração da VPS (Importante)</p>
               <p className="text-[11px] font-bold text-orange-400 mt-1 uppercase">Clique no botão para atualizar as funções do banco de dados para suportar e-mails reais.</p>
            </div>
         </div>
         <Button variant="outline" onClick={repairDatabase} className="h-10 rounded-none border-orange-200 text-orange-600 font-black uppercase text-[9px] tracking-widest bg-white">
            <Save className="w-3.5 h-3.5 mr-2" /> Atualizar DB (SQL)
         </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map((u) => (
          <Card key={u.user_id} className="group overflow-hidden rounded-none border-none shadow-xl bg-white text-slate-900 border-t-4 border-t-primary/20">
             <div className="p-8 space-y-6 transition-all group-hover:bg-primary/5">
                <div className="flex items-center justify-between">
                   <div className="w-12 h-12 bg-gray-50 text-primary rounded-none flex items-center justify-center">
                      <Users className="w-5 h-5" />
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-10 w-10 bg-white" onClick={() => setEditingUser({ ...u })}><ShieldCheck className="w-4 h-4 text-primary" /></Button>
                      <Button size="icon" variant="ghost" className="h-10 w-10 bg-red-50 text-red-400" onClick={() => handleDeleteUser(u.user_id)}><Trash2 className="w-4 h-4" /></Button>
                   </div>
                </div>
                <div>
                   <h3 className="text-xl font-black text-primary uppercase italic tracking-tight">{u.display_name || u.username}</h3>
                   <div className="flex items-center gap-2 mt-2">
                     <span className="text-[10px] font-bold text-gray-300 uppercase">@{u.username}</span>
                     {u.email_real && <span className="text-[10px] font-bold text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded-none flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> Ativo</span>}
                   </div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-1">
                   {u.permissions?.slice(0, 4).map((p: string) => (
                      <span key={p} className="text-[8px] font-black bg-gray-100 text-primary/70 px-2 py-0.5 rounded-none uppercase">{p}</span>
                   ))}
                   {u.permissions?.length > 4 && <span className="text-[8px] font-black bg-gray-100 text-primary/70 px-2 py-0.5 rounded-none uppercase">+{u.permissions.length - 4}</span>}
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsuarios;
