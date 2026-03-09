import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer id="redes-sociais" className="border-t border-border/30 bg-header py-10">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-display font-bold text-foreground">Impacto FM</h3>
            <p className="text-sm text-secondary font-semibold">87.9 FM</p>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary transition-colors group">
              <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary transition-colors group">
              <Facebook className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary transition-colors group">
              <Youtube className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-green-600 transition-colors group">
              <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground" />
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 Impacto FM 87.9. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;