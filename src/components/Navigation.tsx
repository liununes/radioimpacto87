import { useState, useEffect } from "react";
import { Menu, X, Search, Moon } from "lucide-react";
import { getSiteConfig } from "@/lib/radioStore";
import { useTheme } from "@/hooks/useTheme";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const theme = useTheme();
  const location = useLocation();

  useEffect(() => {
    const loadSiteConfig = async () => {
      const site = await getSiteConfig("site");
      const streaming = await getSiteConfig("streaming");
      setSiteConfig({ ...(site || {}), ...(streaming || {}) });
    };
    loadSiteConfig();
  }, []);

  const defaultNavItems = [
    { label: "Home", href: "#home" },
    { label: "Promoções", href: "#promocoes", visible: theme.showPromos !== false },
    { label: theme.labels.navMusic || "MÚSICA", href: "#musica", visible: theme.showTopSongs },
    { label: "Programação", href: "#programacao", visible: theme.showProgramas },
    { label: "Sobre", href: "#sobre", visible: theme.showAbout },
    { label: "Contato", href: "#contato" },
  ].filter(item => item.visible !== false);

  const navItems = theme.navMenus && theme.navMenus.length > 0 ? theme.navMenus : defaultNavItems;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#") && location.pathname === "/") {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    // Else it follows the normal Link behavior to the path
  };

  return (
    <nav 
      className="top-nav-clube sticky top-0 z-[100] border-b border-white/5 shadow-2xl transition-all duration-500"
      style={{ 
        background: `linear-gradient(to right, var(--header-grad-start), var(--header-grad-end))`
      }}
    >
      <div className="container-fluid mx-auto px-6 md:px-12 flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/">
            {siteConfig.logo ? (
              <div className="relative group p-2">
                <div 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center bg-white shadow-2xl transition-all duration-500 group-hover:scale-105"
                  style={{ borderColor: 'var(--logo-circle-1)' }}
                >
                  <div 
                    className="w-full h-full rounded-full border-4 flex items-center justify-center overflow-hidden p-5"
                    style={{ borderColor: 'var(--logo-circle-2)' }}
                  >
                    <img 
                      src={siteConfig.logo} 
                      alt="Logo" 
                      className="max-w-full max-h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-14 md:h-18 flex items-center bg-white/5 px-4 rounded-xl border border-white/10 italic text-white font-black text-xs">
                 IMPACTO
              </div>
            )}
          </Link>
        </div>

        {/* Desktop Menu - Improved Layout to avoid 'embolado' */}
        <div className="hidden lg:flex items-center justify-center flex-1 gap-4 xl:gap-8">
          {navItems.map((item, idx) => {
            const isFirst = idx === 0;
            if (isFirst) {
              return (
                <Link
                  key={item.label}
                  to={item.href.startsWith("#") ? `/${item.href}` : item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="bg-[var(--clube-yellow)] text-[var(--clube-blue)] px-6 py-2.5 rounded-full text-[10px] xl:text-[11px] font-black tracking-[0.15em] hover:scale-105 transition-all uppercase shadow-lg shadow-yellow-400/20 whitespace-nowrap"
                  style={{ backgroundColor: theme.textSecondary, color: theme.clubeBlue }}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <Link
                key={item.label}
                to={item.href.startsWith("#") ? `/${item.href}` : item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-[10px] xl:text-[11px] font-black tracking-[0.15em] transition-all relative group py-2 whitespace-nowrap"
                style={{ color: location.pathname === "/" && item.href.startsWith("#") ? 'white' : 'white' /* Force white for nav on blue for now, or use dynamic */ }}
              >
                {item.label}
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--clube-yellow)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" style={{ backgroundColor: theme.textSecondary }} />
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6 shrink-0">
          <div className="flex items-center gap-3 text-[10px] font-black border-r border-white/5 pr-4 xl:pr-6" style={{ color: 'white' }}>
             <button className="hover:text-[var(--clube-yellow)] transition-colors"><Moon className="w-3.5 h-3.5" /></button>
          </div>
          
          <div className="relative group flex items-center">
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-white/5 border border-white/10 rounded-full px-4 xl:px-5 py-2 text-[10px] text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--clube-yellow)]/50 w-24 xl:w-32 focus:w-48 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[var(--clube-yellow)]/60 absolute right-4 pointer-events-none" />
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 text-white bg-white/5 rounded-lg border border-white/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[var(--clube-blue)] border-t border-white/10 fixed top-[80px] md:top-[100px] left-0 right-0 bottom-0 z-50 p-8 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top duration-300 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href.startsWith("#") ? `/${item.href}` : item.href}
              className="text-white font-black tracking-tighter text-3xl py-4 border-b border-white/5 flex justify-between items-center group active:text-[var(--clube-yellow)]"
              onClick={(e) => {
                handleNavClick(e, item.href);
                setIsMenuOpen(false);
              }}
            >
              {item.label}
              <span className="text-[var(--clube-yellow)] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
