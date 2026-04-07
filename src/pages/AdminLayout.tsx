import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos

const AdminLayout = () => {
  const { user, isAdmin, hasPermission, loading, signOut } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('adminDarkMode') === 'true');

  useEffect(() => {
    localStorage.setItem('adminDarkMode', String(isDark));
  }, [isDark]);

  // Sistema de Logout Automático por Inatividade
  useEffect(() => {
    if (!user) return;
    
    let timeoutId: string | number | NodeJS.Timeout | undefined;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        toast.info("Sessão finalizada por inatividade.", { duration: 5000 });
        signOut();
      }, INACTIVITY_TIMEOUT);
    };

    resetTimer(); // Timer inicial

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    // Trottler para melhorar performance: só reseta a cada segundo mesmo com múltiplos mousemoves
    let isThrottled = false;
    const handleActivity = () => {
      if (isThrottled) return;
      isThrottled = true;
      resetTimer();
      setTimeout(() => { isThrottled = false; }, 1000);
    };

    activityEvents.forEach(e => window.addEventListener(e, handleActivity));

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [user, signOut]);

  // Map sub-paths to permission keys
  const getRequiredPermission = (path: string) => {
    const normalizedPath = path.replace(/\/$/, "");
    if (normalizedPath === "/admin" || normalizedPath === "") return null; // Todos os colaboradores autenticados podem ver a tela inicial (Dashboard)
    
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
      'usuarios': 'usuarios',
      'media': 'media',
      'entretenimento': 'entretenimento',
      'pedidos': 'pedidos',
      'promocoes': 'promocoes',
      'patrocinadores': 'patrocinadores',
      'perfil': 'perfil'
    };
    if (segment === 'aparencia') {
      const searchParams = new URLSearchParams(location.search);
      const tab = searchParams.get('tab') || 'visual';
      if (tab === 'visibilidade') return 'visibilidade';
      if (tab === 'visual') return 'aparencia_visual';
      if (tab === 'textos') return 'aparencia_textos';
      if (tab === 'menus') return 'aparencia_menus';
      if (tab === 'layout') return 'aparencia_layout';
      return "aparencia_visual";
    }
    if (segment === 'noticias') {
      const searchParams = new URLSearchParams(location.search);
      const tab = searchParams.get('tab') || 'lista';
      if (tab === 'lista') return 'noticias_lista';
      if (tab === 'nova') return 'noticias_nova';
      if (tab === 'categorias') return 'noticias_categorias';
      return "noticias_lista";
    }
    if (segment === 'streaming') {
      const searchParams = new URLSearchParams(location.search);
      const tab = searchParams.get('tab') || 'sinal';
      if (tab === 'sinal') return 'streaming_sinal';
      if (tab === 'redes') return 'streaming_redes';
      if (tab === 'whatsapp') return 'streaming_whatsapp';
      return "streaming_sinal";
    }
    if (segment === 'danger-zone') return 'danger_zone';
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
  const forbidden = requiredPerm && !hasPermission(requiredPerm);

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full admin-view ${isDark ? 'dark bg-slate-950 text-white' : 'bg-gray-50/50'}`}>
        <AdminSidebar isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
        <div className="flex-1 flex flex-col min-h-screen">
          <header 
            className="h-20 flex items-center justify-between border-b border-gray-100 backdrop-blur-md px-8 sticky top-0 z-50 transition-all duration-500 glass-header"
            style={{ 
              background: `linear-gradient(to right, var(--admin-header-grad-start), var(--admin-header-grad-end))`
            }}
          >
            <div className="flex items-center gap-6">
              <SidebarTrigger className="text-primary hover:bg-primary/5 p-2 transition-all" />
              <div className="h-4 w-px bg-gray-200 hidden md:block" />
                <div className="flex flex-col">
                 <h1 className="text-xl font-bold tracking-tight text-primary">Impacto FM <span className="opacity-70 font-medium">Admin</span></h1>
                 <span className="text-xs font-medium text-muted-foreground mt-0.5">Sistema de Gestão</span>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center gap-4 border-r border-gray-100 pr-8">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-foreground">{user.email?.split('@')[0]}</span>
                  <span className="text-[10px] font-medium text-primary flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Sessão Ativa
                  </span>
                </div>
                <div className="w-10 h-10 bg-primary/5 rounded-full border border-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  {user.email?.[0].toUpperCase()}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut} 
                className="gap-2 h-10 px-4 font-medium text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-all rounded-lg"
              >
                <LogOut className="w-4 h-4" /> Sair
              </Button>
            </div>
          </header>
          <main key={location.pathname} className="flex-1 overflow-auto p-12 bg-transparent h-full">
            <div className="max-w-7xl mx-auto space-y-10 h-full">
              {forbidden ? (
                  <div className="bg-card text-card-foreground p-12 text-center space-y-4 border border-border shadow-sm rounded-xl max-w-lg w-full">
                   <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LogOut className="w-8 h-8 -rotate-90" />
                   </div>
                   <h2 className="text-2xl font-bold text-red-600">Acesso Restrito</h2>
                   <p className="text-sm text-muted-foreground leading-relaxed">
                      Você não tem permissão para acessar o módulo <span className="font-semibold text-primary">({requiredPerm})</span>.<br/> 
                      Entre em contato com o administrador.
                   </p>
                   <Button asChild className="mt-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link to="/admin">Voltar ao Painel</Link>
                   </Button>
                </div>
              ) : (
                <Outlet />
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
