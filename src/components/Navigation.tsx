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
        const targetId = location.hash.replace("#", "");
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    e.preventDefault();
    setActiveItem(item.label);
    if (!item.isLink) {
      if (location.pathname !== "/") {
        navigate(`/${item.href}`);
      } else {
        const targetId = item.href.replace("#", "");
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
    <nav className="bg-nav border-b border-border/30">
      <div className="container px-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-center gap-2 py-3">
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
                onClick={(e) => handleClick(e, item)}
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
