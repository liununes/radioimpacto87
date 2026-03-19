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
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground" />
              <h1 className="text-sm font-semibold text-foreground">Impacto FM — Painel Administrativo</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground">
                <LogOut className="w-4 h-4" /> Sair
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
