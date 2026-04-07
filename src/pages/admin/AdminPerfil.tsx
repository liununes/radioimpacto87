import { useState, useEffect } from "react";
import { User, Save, Upload, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

const AdminPerfil = () => {
  const { user, supabase, isAdmin, hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [foto, setFoto] = useState("");

  useEffect(() => {
    if (user && user.user_metadata) {
      setDisplayName(user.user_metadata?.display_name || "");
      setEmail(user.user_metadata?.real_email || "");
      setUsername(user.user_metadata?.username || "");
      setFoto(user.user_metadata?.foto || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await (supabase as any).rpc('atualizar_usuario', {
        p_user_id: user.id,
        p_username: username,
        p_display_name: displayName,
        p_password: password || null,
        p_email: email || null,
        p_metadata: { 
          foto,
          username,
          display_name: displayName,
          real_email: email 
        }
      });

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso! Será necessário recarregar a página ou fazer login novamente.");
      setPassword(""); // Limpar a senha após o envio
      
      // Update local auth context without full reload if possible, but reload is safer
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      toast.error("Erro ao atualizar o perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFoto(await fileToBase64(file));
  };

  if (!isAdmin && !hasPermission('perfil')) {
    return <div className="p-12 text-center font-black uppercase text-red-500">Acesso Restrito: Você não tem permissão para editar seu perfil.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Meu Perfil</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Gerencie suas informações de conta e credenciais de acesso.</p>
        </div>
      </div>

      <Card className="rounded-xl border border-border shadow-sm bg-card overflow-hidden">
        <CardHeader className="p-6 border-b border-border bg-muted/20">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
             <User className="w-5 h-5 text-primary" /> Informações Pessoais
          </CardTitle>
          <CardDescription>
             Atualize sua foto pública e seu nome de exibição no painel.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-6 space-y-8">
           <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                 <div className="relative group">
                   <div className="w-32 h-32 rounded-full bg-muted border-4 border-background shadow-md overflow-hidden flex items-center justify-center relative">
                      {foto ? (
                        <img src={foto} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground/30" />
                      )}
                      
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                         <label className="cursor-pointer p-2 rounded-full hover:bg-white/20 transition-colors" title="Alterar Foto">
                            <Upload className="text-white w-6 h-6" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                         </label>
                      </div>
                   </div>
                 </div>
                 {foto && (
                     <Button type="button" variant="ghost" size="sm" onClick={() => setFoto("")} className="text-xs text-muted-foreground hover:text-destructive">
                        Remover Foto
                     </Button>
                 )}
              </div>
              
              <div className="flex-1 space-y-6 w-full">
                 <div className="space-y-2">
                    <Label className="text-sm font-semibold">Nome de Exibição</Label>
                    <Input 
                      value={displayName} 
                      onChange={e => setDisplayName(e.target.value)} 
                      placeholder="Seu nome visível..." 
                      className="h-11 rounded-lg"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-sm font-semibold">Nome de Usuário (Login)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        className="h-11 rounded-lg pl-10"
                        placeholder="Ex: joao_silva"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Este é o nome que você usa para acessar o sistema.</p>
                 </div>
              </div>
           </div>

           <div className="pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> E-mail de Recuperação
                 </Label>
                 <Input 
                    type="email"
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="seu_email_real@exemplo.com" 
                    className="h-11 rounded-lg"
                 />
                 <p className="text-xs text-muted-foreground mt-1">Recomendado para casos de perda de acesso.</p>
              </div>

              <div className="space-y-2">
                 <Label className="text-sm font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" /> Nova Senha (Opcional)
                 </Label>
                 <Input 
                    type="password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Digite para alterar a senha atual..." 
                    className="h-11 rounded-lg"
                 />
                 <p className="text-xs text-muted-foreground mt-1">Deixe em branco para continuar com a senha atual.</p>
              </div>
           </div>

           <div className="pt-6 border-t border-border flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={loading} 
                className="h-11 px-8 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm w-full sm:w-auto"
              >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Atualizar Minha Conta
              </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPerfil;
