import { Instagram, Facebook, Youtube, MessageCircle, Twitter, Music2, Globe } from "lucide-react";
import { getSiteConfig, getRedesSociais, type RedeSocial } from "@/lib/radioStore";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

const Footer = () => {
  const [siteConfig, setSiteConfig] = useState<any>({});
  const [redes, setRedes] = useState<RedeSocial[]>([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchConfig = async () => {
      const site = await getSiteConfig("site");
      const streaming = await getSiteConfig("streaming");
      setSiteConfig({ ...(site || {}), ...(streaming || {}) });
      setRedes(await getRedesSociais());
    };
    fetchConfig();
  }, []);

  const getIcon = (icone: string) => {
    switch (icone) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'tiktok': return <Music2 className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <footer id="redes-sociais" className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/10 py-16 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-6">
            {siteConfig.logo ? (
              <div 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex items-center justify-center bg-white shadow-xl hover:scale-105 transition-all duration-500"
                style={{ borderColor: 'var(--logo-circle-1)' }}
              >
                <div 
                  className="w-full h-full rounded-full border-4 flex items-center justify-center overflow-hidden p-3"
                  style={{ borderColor: 'var(--logo-circle-2)' }}
                >
                  <img 
                    src={siteConfig.logo} 
                    alt="Logo Footer" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="h-16 px-6 flex items-center bg-gray-50 rounded-2xl border border-gray-100 italic text-primary font-black text-sm uppercase">
                 Impacto
              </div>
            )}
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-left font-black uppercase tracking-tighter">
              <h3 className="text-lg leading-none" style={{ color: 'var(--text-title)' }}>{siteConfig.radioName || "Impacto FM"}</h3>
              <p className="text-accent text-sm mt-1">{theme.radioFreq || "105.5"} FM</p>
            </div>
          </div>

          {theme.showSocial && (
            <div className="flex items-center gap-4">
              {redes.map(rede => (
                <a key={rede.id} href={rede.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-white transition-all group text-gray-400 group-hover:text-white">
                  {getIcon(rede.icone)}
                </a>
              ))}
              {siteConfig.whatsapp && (
                <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] transition-all group text-gray-400 group-hover:text-white">
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          )}

          <div className="text-center flex flex-col items-center max-w-sm">
             <p className="text-[10px] font-bold uppercase tracking-widest leading-loose text-center" style={{ color: 'var(--text-content)' }}>
                {theme.labels.footerAbout}
             </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-[10px] font-black uppercase tracking-widest leading-loose" style={{ color: 'var(--text-content)' }}>
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