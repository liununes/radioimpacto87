import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const AdminLayout = () => {
  const { user, isAdmin, hasPermission, loading, signOut } = useAuth();
  const location = useLocation();

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
      <div className="min-h-screen flex w-full bg-gray-50/50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-20 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md px-8 sticky top-0 z-50">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="text-primary hover:bg-gray-100 p-2 rounded-xl transition-all" />
              <div className="h-6 w-px bg-gray-200 hidden md:block" />
              <div className="hidden md:flex flex-col">
                 <h1 className="text-sm font-black text-primary uppercase tracking-tight leading-none italic">Impacto FM</h1>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gerenciamento do Portal</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex flex-col items-end border-r border-gray-100 pr-6">
                <span className="text-[11px] font-black text-primary uppercase">{user.email?.split('@')[0]}</span>
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest italic leading-none mt-1">ADMINISTRADOR</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut} 
                className="gap-3 h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
              >
                <LogOut className="w-4 h-4" /> Sair
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
