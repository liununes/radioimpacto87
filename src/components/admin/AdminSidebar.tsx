import {
  Radio, Users, Calendar, Image, FileText, Info, LayoutDashboard, Music, Settings, Palette, BarChart3, ChevronLeft, ChevronRight, ExternalLink, Heart, Gift
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
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { title: "Painel Geral", url: "/admin", icon: LayoutDashboard, permission: "base" },
  { title: "Player / Redes", url: "/admin/streaming", icon: Radio, permission: "streaming" },
  { title: "Personalização", url: "/admin/aparencia", icon: Palette, permission: "aparencia" },
  { title: "Locutores", url: "/admin/locutores", icon: Users, permission: "locutores" },
  { title: "Programação", url: "/admin/programacao", icon: Calendar, permission: "programacao" },
  { title: "Banners / Slides", url: "/admin/slides", icon: Image, permission: "slides" },
  { title: "Patrocinadores", url: "/admin/patrocinadores", icon: Heart, permission: "aparencia" },
  { title: "Promoções", url: "/admin/promocoes", icon: Gift, permission: "aparencia" },
  { title: "Galeria de Fotos", url: "/admin/fotos", icon: Image, permission: "fotos" },
  { title: "Portal de Notícias", url: "/admin/noticias", icon: FileText, permission: "noticias" },
  { title: "Sobre a Rádio", url: "/admin/sobre", icon: Info, permission: "sobre" },
  { title: "Estatísticas", url: "/admin/estatisticas", icon: BarChart3, permission: "estatisticas" },
  { title: "Configurações", url: "/admin/usuarios", icon: Settings, permission: "usuarios" },
];

import { useTheme } from "@/hooks/useTheme";

export function AdminSidebar() {
  const { hasPermission } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const theme = useTheme();
  const filteredItems = menuItems.filter(item => item.permission === "base" || hasPermission(item.permission));

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 shadow-2xl">
      <SidebarHeader className="bg-[var(--admin-blue)] p-6 pb-2" style={{ backgroundColor: 'var(--admin-blue)' }}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-none bg-[var(--admin-yellow)] flex items-center justify-center shrink-0 shadow-lg shadow-yellow-400/20" style={{ backgroundColor: 'var(--admin-yellow)' }}>
            {theme.adminLogo ? (
              <img src={theme.adminLogo} alt="Admin Logo" className="w-8 h-8 object-contain" />
            ) : (
              <Radio className="w-6 h-6 text-[var(--admin-blue)]" style={{ color: 'var(--admin-blue)' }} />
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-widest uppercase" style={{ color: 'var(--admin-text)' }}>Admin</span>
              <span className="text-[10px] font-bold text-[var(--admin-yellow)] uppercase tracking-tighter opacity-80" style={{ color: 'var(--admin-yellow)' }}>Gestão de Rádio</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[var(--admin-blue)] px-3 pt-6" style={{ backgroundColor: 'var(--admin-blue)' }}>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">
            {!collapsed && "Navegação Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.url ||
                  (item.url !== "/admin" && location.pathname.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} className={`
                      h-12 rounded-none transition-all duration-300
                      ${isActive ? "bg-[var(--admin-yellow)] text-[var(--admin-blue)] shadow-lg" : "hover:text-white hover:bg-white/5"}
                    `} style={{ 
                      backgroundColor: isActive ? 'var(--admin-yellow)' : 'transparent',
                      color: isActive ? 'var(--admin-blue)' : 'var(--admin-sidebar-text)'
                    }}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        className="flex items-center gap-4 px-3"
                      >
                        <item.icon className="h-4.5 w-4.5 shrink-0" style={{ color: isActive ? 'var(--admin-blue)' : 'var(--admin-sidebar-text)' }} />
                        {!collapsed && <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: isActive ? 'var(--admin-blue)' : 'var(--admin-sidebar-text)' }}>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-black/20 p-6 border-t border-white/5" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <SidebarMenu>
           <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-10 text-white/40 hover:text-[#ffed32] transition-colors">
                <NavLink to="/" className="flex items-center gap-4 px-3 italic">
                  <ExternalLink className="h-4 w-4" />
                  {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Abrir Site Público</span>}
                </NavLink>
              </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
