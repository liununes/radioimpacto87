import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const BackToTop = () => {
  const [show, setShow] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!theme.showBackToTop || !show) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-32 right-8 md:bottom-48 md:right-12 z-[90] w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 border-4 border-white/5 backdrop-blur-md"
      aria-label="Voltar ao Topo"
    >
      <ChevronUp className="w-8 h-8" />
    </button>
  );
};

export default BackToTop;
