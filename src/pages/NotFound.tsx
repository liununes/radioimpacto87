import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Radio } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--clube-blue)] p-6">
      <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <Radio className="w-48 h-48 text-white/5 mx-auto" />
          <h1 className="absolute inset-0 flex items-center justify-center text-8xl md:text-9xl font-black text-[var(--clube-yellow)] tracking-tighter italic shadow-2xl">404</h1>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-widest leading-none text-white" style={{ color: 'var(--text-title)' }}>Ops! Página Fora do Ar</h2>
          <p className="font-bold uppercase tracking-[0.2em] text-xs" style={{ color: 'var(--text-content)' }}>A rádio continua, mas esse link sumiu das ondas.</p>
        </div>

        <Link to="/" className="clube-btn-yellow inline-flex items-center gap-3 px-12 py-4">
          <ArrowLeft className="w-5 h-5" />
          VOLTAR PARA A HOME
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
