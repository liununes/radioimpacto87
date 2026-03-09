export interface SiteConfig {
  // Identidade
  radioName: string;
  radioFreq: string;
  radioSlogan: string;
  streamUrl: string;

  // Cores (hex)
  colorPrimary: string;
  colorSecondary: string;
  colorBackground: string;
  colorHeaderBg: string;
  colorNavBg: string;
  colorCardBg: string;
  colorText: string;
  colorTextMuted: string;

  // Fontes
  fontHeading: string;
  fontBody: string;

  // Redes Sociais
  socialInstagram: string;
  socialFacebook: string;
  socialYoutube: string;
  socialWhatsapp: string;
  socialTiktok: string;

  // Sobre
  about: string;
  address: string;
  phone: string;
  email: string;

  // Rodapé
  footerText: string;
}

const STORAGE_KEY = "radio_site_config";

const defaultConfig: SiteConfig = {
  radioName: "Impacto FM",
  radioFreq: "87.9",
  radioSlogan: "A rádio que conecta você!",
  streamUrl: "https://stream.zeno.fm/yn65fsaurfhvv",

  colorPrimary: "#2563eb",
  colorSecondary: "#eab308",
  colorBackground: "#0f172a",
  colorHeaderBg: "#1e293b",
  colorNavBg: "#1e3a8a",
  colorCardBg: "#1e293b",
  colorText: "#f8fafc",
  colorTextMuted: "#94a3b8",

  fontHeading: "Poppins",
  fontBody: "Inter",

  socialInstagram: "",
  socialFacebook: "",
  socialYoutube: "",
  socialWhatsapp: "",
  socialTiktok: "",

  about: "",
  address: "",
  phone: "",
  email: "",

  footerText: "© 2026 Impacto FM. Todos os direitos reservados.",
};

export function getSiteConfig(): SiteConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...defaultConfig, ...saved };
  } catch {
    return defaultConfig;
  }
}

export function saveSiteConfig(config: SiteConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  applySiteConfig(config);
}

function hexToHSL(hex: string): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applySiteConfig(config: SiteConfig) {
  const root = document.documentElement;
  root.style.setProperty("--primary", hexToHSL(config.colorPrimary));
  root.style.setProperty("--secondary", hexToHSL(config.colorSecondary));
  root.style.setProperty("--background", hexToHSL(config.colorBackground));
  root.style.setProperty("--foreground", hexToHSL(config.colorText));
  root.style.setProperty("--header-bg", hexToHSL(config.colorHeaderBg));
  root.style.setProperty("--nav-bg", hexToHSL(config.colorNavBg));
  root.style.setProperty("--card", hexToHSL(config.colorCardBg));
  root.style.setProperty("--card-foreground", hexToHSL(config.colorText));
  root.style.setProperty("--muted-foreground", hexToHSL(config.colorTextMuted));
  root.style.setProperty("--accent", hexToHSL(config.colorPrimary));

  root.style.setProperty("--font-heading", config.fontHeading);
  root.style.setProperty("--font-body", config.fontBody);
  document.body.style.fontFamily = `'${config.fontBody}', system-ui, sans-serif`;
}

export { defaultConfig };
