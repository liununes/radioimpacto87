import { useState, useEffect } from "react";
import { Menu, X, Search, SunMoon } from "lucide-react";
import { getSiteConfig } from "@/lib/radioStore";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<any>({});

  useEffect(() => {
    const loadSiteConfig = async () => {
      const config = await getSiteConfig("site");
      if (config) setSiteConfig(config);
    };
    loadSiteConfig();
  }, []);

  const navItems = [
    { label: "AO VIVO", href: "#home" },
    { label: "PROMOÇÕES", href: "#promocoes" },
    { label: "ENTRETENIMENTO", href: "#entretenimento" },
    { label: "MÚSICA", href: "#musica" },
    { label: "PROGRAMAÇÃO", href: "#programacao" },
    { label: "A CLUBE", href: "#sobre" },
    { label: "CONTATO", href: "#contato" },
  ];

  return (
    <nav className="top-nav-clube sticky top-0 z-[100] px-6">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img 
            src={siteConfig.logo || "https://clube.fm/wp-content/uploads/2021/05/cropped-favicon-clube-192x192.png"} 
            alt="Logo Clube" 
            className="h-12 md:h-16 object-contain"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[11px] font-black tracking-widest text-white/90 hover:text-[var(--clube-yellow)] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/60">
            <span>A+</span>
            <span>A-</span>
            <SunMoon className="w-4 h-4" />
          </div>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Buscar" 
              className="bg-[var(--clube-yellow)]/20 border border-[var(--clube-yellow)]/50 rounded-full px-4 py-1.5 text-xs text-white placeholder:text-white/60 focus:outline-none focus:bg-[var(--clube-yellow)]/30 w-32 focus:w-48 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[var(--clube-yellow)] absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[var(--clube-blue)] border-t border-white/10 absolute top-full left-0 right-0 p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top duration-300">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-white font-bold tracking-widest text-sm py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
