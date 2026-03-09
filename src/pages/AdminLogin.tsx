import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Radio, LogIn, UserPlus } from "lucide-react";

const AdminLogin = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email.trim() || !password.trim()) { setError("Preencha todos os campos."); return; }
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }

    setLoading(true);
    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) { setError(error); } else {
        setSuccessMsg("Conta criada! Verifique seu email para confirmar. O primeiro usuário registrado será automaticamente administrador.");
      }
    } else {
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
          <CardDescription>{isSignUp ? "Criar conta de administrador" : "Faça login para acessar o painel"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@impactofm.com" />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {successMsg && <p className="text-sm text-green-400">{successMsg}</p>}
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {isSignUp ? <><UserPlus className="w-4 h-4" /> Criar Conta</> : <><LogIn className="w-4 h-4" /> Entrar</>}
            </Button>
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccessMsg(""); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              {isSignUp ? "Já tem conta? Faça login" : "Primeiro acesso? Criar conta"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
