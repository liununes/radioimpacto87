import {
  Radio, Users, Calendar, Image, FileText, Info, LayoutDashboard, Music, Settings, Palette,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  { title: "Painel Geral", url: "/admin", icon: LayoutDashboard },
  { title: "Player / Redes Sociais", url: "/admin/streaming", icon: Radio },
  { title: "Aparência / Cores", url: "/admin/aparencia", icon: Palette },
  { title: "Locutores", url: "/admin/locutores", icon: Users },
  { title: "Programação", url: "/admin/programacao", icon: Calendar },
  { title: "Slides / Banners", url: "/admin/slides", icon: Image },
  { title: "Galeria de Fotos", url: "/admin/fotos", icon: Image },
  { title: "Pedidos Musicais", url: "/admin/pedidos", icon: Music },
  { title: "Notícias", url: "/admin/noticias", icon: FileText },
  { title: "Sobre a Rádio", url: "/admin/sobre", icon: Info },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            {!collapsed && "Administração"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
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
