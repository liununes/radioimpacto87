import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Radio, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminResetPassword = () => {
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Supabase automatically handles the hash fragment from the email link
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        toast.error("Link expirado ou inválido.");
        navigate("/admin/login");
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Senha atualizada com sucesso!");
      setTimeout(() => navigate("/admin/login"), 2000);
    }
    setLoading(false);
  };

  if (!session && !loading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-none border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <CardHeader className="text-center bg-green-50/30 p-10 pb-6 border-b border-gray-100/50">
          <div className="mx-auto w-16 h-16 rounded-none bg-green-500/10 border-2 border-green-500 flex items-center justify-center mb-6 shadow-lg shadow-green-500/10 transition-transform hover:scale-110">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tighter italic text-primary">Alterar <span className="text-green-600">Senha</span></CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60 text-slate-500">
            Crie uma nova credencial de acesso segura
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nova Senha</Label>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="••••••••" 
                className="h-14 rounded-none border-gray-100 bg-gray-50 font-bold text-primary focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confirmar Nova Senha</Label>
              <Input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="••••••••" 
                className="h-14 rounded-none border-gray-100 bg-gray-50 font-bold text-primary focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>
            
            <Button type="submit" className="w-full h-16 rounded-none bg-green-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all gap-4" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Atualizar Senha Agora"}
            </Button>

            <button 
              type="button" 
              onClick={() => navigate("/admin/login")}
              className="w-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all text-center"
            >
              Cancelar e Voltar
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminResetPassword;
