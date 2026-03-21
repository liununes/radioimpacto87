import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Programação", href: "/programacao", isLink: true },
  { label: "Galeria", href: "#galeria" },
  { label: "Notícias", href: "#noticias-locais" },
  { label: "Sobre", href: "#sobre" },
];

const Navigation = () => {
  const [activeItem, setActiveItem] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          const targetId = location.hash.replace("#", "");
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        });
      }, 150);
    }
  }, [location]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    e.preventDefault();
    setActiveItem(item.label);
    if (!item.isLink) {
      if (location.pathname !== "/") {
        navigate({ pathname: "/", hash: item.href });
      } else {
        const targetId = item.href.replace("#", "");
        // Update URL hash directly instead of navigate when on the same page
        window.history.pushState(null, "", "/" + item.href); 
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } else {
      navigate(item.href);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-black/20 border-b border-white/5 backdrop-blur-md sticky top-[100px] z-[40]">
      <div className="container mx-auto px-6">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-center gap-1 py-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleClick(e, item)}
              className={`nav-link ${activeItem === item.label ? "nav-link-active" : ""}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center justify-between py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Navegação
          </span>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground p-1.5 bg-white/5 rounded-lg border border-white/10">
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 flex flex-col gap-2 border-t border-white/5 animate-in slide-in-from-top duration-300">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleClick(e, item)}
                className={`nav-link text-center ${activeItem === item.label ? "nav-link-active" : ""}`}
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
