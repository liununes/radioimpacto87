import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Programação", href: "#programacao" },
  { label: "Galeria", href: "#galeria" },
  { label: "Notícias", href: "#noticias-locais" },
  { label: "Sobre", href: "#sobre" },
];

const Navigation = () => {
  const [activeItem, setActiveItem] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-nav border-b border-border/30">
      <div className="container px-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-center gap-2 py-3">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setActiveItem(item.label)}
              className={`nav-link ${activeItem === item.label ? "nav-link-active" : ""}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center justify-between py-3">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-foreground p-1"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  setActiveItem(item.label);
                  setIsMenuOpen(false);
                }}
                className={`nav-link ${activeItem === item.label ? "nav-link-active" : ""}`}
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