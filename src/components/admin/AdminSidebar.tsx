import {
  Radio, Users, Calendar, Image, FileText, Info, LayoutDashboard, Music, Settings, Palette, BarChart3, ExternalLink, Heart, Gift, Sun, Moon, HardDrive, Eye, Layers, LifeBuoy, Type, Layout, AlertTriangle, Globe, MessageCircle, Plus, User
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

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, permission: "base" },
  { title: "Estatísticas", url: "/admin/estatisticas", icon: BarChart3, permission: "estatisticas" },
  { title: "Arquivos / Mídia", url: "/admin/media", icon: HardDrive, permission: "media" },
  
  // Aparencia
  { title: "Identidade Visual", url: "/admin/aparencia?tab=visual", icon: Palette, permission: "aparencia_visual" },
  { title: "Texto & Cores", url: "/admin/aparencia?tab=textos", icon: Type, permission: "aparencia_textos" },
  { title: "Menu do Site", url: "/admin/aparencia?tab=menus", icon: ExternalLink, permission: "aparencia_menus" },
  { title: "Design do Site", url: "/admin/aparencia?tab=layout", icon: Layout, permission: "aparencia_layout" },
  { title: "Visibilidade do Site", url: "/admin/aparencia?tab=visibilidade", icon: Eye, permission: "visibilidade" },
  
  // Locutores & Programacao
  { title: "Locutores", url: "/admin/locutores", icon: Users, permission: "locutores" },
  { title: "Programação", url: "/admin/programacao", icon: Calendar, permission: "programacao" },
  
  // Noticias Dismantled
  { title: "Lista de Notícias", url: "/admin/noticias?tab=lista", icon: FileText, permission: "noticias_lista" },
  { title: "Publicar Noticia", url: "/admin/noticias?tab=nova", icon: Plus, permission: "noticias_nova" },
  { title: "Categorias News", url: "/admin/noticias?tab=categorias", icon: Layers, permission: "noticias_categorias" },
  
  // Conteudo
  { title: "Entretenimento", url: "/admin/entretenimento", icon: Radio, permission: "entretenimento" },
  { title: "Banners / Slides", url: "/admin/slides", icon: Image, permission: "slides" },
  { title: "Mural de Pedidos", url: "/admin/pedidos", icon: Music, permission: "pedidos" },
  { title: "Galeria de Fotos", url: "/admin/fotos", icon: Image, permission: "fotos" },
  { title: "Sobre a Rádio", url: "/admin/sobre", icon: Info, permission: "sobre" },
  
  // Conexoes Dismantled
  { title: "Sinal do Player", url: "/admin/streaming?tab=sinal", icon: Radio, permission: "streaming_sinal" },
  { title: "Redes Sociais", url: "/admin/streaming?tab=redes", icon: Globe, permission: "streaming_redes" },
  { title: "WhatsApp & Ouvintes", url: "/admin/streaming?tab=whatsapp", icon: MessageCircle, permission: "streaming_whatsapp" },
  
  // Admin
  { title: "Patrocinadores", url: "/admin/patrocinadores", icon: Heart, permission: "patrocinadores" },
  { title: "Promoções", url: "/admin/promocoes", icon: Gift, permission: "promocoes" },
  { title: "Usuários / Acessos", url: "/admin/usuarios", icon: Settings, permission: "usuarios" },
  { title: "Meu Perfil", url: "/admin/perfil", icon: User, permission: "perfil" },
  { title: "Zona de Perigo", url: "/admin/danger-zone", icon: AlertTriangle, permission: "danger_zone" },
];

interface AdminSidebarProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export function AdminSidebar({ isDark, onToggleDark }: AdminSidebarProps) {
  const { user, hasPermission, isAdmin } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const theme = useTheme();

  const isMainAdmin = isAdmin;

