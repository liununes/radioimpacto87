import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import { getSiteConfig } from "@/lib/radioStore";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

const Footer = () => {
  const [siteConfig, setSiteConfig] = useState<any>({});
  const theme = useTheme();

  useEffect(() => {
    const fetchConfig = async () => {
      const site = await getSiteConfig("site");
      const streaming = await getSiteConfig("streaming");
      setSiteConfig({ ...(site || {}), ...(streaming || {}) });
    };
    fetchConfig();
  }, []);

  return (
    <footer id="redes-sociais" className="bg-white border-t border-gray-100 py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-6">
            <img 
              src={siteConfig.logo || "https://clube.fm/wp-content/uploads/2021/05/cropped-favicon-clube-192x192.png"} 
              alt="Logo Clube" 
              className="h-16 object-contain"
            />
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-left font-black uppercase tracking-tighter">
              <h3 className="text-lg text-primary leading-none">{siteConfig.radioName || "Impacto FM"}</h3>
              <p className="text-accent text-sm mt-1">{theme.radioFreq || "105.5"} FM</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-accent hover:border-accent transition-all group">
              <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </a>
            <a href="#" className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-accent hover:border-accent transition-all group">
              <Facebook className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </a>
            <a href="#" className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-accent hover:border-accent transition-all group">
              <Youtube className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </a>
            <a href="#" className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] transition-all group">
              <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </a>
          </div>

          <div className="text-center flex flex-col items-center max-w-sm">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-loose text-center">
                {theme.labels.footerAbout}
             </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-loose">
              © {new Date().getFullYear()} {siteConfig.radioName || "IMPACTO FM"}.<br/>
              {theme.labels.footerRights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;