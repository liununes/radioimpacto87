import { useTheme } from "@/hooks/useTheme";
import Maintenance from "@/pages/Maintenance";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface MaintenanceGuardProps {
  children: ReactNode;
}

const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
  const theme = useTheme();
  const location = useLocation();

  // Se o modo manutenção estiver ativo e NÃO estivermos tentando acessar o admin, mostramos a página de manutenção
  const isAdmin = location.pathname.startsWith("/admin");
  const isPlayer = location.pathname.startsWith("/player"); // Opcional: deixar o player acessível? 
  
  if (theme.showMaintenance && !isAdmin) {
    return <Maintenance />;
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