  const filteredItems = menuItems.filter(item => item.permission === "base" || hasPermission(item.permission));

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 shadow-2xl">
      <SidebarHeader className="bg-[var(--admin-blue)] p-6 pb-4" style={{ backgroundColor: 'var(--admin-blue)' }}>
        <div className={`flex items-center gap-4 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-xl bg-[var(--admin-yellow)] flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: 'var(--admin-yellow)' }}>
            {theme.adminLogo ? (
              <img src={theme.adminLogo} alt="Admin Logo" className="w-8 h-8 object-contain" />
            ) : (
              <Radio className="w-5 h-5 text-[var(--admin-blue)]" style={{ color: 'var(--admin-blue)' }} />
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold" style={{ color: 'var(--admin-text)' }}>Admin Panel</span>
              <span className="text-xs font-medium opacity-90" style={{ color: 'var(--admin-yellow)' }}>Gestão Integrada</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[var(--admin-blue)] px-4 pt-4 overflow-y-auto custom-scrollbar" style={{ backgroundColor: 'var(--admin-blue)' }}>
        <SidebarMenu className="gap-1">
          {filteredItems.map((item) => {
            let isActive = false;
            if (item.url.includes("?")) {
              isActive = location.pathname + location.search === item.url;
            } else {
              isActive = location.pathname === item.url || (item.url !== "/admin" && location.pathname.startsWith(item.url));
            }
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} className={`
                  h-10 rounded-lg transition-all duration-200
                  ${isActive ? "bg-[var(--admin-yellow)] text-[var(--admin-blue)] font-semibold shadow-sm" : "hover:bg-white/10 hover:text-white font-medium"}
                `} style={{ 
                  backgroundColor: isActive ? 'var(--admin-yellow)' : 'transparent',
                  color: isActive ? 'var(--admin-blue)' : 'var(--admin-sidebar-text)'
                }}>
                  <NavLink
                    to={item.url}
                    end={item.url === "/admin"}
                    className="flex items-center gap-3 px-3"
                  >
                    <item.icon className="h-4 w-4 shrink-0 transition-transform duration-300" style={{ color: isActive ? 'var(--admin-blue)' : 'var(--admin-sidebar-text)', opacity: isActive ? 1 : 0.8 }} />
                    {!collapsed && (
                      <span className="text-sm truncate" style={{ color: isActive ? 'var(--admin-blue)' : 'var(--admin-sidebar-text)' }}>
                        {item.title}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="bg-black/10 p-4 border-t border-white/5" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
        <SidebarMenu className="gap-2">
           {!isMainAdmin && (
             <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  className="h-12 w-full flex items-center gap-3 px-3 rounded-lg hover:bg-white/10 transition-colors group"
                >
                  <a href="https://wa.me/5533999837414" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3">
                    <LifeBuoy className="h-5 w-5 text-white/50 group-hover:text-[var(--admin-yellow)] transition-colors" />
                    {!collapsed && (
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold leading-tight text-white/80 group-hover:text-white transition-colors">Suporte Técnico</span>
                        <span className="text-[10px] text-white/40 group-hover:text-[var(--admin-yellow)] opacity-80 transition-colors">(33) 99983-7414</span>
                      </div>
                    )}
                  </a>
                </SidebarMenuButton>
             </SidebarMenuItem>
           )}

           <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={onToggleDark} 
                className="h-10 w-full flex items-center gap-3 px-3 rounded-lg text-white/60 hover:text-[var(--admin-yellow)] hover:bg-white/5 transition-colors group"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {!collapsed && <span className="text-sm font-medium">{isDark ? "Modo Claro" : "Modo Escuro"}</span>}
              </SidebarMenuButton>
           </SidebarMenuItem>
           <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-10 rounded-lg text-white/60 hover:text-[var(--admin-yellow)] hover:bg-white/5 transition-colors">
                <NavLink to="/" className="flex items-center gap-3 px-3">
                  <ExternalLink className="h-4 w-4" />
                  {!collapsed && <span className="text-sm font-medium">Visualizar Site</span>}
                </NavLink>
              </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
