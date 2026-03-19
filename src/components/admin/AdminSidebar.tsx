import {
  Radio, Users, Calendar, Image, FileText, Info, LayoutDashboard, Music, Settings, Palette, BarChart3
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Painel Geral", url: "/admin", icon: LayoutDashboard, permission: "base" }, // base = accessible by all

  { title: "Player / Redes Sociais", url: "/admin/streaming", icon: Radio, permission: "streaming" },
  { title: "Aparência / Layout", url: "/admin/aparencia", icon: Palette, permission: "aparencia" },
  { title: "Locutores", url: "/admin/locutores", icon: Users, permission: "locutores" },
  { title: "Programação", url: "/admin/programacao", icon: Calendar, permission: "programacao" },
  { title: "Slides / Banners", url: "/admin/slides", icon: Image, permission: "slides" },
  { title: "Galeria de Fotos", url: "/admin/fotos", icon: Image, permission: "fotos" },
  { title: "Notícias", url: "/admin/noticias", icon: FileText, permission: "noticias" },
  { title: "Sobre a Rádio", url: "/admin/sobre", icon: Info, permission: "sobre" },
  { title: "Relatórios de Acesso", url: "/admin/estatisticas", icon: BarChart3, permission: "estatisticas" },
  { title: "Usuários / Permissões", url: "/admin/usuarios", icon: Settings, permission: "usuarios" },
];

export function AdminSidebar() {
  const { hasPermission } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  // Filter items: allow if user has specific permission, OR if the required permission is "base", OR if they are Master ("*")
  const filteredItems = menuItems.filter(item => item.permission === "base" || hasPermission(item.permission));

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            {!collapsed && "Administração"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.url ||
                  (item.url !== "/admin" && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-card border-t border-border p-3">
        <NavLink to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
          {!collapsed && <span>Voltar ao site</span>}
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
