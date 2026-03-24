import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const AdminLayout = () => {
  const { user, isAdmin, hasPermission, loading, signOut } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('adminDarkMode') === 'true');

  useEffect(() => {
    localStorage.setItem('adminDarkMode', String(isDark));
  }, [isDark]);

  // Map sub-paths to permission keys
  const getRequiredPermission = (path: string) => {
    if (path === "/admin") return null; // Todos os colaboradores autenticados podem ver a tela inicial (Dashboard)
    const segment = path.split("/")[2];
    if (!segment) return null;
    // Map specific paths if they differ from the segment name
    const map: any = {
      'streaming': 'streaming',
      'aparencia': 'aparencia',
      'locutores': 'locutores',
      'programacao': 'programacao',
      'slides': 'slides',
      'fotos': 'fotos',
      'noticias': 'noticias',
      'sobre': 'sobre',
      'estatisticas': 'estatisticas',
      'usuarios': 'usuarios'
    };
    if (segment === 'aparencia') {
      return hasPermission("aparencia") || 
             hasPermission("vis_noticias") || 
             hasPermission("vis_galeria") || 
             hasPermission("vis_top3") || 
             hasPermission("vis_sobre") ? null : "aparencia";
    }
    return map[segment] || "*";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  
  const requiredPerm = getRequiredPermission(location.pathname);
  if (requiredPerm && !hasPermission(requiredPerm)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
        <div>
          <p className="text-lg font-semibold text-foreground mb-2">Acesso Negado</p>
          <p className="text-sm text-muted-foreground mb-4">
            Você não tem permissão para acessar esta seção ({requiredPerm}).
          </p>
          <Button variant="outline" onClick={signOut} className="gap-2"><LogOut className="w-4 h-4" /> Sair</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full admin-view ${isDark ? 'dark bg-slate-950 text-white' : 'bg-gray-50/50'}`}>
        <AdminSidebar isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
        <div className="flex-1 flex flex-col">
          <header 
            className="h-20 flex items-center justify-between border-b border-gray-100 backdrop-blur-md px-8 sticky top-0 z-50 transition-all duration-500 glass-header"
            style={{ 
              background: `linear-gradient(to right, var(--admin-header-grad-start), var(--admin-header-grad-end))`
            }}
          >
            <div className="flex items-center gap-6">
              <SidebarTrigger className="text-primary hover:bg-primary/5 p-2 transition-all" />
              <div className="h-4 w-px bg-gray-200 hidden md:block" />
              <div className="hidden md:flex flex-col">
                 <h1 className="text-sm font-black uppercase tracking-tight leading-none italic text-primary">Impacto FM — <span className="text-secondary italic">Admin</span></h1>
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">SISTEMA INTEGRADO DE GESTÃO</span>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center gap-4 border-r border-gray-100 pr-8">
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-black text-primary uppercase tracking-tighter">{user.email?.split('@')[0]}</span>
                  <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-none animate-pulse" /> SESSÃO ATIVA
                  </span>
                </div>
                <div className="w-10 h-10 bg-primary/5 border border-primary/10 flex items-center justify-center font-black text-primary text-xs italic">
                  {user.email?.[0].toUpperCase()}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut} 
                className="gap-3 h-12 px-6 font-black uppercase text-[10px] tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
              >
                <LogOut className="w-4 h-4" /> Finalizar
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-12">
            <div className="max-w-7xl mx-auto space-y-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
