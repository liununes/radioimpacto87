import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Radio, ChevronDown, Instagram, Facebook, Youtube, Twitter, Music2, Globe, MessageCircle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import WeatherWidget from "./WeatherWidget";
import { Button } from "./ui/button";
import { getRedesSociais, type RedeSocial, getWhatsApp } from "@/lib/radioStore";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [redes, setRedes] = useState<RedeSocial[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const theme = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    const fetchData = async () => {
       const [redesData, wa] = await Promise.all([getRedesSociais(), getWhatsApp()]);
       setRedes(redesData);
       setWhatsapp(wa);
    };
    fetchData();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const defaultNavItems = [
    { label: "Home", href: "/" },
    { label: "Promoções", href: "#promocoes", visible: theme.showPromos !== false },
    { label: theme.labels.navMusic || "MÚSICA", href: "#musica", visible: theme.showTopSongs },
    { label: "Programação", href: "/programacao", visible: theme.showProgramas },
    { label: "Sobre", href: "#sobre", visible: theme.showAbout },
    { label: "Contato", href: "#contato" },
  ].filter(item => item.visible !== false);

  const navItems = (theme.navMenus && theme.navMenus.length > 0 ? theme.navMenus : defaultNavItems).filter(item => {
    if (item.label === "Promoções") return theme.showPromos !== false;
    if (item.label === "Música" || item.label === "MÚSICA" || item.label === theme.labels.navMusic) return theme.showTopSongs !== false;
    if (item.label === "Programação") return theme.showProgramas !== false;
    if (item.label === "Sobre") return theme.showAbout !== false;
    return true;
  });

  const getLinkTo = (href: string) => {
    if (href === "#programacao" || href === "programacao") return "/programacao";
    if (href === "/" || href === "home") return "/";
    if (href.startsWith("#")) return `/${href}`;
    return href;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = getLinkTo(href);
    
    // Se for uma âncora na mesma página (Home)
    if (target.startsWith("/#") && location.pathname === "/") {
      const id = target.substring(2);
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const getIcon = (icone: string) => {
    switch (icone) {
      case 'instagram': return <Instagram className="w-6 h-6" />;
      case 'facebook': return <Facebook className="w-6 h-6" />;
      case 'youtube': return <Youtube className="w-6 h-6" />;
      case 'twitter': return <Twitter className="w-6 h-6" />;
      case 'tiktok': return <Music2 className="w-6 h-6" />;
      default: return <Globe className="w-6 h-6" />;
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${isScrolled ? "py-3 shadow-2xl backdrop-blur-xl" : "py-6 shadow-lg backdrop-blur-md"}`}
      style={{
        background: `linear-gradient(to right, var(--header-grad-start), var(--header-grad-end))`,
        opacity: isScrolled ? 0.95 : 0.9
      }}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between gap-8">
          {/* Logo Section - BIGGER and MORE VISIBLE */}
          <Link to="/" className="flex items-center gap-5 shrink-0 group">
            <div 
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden p-3"
              style={{
                background: `linear-gradient(135deg, var(--logo-circle-1), var(--logo-circle-2))`
              }}
            >
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
              {theme.logo ? (
                <img src={theme.logo} alt="Logo" className="w-full h-full object-contain relative z-10" />
              ) : (
                <Radio className="w-8 h-8 md:w-10 md:h-10 relative z-10" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-black tracking-tighter leading-none uppercase italic drop-shadow-md text-white">
                {theme.radioName || "IMPACTO"}
              </span>
              <span className="text-[11px] font-black tracking-[0.4em] text-accent uppercase drop-shadow-sm">{theme.radioFreq || "87.9"} FM</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-8 shrink-0">
            <WeatherWidget showWeather={theme.showWeather} />
            
            {/* Social Icons in Nav - Larger and more visible */}
            {theme.showSocial && redes.length > 0 && (
              <div className="hidden md:flex items-center gap-5 ml-6 pl-6 border-l border-white/20">
                {redes.map(rede => (
                  <a key={rede.id} href={rede.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent hover:scale-125 transition-all duration-300 transform">
                    {getIcon(rede.icone)}
                  </a>
                ))}
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#25D366] hover:scale-125 transition-all duration-300 transform">
                    <MessageCircle className="w-6 h-6" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-4 xl:gap-8">
            {navItems.map((item, idx) => {
              const toValue = getLinkTo(item.href);
              const isActive = location.pathname === toValue;

              return (
                <Link
                  key={item.label}
                  to={toValue}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`text-[10px] xl:text-[11px] font-black tracking-[0.15em] transition-all relative group py-2 whitespace-nowrap ${isActive ? "text-accent" : ""}`}
                  style={{ color: isActive ? 'var(--nav-item-active)' : 'var(--nav-item-color)' }}
                >
                  {item.label}
                  <div className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--nav-item-active)] transition-transform origin-left ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            className="lg:hidden w-12 h-12 rounded-xl bg-primary/5 dark:bg-white/5 flex items-center justify-center text-primary dark:text-white"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Fullscreen Menu */}
      <div className={`fixed inset-0 z-[200] bg-primary transition-all duration-700 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="container h-full mx-auto px-8 py-12 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-20">
            <span className="text-white text-2xl font-black italic tracking-tighter">MENU</span>
            <button 
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={getLinkTo(item.href)}
                className="font-black tracking-tighter text-4xl py-4 border-b border-white/5 text-white/40 hover:text-white transition-all flex justify-between items-center group"
                onClick={(e) => {
                  handleNavClick(e, item.href);
                  setIsMenuOpen(false);
                }}
              >
                {item.label}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            ))}
          </div>
          
          {/* Social icons in mobile menu too */}
          {theme.showSocial && redes.length > 0 && (
             <div className="flex items-center gap-6 mt-12 py-8 border-t border-white/5">
                {redes.map(rede => (
                  <a key={rede.id} href={rede.url} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white text-3xl transition-colors">
                    {getIcon(rede.icone)}
                  </a>
                ))}
             </div>
          )}

          <div className="mt-auto pt-10 border-t border-white/5 text-white/30">
             <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
                Impacto FM 87.9<br/>
                A Rádio que toca o seu coração.
             </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
