import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Radio, LogIn, UserPlus } from "lucide-react";

const AdminLogin = () => {
  const { signIn } = useAuth();
  const { supabase } = useAuth(); // Need to expose supabase if not already
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email.trim()) { setError("Preencha o e-mail."); return; }

    setLoading(true);
    
    if (isRecovering) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/admin/reset-password",
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      }
    } else {
      if (!password.trim()) { setError("Preencha a senha."); setLoading(false); return; }
      const { error } = await signIn(email, password);
      if (error) { setError(error); } else {
        navigate("/admin");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-none border border-gray-100 shadow-2xl overflow-hidden">
        <CardHeader className="text-center bg-primary/5 p-10 pb-6 border-b border-gray-100/50">
          <div className="mx-auto w-16 h-16 rounded-none bg-primary/20 border-2 border-primary flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10 transition-transform hover:scale-110">
            <Radio className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tighter italic text-primary">Impacto FM — <span className="text-secondary">Admin</span></CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">
            {isRecovering ? "Recuperar senha de acesso" : "Faça login para gerenciar sua estação"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Usuário ou E-mail</Label>
              <Input 
                type="text" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Ex: locutor_jose" 
                className="h-14 rounded-none border-gray-100 bg-gray-50 font-bold text-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            {!isRecovering && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Senha Pessoal</Label>
                  <button 
                    type="button" 
                    onClick={() => { setIsRecovering(true); setError(""); setSuccessMsg(""); }}
                    className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors"
                  >
                    Esqueceu?
                  </button>
                </div>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="h-14 rounded-none border-gray-100 bg-gray-50 font-bold text-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            {error && <p className="text-[10px] font-black uppercase text-red-500 italic text-center bg-red-50 p-3 border border-red-100">{error}</p>}
            {successMsg && <p className="text-[10px] font-black uppercase text-green-500 italic text-center bg-green-50 p-3 border border-green-100">{successMsg}</p>}
            
            <Button type="submit" className="w-full h-16 rounded-none bg-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all gap-4" disabled={loading}>
              {loading ? "Processando..." : (isRecovering ? "Enviar Recuperação" : <><LogIn className="w-5 h-5" /> Acessar Painel</>)}
            </Button>

            {isRecovering && (
              <button 
                type="button" 
                onClick={() => { setIsRecovering(false); setError(""); setSuccessMsg(""); }}
                className="w-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all text-center"
              >
                Voltar para o Login
              </button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
