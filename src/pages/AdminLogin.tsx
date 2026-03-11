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
      const { error } = await (useAuth as any)().supabase.auth.resetPasswordForEmail(email, {
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-3">
            <Radio className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-xl">Impacto FM — Admin</CardTitle>
          <CardDescription>
            {isRecovering ? "Recuperar senha de acesso" : "Faça login para acessar o painel"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@radio.com" />
            </div>
            
            {!isRecovering && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Senha</Label>
                  <button 
                    type="button" 
                    onClick={() => { setIsRecovering(true); setError(""); setSuccessMsg(""); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {successMsg && <p className="text-sm text-green-400">{successMsg}</p>}
            
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {isRecovering ? "Enviar E-mail de Recuperação" : <><LogIn className="w-4 h-4" /> Entrar</>}
            </Button>

            {isRecovering && (
              <button 
                type="button" 
                onClick={() => { setIsRecovering(false); setError(""); setSuccessMsg(""); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
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
