import {
  Radio, Users, Calendar, Image, FileText, Info, LayoutDashboard, Music, Settings, Palette, BarChart3, ChevronLeft, ChevronRight, ExternalLink
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
  { title: "Galeria de Fotos", url: "/admin/fotos", icon: Image, permission: "fotos" },
  { title: "Portal de Notícias", url: "/admin/noticias", icon: FileText, permission: "noticias" },
  { title: "Sobre a Rádio", url: "/admin/sobre", icon: Info, permission: "sobre" },
  { title: "Estatísticas", url: "/admin/estatisticas", icon: BarChart3, permission: "estatisticas" },
  { title: "Configurações", url: "/admin/usuarios", icon: Settings, permission: "usuarios" },
];

export function AdminSidebar() {
  const { hasPermission } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const filteredItems = menuItems.filter(item => item.permission === "base" || hasPermission(item.permission));

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 shadow-2xl">
      <SidebarHeader className="bg-[#002e5d] p-6 pb-2">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-xl bg-[#ffed32] flex items-center justify-center shrink-0 shadow-lg shadow-yellow-400/20">
            <Radio className="w-6 h-6 text-[#002e5d]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black text-white tracking-widest uppercase">Admin</span>
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-tighter opacity-80">Gestão de Rádio</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#002e5d] px-3 pt-6">
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
                      h-12 rounded-xl transition-all duration-300
                      ${isActive ? "bg-[#ffed32] text-[#002e5d] shadow-lg shadow-yellow-400/10" : "text-white/60 hover:text-white hover:bg-white/5"}
                    `}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        className="flex items-center gap-4 px-3"
                      >
                        <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-[#002e5d]" : "text-white/40"}`} />
                        {!collapsed && <span className="text-[11px] font-black uppercase tracking-wider">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#001d3d] p-6 border-t border-white/5">
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
