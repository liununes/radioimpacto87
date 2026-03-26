import {
  Radio, Users, Calendar, Image, FileText, Info, LayoutDashboard, Music, Settings, Palette, BarChart3, ExternalLink, Heart, Gift, Sun, Moon, HardDrive, Eye, Layers
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
import { useTheme } from "@/hooks/useTheme";

const menuGroups = [
  {
    label: "Geral",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard, permission: "base" },
      { title: "Estatísticas", url: "/admin/estatisticas", icon: BarChart3, permission: "estatisticas" },
      { title: "Arquivos / Mídia", url: "/admin/media", icon: HardDrive, permission: "base" },
    ]
  },
  {
    label: "Identidade & Cores",
    items: [
      { title: "Cores & Logo", url: "/admin/aparencia", icon: Palette, permission: "aparencia" },
      { title: "Streaming / Redes", url: "/admin/streaming", icon: Radio, permission: "streaming" },
    ]
  },
  {
    label: "Estrutura & Visibilidade",
    items: [
      { title: "Seções do Site", url: "/admin/aparencia?tab=visibilidade", icon: Eye, permission: "aparencia" },
      { title: "Locutores", url: "/admin/locutores", icon: Users, permission: "locutores" },
      { title: "Programação", url: "/admin/programacao", icon: Calendar, permission: "programacao" },
    ]
  },
  {
    label: "Conteúdo Dinâmico",
    items: [
      { title: "Notícias / Blog", url: "/admin/noticias", icon: FileText, permission: "noticias" },
      { title: "Entretenimento", url: "/admin/entretenimento", icon: Radio, permission: "noticias" },
      { title: "Banners / Slides", url: "/admin/slides", icon: Image, permission: "slides" },
      { title: "Mural de Pedidos", url: "/admin/pedidos", icon: Music, permission: "aparencia" },
      { title: "Galeria de Fotos", url: "/admin/fotos", icon: Image, permission: "fotos" },
      { title: "Sobre a Rádio", url: "/admin/sobre", icon: Info, permission: "sobre" },
    ]
  },
  {
    label: "Marketing & Engajamento",
    items: [
      { title: "Patrocinadores", url: "/admin/patrocinadores", icon: Heart, permission: "aparencia" },
      { title: "Promoções", url: "/admin/promocoes", icon: Gift, permission: "aparencia" },
    ]
  },
  {
    label: "Sistema",
    items: [
      { title: "Usuários / Acessos", url: "/admin/usuarios", icon: Settings, permission: "usuarios" },
    ]
  }
];

interface AdminSidebarProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export function AdminSidebar({ isDark, onToggleDark }: AdminSidebarProps) {
  const { hasPermission } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const theme = useTheme();

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

      <SidebarContent className="bg-[var(--admin-blue)] px-3 pt-6 overflow-y-auto custom-scrollbar" style={{ backgroundColor: 'var(--admin-blue)' }}>
        {menuGroups.map((group, gIdx) => {
          const filteredItems = group.items.filter(item => item.permission === "base" || hasPermission(item.permission));
          if (filteredItems.length === 0) return null;

          return (
            <SidebarGroup key={gIdx} className={gIdx > 0 ? "mt-4" : ""}>
              {!collapsed && (
                <SidebarGroupLabel className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 px-3">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {filteredItems.map((item) => {
                    const isActive = location.pathname === item.url ||
                      (item.url !== "/admin" && location.pathname.startsWith(item.url.split('?')[0]));
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive} className={`
                          h-11 rounded-none transition-all duration-300
                          ${isActive ? "bg-[var(--admin-yellow)] text-[var(--admin-blue)] shadow-md" : "hover:text-white hover:bg-white/5"}
                        `} style={{ 
                          backgroundColor: isActive ? 'var(--admin-yellow)' : 'transparent',
                          color: isActive ? 'var(--admin-blue)' : 'var(--admin-sidebar-text)'
                        }}>
                          <NavLink
                            to={item.url}
                            end={item.url === "/admin"}
                            className="flex items-center gap-4 px-3"
                          >
                            <item.icon className={`h-4 w-4 shrink-0 transition-transform duration-500 ${isActive ? "scale-110" : ""}`} style={{ color: isActive ? 'var(--admin-blue)' : 'var(--admin-sidebar-text)' }} />
                            {!collapsed && (
                              <span className="text-[10px] font-black uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: isActive ? 'var(--admin-blue)' : 'var(--admin-sidebar-text)' }}>
                                {item.title}
                              </span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="bg-black/20 p-6 border-t border-white/5" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <SidebarMenu className="gap-2">
           <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={onToggleDark} 
                className="h-10 w-full flex items-center gap-4 px-3 text-white/40 hover:text-[var(--admin-yellow)] transition-all group"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">{isDark ? "Modo Claro" : "Modo Escuro"}</span>}
              </SidebarMenuButton>
           </SidebarMenuItem>
           <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-10 text-white/40 hover:text-[#ffed32] transition-colors">
                <NavLink to="/" className="flex items-center gap-4 px-3 italic border border-white/5 bg-white/5">
                  <ExternalLink className="h-4 w-4" />
                  {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Ver Site</span>}
                </NavLink>
              </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
