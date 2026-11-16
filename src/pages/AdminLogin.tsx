import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Radio, LogIn, ArrowLeft, ShieldCheck, Headphones } from "lucide-react";

const AdminLogin = () => {
  const { signIn } = useAuth();
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem("last_admin_login") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email.trim()) {
      setError("Informe seu e-mail de acesso.");
      return;
    }

    localStorage.setItem("last_admin_login", email.trim());
    setLoading(true);

    if (isRecovering) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/admin/reset-password",
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg("Enviamos um link de recuperação. Verifique sua caixa de entrada.");
      }
    } else {
      if (!password.trim()) {
        setError("Informe sua senha.");
        setLoading(false);
        return;
      }
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        navigate("/admin");
      }
    }
    setLoading(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071426] px-4 py-10 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -bottom-48 -right-32 h-[34rem] w-[34rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <section className="relative z-10 grid w-full max-w-[980px] overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_32px_100px_rgba(0,0,0,0.42)] md:min-h-[590px] md:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#062b55] via-[#073b70] to-[#071b35] p-10 text-white md:flex lg:p-12">
          <div aria-hidden="true" className="absolute -right-24 top-24 h-72 w-72 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-12 top-36 h-48 w-48 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-2xl" />

          <div className="relative z-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg shadow-black/10 backdrop-blur">
              <Radio className="h-7 w-7 text-cyan-200" strokeWidth={1.7} />
            </div>
            <p className="mt-9 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Central de gestão</p>
            <h1 className="mt-3 max-w-xs text-4xl font-semibold leading-[1.12] tracking-tight text-white lg:text-[42px]">
              Sua rádio.<br />
              <span className="text-cyan-200">Sua conexão.</span>
            </h1>
            <p className="mt-5 max-w-xs text-sm leading-7 text-blue-100/75">
              Um espaço exclusivo para cuidar da programação, conteúdo e presença digital da Impacto FM.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 border-t border-white/15 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Headphones className="h-5 w-5 text-cyan-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Impacto FM</p>
              <p className="mt-0.5 text-xs text-blue-100/60">Painel administrativo</p>
            </div>
          </div>
        </aside>

        <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-12 md:px-10 lg:px-14">
          <div className="w-full max-w-[390px]">
            <div className="mb-9 flex items-center gap-3 md:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#073b70] text-white">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-slate-900">IMPACTO FM</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Painel administrativo</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#174b7d]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Acesso seguro
              </div>
              <h2 className="text-[29px] font-semibold tracking-tight text-slate-900">
                {isRecovering ? "Recuperar acesso" : "Bem-vindo de volta"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isRecovering
                  ? "Informe seu e-mail para receber o link de redefinição de senha."
                  : "Entre com suas credenciais para acessar o painel da rádio."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-xs font-semibold text-slate-700">E-mail de acesso</Label>
                <Input
                  id="admin-email"
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm text-slate-900 shadow-none transition placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/10"
                />
              </div>

              {!isRecovering && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="admin-password" className="text-xs font-semibold text-slate-700">Senha</Label>
                    <button
                      type="button"
                      onClick={() => { setIsRecovering(true); setError(""); setSuccessMsg(""); }}
                      className="text-xs font-semibold text-[#14518a] transition hover:text-blue-700 hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <Input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm text-slate-900 shadow-none transition placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/10"
                  />
                </div>
              )}

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  {error}
                </p>
              )}
              {successMsg && (
                <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
                  {successMsg}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-[#073b70] text-sm font-semibold tracking-wide text-white shadow-lg shadow-blue-950/15 transition duration-200 hover:-translate-y-0.5 hover:bg-[#0a4b88] hover:shadow-xl active:translate-y-0 disabled:opacity-60"
              >
                {loading ? "Aguarde..." : isRecovering ? "Enviar link de recuperação" : (
                  <span className="flex items-center justify-center gap-2">
                    Acessar painel <LogIn className="h-4 w-4" />
                  </span>
                )}
              </Button>

              {isRecovering && (
                <button
                  type="button"
                  onClick={() => { setIsRecovering(false); setError(""); setSuccessMsg(""); }}
                  className="flex w-full items-center justify-center gap-2 py-1 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar para o login
                </button>
              )}
            </form>

            <p className="mt-9 border-t border-slate-100 pt-5 text-center text-[11px] text-slate-400">
              Área restrita · Acesso exclusivo à equipe autorizada
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminLogin;
