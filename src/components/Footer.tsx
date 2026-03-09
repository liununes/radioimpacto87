import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import { getSiteConfig } from "@/lib/siteConfig";

const Footer = () => {
  const config = getSiteConfig();

  const socials = [
    { icon: Instagram, url: config.socialInstagram, label: "Instagram" },
    { icon: Facebook, url: config.socialFacebook, label: "Facebook" },
    { icon: Youtube, url: config.socialYoutube, label: "YouTube" },
    { icon: MessageCircle, url: config.socialWhatsapp, label: "WhatsApp" },
  ].filter(s => s.url);

  return (
    <footer id="contato" className="border-t border-border/20 py-10" style={{ backgroundColor: config.colorHeaderBg }}>
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: `'${config.fontHeading}', sans-serif` }}>
              {config.radioName}
            </h3>
            <p className="text-sm text-secondary font-semibold">{config.radioFreq} FM</p>
            {config.radioSlogan && <p className="text-sm text-muted-foreground mt-2">{config.radioSlogan}</p>}
          </div>

          {/* Contact */}
          <div>
            {config.address && <p className="text-sm text-muted-foreground">{config.address}</p>}
            {config.phone && <p className="text-sm text-muted-foreground mt-1">📞 {config.phone}</p>}
            {config.email && <p className="text-sm text-muted-foreground mt-1">✉ {config.email}</p>}
          </div>

          {/* Social */}
          <div>
            {socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map((social) => (
                  <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: config.colorPrimary + '33' }}
                    title={social.label}>
                    <social.icon className="w-5 h-5 text-foreground" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground">{config.footerText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
