import { useState } from "react";
import { Menu, X } from "lucide-react";
import { getSiteConfig } from "@/lib/siteConfig";

const navItems = [
  { label: "Início", href: "#home" },
  { label: "Ao Vivo", href: "#ao-vivo" },
  { label: "Programação", href: "#programacao" },
  { label: "Notícias", href: "#noticias" },
  { label: "Promoções", href: "#promocoes" },
  { label: "Contato", href: "#contato" },
];

const Navigation = () => {
  const [activeItem, setActiveItem] = useState("Início");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const config = getSiteConfig();

  return (
    <nav style={{ backgroundColor: config.colorNavBg }}>
      <div className="container px-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-center gap-1 py-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setActiveItem(item.label)}
              className={`px-5 py-2 rounded-sm text-sm font-medium transition-all ${
                activeItem === item.label
                  ? "text-secondary font-bold border-b-2 border-secondary"
                  : "text-foreground/80 hover:text-foreground hover:bg-white/10"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center justify-between py-3">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground p-1">
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => { setActiveItem(item.label); setIsMenuOpen(false); }}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeItem === item.label ? "text-secondary bg-white/10" : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
