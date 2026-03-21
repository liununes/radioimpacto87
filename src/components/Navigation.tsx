import { useState, useEffect } from "react";
import { Menu, X, Search, Moon } from "lucide-react";
import { getSiteConfig } from "@/lib/radioStore";
import { useTheme } from "@/hooks/useTheme";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const theme = useTheme();

  useEffect(() => {
    const loadSiteConfig = async () => {
      const config = await getSiteConfig("site");
      if (config) setSiteConfig(config);
    };
    loadSiteConfig();
  }, []);

  const navItems = [
    { label: theme.labels.navHome, href: "#home" },
    { label: theme.labels.navPromos, href: "#promocoes" },
    { label: theme.labels.navEntertainment, href: "#entretenimento" },
    { label: theme.labels.navMusic, href: "#musica" },
    { label: theme.labels.navSchedule, href: "#programacao" },
    { label: theme.labels.navAbout, href: "#sobre" },
    { label: theme.labels.navContact, href: "#contato" },
  ];

  return (
    <nav className="top-nav-clube sticky top-0 z-[100] border-b border-white/5 shadow-2xl">
      <div className="container mx-auto flex items-center justify-between gap-12">
        {/* Logo */}
        <div className="flex items-center gap-6 shrink-0">
          {siteConfig.logo ? (
            <img 
              src={siteConfig.logo} 
              alt="Logo" 
              className="h-16 md:h-20 object-contain hover:scale-110 transition-transform cursor-pointer"
            />
          ) : (
            <div className="h-16 md:h-20 flex items-center bg-white/5 px-4 rounded-xl border border-white/10 italic text-white font-black">
               LOGO
            </div>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[12px] font-black tracking-[0.2em] text-white hover:text-[var(--clube-yellow)] transition-all relative group"
            >
              {item.label}
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[var(--clube-yellow)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
          ))}
        </div>

        {/* Right Actions - Exactly like photo */}
        <div className="hidden lg:flex items-center gap-8 shrink-0">
          <div className="flex items-center gap-4 text-[11px] font-black text-white/50 border-r border-white/10 pr-8">
            <button className="hover:text-white transition-colors">A+</button>
            <button className="hover:text-white transition-colors">A-</button>
            <button className="hover:text-[var(--clube-yellow)] transition-colors"><Moon className="w-4 h-4 fill-white/20" /></button>
          </div>
          
          <div className="relative group flex items-center">
            <input 
              type="text" 
              placeholder="Buscar" 
              className="bg-transparent border border-[var(--clube-yellow)]/40 rounded-full px-6 py-2.5 text-xs text-white placeholder:text-white/60 focus:outline-none focus:border-[var(--clube-yellow)] w-36 focus:w-56 transition-all"
            />
            <Search className="w-4 h-4 text-[var(--clube-yellow)] absolute right-4 cursor-pointer hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-3 text-white bg-white/5 rounded-xl border border-white/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[var(--clube-blue)] border-t border-white/10 fixed top-[112px] left-0 right-0 bottom-0 z-50 p-10 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-white font-black tracking-widest text-2xl py-4 border-b border-white/5 active:text-[var(--clube-yellow)]"
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
